#![deny(warnings)]

//! Auth handlers — register, login, logout, me.

use std::sync::OnceLock;

use axum::{
    extract::{Extension, Path, State},
    http::{header::SET_COOKIE, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use common::{AppError, Plan, SubscriptionStatus, UserRole};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::auth::{jwt, password, UserId, SESSION_TTL_SECS};
use crate::middleware::session::{build_session_cookie, clear_session_cookie};
use crate::state::AppState;

#[derive(Deserialize)]
pub struct RegisterRequest {
    pub brand_name: String,
    pub email: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct MeResponse {
    pub user_id: Uuid,
    pub brand_id: Uuid,
    pub email: String,
    pub brand_name: String,
    pub brand_slug: String,
    pub custom_domain: Option<String>,
    pub role: UserRole,
}

/// `POST /auth/register` — create a brand + first user, then sign a session.
pub async fn register(
    State(state): State<AppState>,
    Json(body): Json<RegisterRequest>,
) -> Result<Response, AppError> {
    let brand_name = body.brand_name.trim();
    if brand_name.is_empty() {
        return Err(AppError::BadRequest("brand_name is required".into()));
    }
    let slug = slugify(brand_name);
    if slug.is_empty() {
        return Err(AppError::BadRequest(
            "brand_name must contain alphanumeric characters".into(),
        ));
    }

    let email = body.email.trim().to_ascii_lowercase();
    if email.is_empty() || !email.contains('@') {
        return Err(AppError::BadRequest("a valid email is required".into()));
    }

    if body.password.len() < 12 {
        return Err(AppError::BadRequest(
            "password must be at least 12 characters".into(),
        ));
    }

    let password_hash = password::hash(&body.password)?;

    let brand = db::brands::create(&state.db, brand_name, &slug)
        .await
        .map_err(|e| {
            if is_unique_violation(&e) {
                AppError::Conflict("a brand with that name already exists".into())
            } else {
                AppError::Database(e)
            }
        })?;

    let user = db::users::create(&state.db, brand.id, &email, &password_hash, UserRole::Owner)
        .await
        .map_err(|e| {
            if is_unique_violation(&e) {
                AppError::Conflict("an account with that email already exists".into())
            } else {
                AppError::Database(e)
            }
        })?;

    // Every new brand starts on the Atelier plan. The row is unique on
    // brand_id, so the worst case for a duplicate registration is a 23505,
    // which the brand-create above would already have surfaced.
    db::subscriptions::create(&state.db, brand.id, Plan::Atelier, SubscriptionStatus::Active)
        .await?;

    let token = jwt::sign(&state.auth.jwt_secret, user.id, brand.id)?;
    let cookie = build_session_cookie(&token, state.auth.cookie_secure, SESSION_TTL_SECS);

    let mut response = StatusCode::CREATED.into_response();
    set_cookie(&mut response, &cookie)?;
    Ok(response)
}

/// `POST /auth/login` — verify credentials and sign a session.
///
/// When no user exists for the supplied email we still run an argon2
/// verification against a static dummy hash. This keeps the wall-clock
/// time of the login handler roughly constant regardless of whether the
/// email is registered, closing the user-existence timing side channel.
pub async fn login(
    State(state): State<AppState>,
    Json(body): Json<LoginRequest>,
) -> Result<Response, AppError> {
    let email = body.email.trim().to_ascii_lowercase();
    let user_opt = db::users::get_by_email(&state.db, &email).await?;

    let stored_hash = user_opt
        .as_ref()
        .map(|u| u.password_hash.as_str())
        .unwrap_or_else(|| dummy_hash().as_str());

    // Errors from password::verify only occur on a malformed stored hash
    // (DB corruption); treat as a failed match so we still 401 instead of
    // leaking timing via an early Internal error path.
    let matches = password::verify(&body.password, stored_hash).unwrap_or(false);

    let user = match (user_opt, matches) {
        (Some(u), true) => u,
        _ => return Err(AppError::Unauthorized),
    };

    let token = jwt::sign(&state.auth.jwt_secret, user.id, user.brand_id)?;
    let cookie = build_session_cookie(&token, state.auth.cookie_secure, SESSION_TTL_SECS);

    let mut response = StatusCode::OK.into_response();
    set_cookie(&mut response, &cookie)?;
    Ok(response)
}

/// Static dummy argon2id PHC string, computed once on first use. Verifying
/// any password against it takes the same wall-clock time as a real
/// verification, equalizing the login handler's runtime when the email
/// does not exist.
fn dummy_hash() -> &'static String {
    static DUMMY: OnceLock<String> = OnceLock::new();
    DUMMY.get_or_init(|| {
        // The argon2 RustCrypto implementation does not fail under any
        // realistic condition; fall back to an empty string only as a
        // type-safe last resort (verify against "" yields Err → no match,
        // preserving the 401 outcome even if the timing equalization is
        // briefly lost on the very first login of the process lifetime).
        password::hash("dummy-password-for-timing-equalization").unwrap_or_default()
    })
}

#[derive(Deserialize)]
pub struct AcceptInviteRequest {
    pub password: String,
}

/// `POST /auth/accept-invite/:token` — public, no auth. Exchange an
/// invite token for a new user account.
///
/// The invite is *claimed atomically* via a single `UPDATE ... RETURNING`:
/// the same token cannot be redeemed by two concurrent submissions, and
/// expired/already-accepted invites are filtered out by the same
/// statement. A non-claimable token returns a single generic 400 — we
/// do not oracle whether it was invalid, expired, or already used.
///
/// If user creation fails after the claim (most realistically a 23505
/// from `users.email`), the invite remains marked accepted. That is the
/// correct outcome for the conflict case — the email is already a
/// user, so the invite is rightly burned.
pub async fn accept_invite(
    State(state): State<AppState>,
    Path(token): Path<uuid::Uuid>,
    Json(body): Json<AcceptInviteRequest>,
) -> Result<Response, AppError> {
    if body.password.len() < 12 {
        return Err(AppError::BadRequest(
            "password must be at least 12 characters".into(),
        ));
    }

    let invite = db::invites::claim_by_token(&state.db, token)
        .await?
        .ok_or_else(|| {
            AppError::BadRequest("invite is invalid, expired, or already accepted".into())
        })?;

    let password_hash = password::hash(&body.password)?;

    let user =
        db::users::create(&state.db, invite.brand_id, &invite.email, &password_hash, invite.role)
            .await
            .map_err(|e| {
                if is_unique_violation(&e) {
                    AppError::Conflict("an account with that email already exists".into())
                } else {
                    AppError::Database(e)
                }
            })?;

    let jwt_token = jwt::sign(&state.auth.jwt_secret, user.id, invite.brand_id)?;
    let cookie = build_session_cookie(&jwt_token, state.auth.cookie_secure, SESSION_TTL_SECS);

    let mut response = StatusCode::CREATED.into_response();
    set_cookie(&mut response, &cookie)?;
    Ok(response)
}

/// `POST /auth/logout` — clear the session cookie. Always 204.
pub async fn logout(State(state): State<AppState>) -> Result<Response, AppError> {
    let cookie = clear_session_cookie(state.auth.cookie_secure);
    let mut response = StatusCode::NO_CONTENT.into_response();
    set_cookie(&mut response, &cookie)?;
    Ok(response)
}

/// `GET /auth/me` — return the current user's profile. Requires a valid
/// session (the `require_session` middleware injects `UserId` and
/// `brand_id`).
pub async fn me(
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
    Extension(UserId(user_id)): Extension<UserId>,
) -> Result<Json<MeResponse>, AppError> {
    let user = db::users::get_by_id(&state.db, user_id)
        .await?
        .ok_or(AppError::Unauthorized)?;
    let brand = db::brands::get_by_id(&state.db, brand_id)
        .await?
        .ok_or(AppError::Unauthorized)?;

    Ok(Json(MeResponse {
        user_id: user.id,
        brand_id: brand.id,
        email: user.email,
        brand_name: brand.name,
        brand_slug: brand.slug,
        custom_domain: brand.custom_domain,
        role: user.role,
    }))
}

fn set_cookie(response: &mut Response, value: &str) -> Result<(), AppError> {
    let header = HeaderValue::from_str(value)
        .map_err(|e| AppError::Internal(format!("invalid cookie value: {e}")))?;
    response.headers_mut().append(SET_COOKIE, header);
    Ok(())
}

fn is_unique_violation(err: &sqlx::Error) -> bool {
    err.as_database_error()
        .and_then(|e| e.code())
        .is_some_and(|code| code == "23505")
}

/// Lowercase + collapse non-alphanumerics to single dashes. Empty input or
/// input with no alphanumerics yields an empty string (caller rejects).
fn slugify(input: &str) -> String {
    let mut out = String::with_capacity(input.len());
    let mut prev_dash = true;
    for ch in input.chars() {
        if ch.is_ascii_alphanumeric() {
            out.push(ch.to_ascii_lowercase());
            prev_dash = false;
        } else if !prev_dash {
            out.push('-');
            prev_dash = true;
        }
    }
    while out.ends_with('-') {
        out.pop();
    }
    out
}
