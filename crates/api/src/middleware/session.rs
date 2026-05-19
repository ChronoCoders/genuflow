#![deny(warnings)]

use axum::{
    extract::{Request, State},
    middleware::Next,
    response::Response,
};
use common::AppError;

use crate::auth::{jwt, UserId, SESSION_COOKIE};
use crate::state::AppState;

/// Require a valid session cookie. Injects `brand_id` (`Uuid`),
/// `UserId`, and the user's `UserRole` into request extensions on
/// success.
///
/// The role is read fresh from the database on every request so that a
/// role change (PATCH /v1/team/:id/role) takes effect immediately
/// without waiting for the session JWT to roll over. The user's own
/// JWT contains only sub + brand_id; role is never encoded in the
/// token itself.
///
/// Used by routes that specifically need the human-user identity,
/// like `/auth/me` and `/v1/team/*`. Routes that only need a brand
/// should use the composed `require_api_key` middleware instead.
pub async fn require_session(
    State(state): State<AppState>,
    mut req: Request,
    next: Next,
) -> Result<Response, AppError> {
    let token = session_cookie(&req).ok_or(AppError::Unauthorized)?;
    let claims = jwt::verify(&state.auth.jwt_secret, &token)?;
    let user = db::users::get_by_id(&state.db, claims.sub)
        .await?
        .ok_or(AppError::Unauthorized)?;

    req.extensions_mut().insert(claims.brand_id);
    req.extensions_mut().insert(UserId(claims.sub));
    req.extensions_mut().insert(user.role);
    Ok(next.run(req).await)
}

/// Extract the `gf_session` cookie value from the request, if present.
pub(crate) fn session_cookie(req: &Request) -> Option<String> {
    let header = req.headers().get(axum::http::header::COOKIE)?.to_str().ok()?;
    let prefix = format!("{SESSION_COOKIE}=");
    header
        .split(';')
        .map(|part| part.trim())
        .find_map(|part| part.strip_prefix(&prefix))
        .map(|v| v.to_string())
}

/// Build a Set-Cookie header value for an active session.
pub fn build_session_cookie(token: &str, secure: bool, max_age_secs: i64) -> String {
    let secure_attr = if secure { "; Secure" } else { "" };
    format!(
        "{SESSION_COOKIE}={token}; HttpOnly; SameSite=Lax; Path=/; Max-Age={max_age_secs}{secure_attr}"
    )
}

/// Build a Set-Cookie header value that clears the session cookie.
pub fn clear_session_cookie(secure: bool) -> String {
    let secure_attr = if secure { "; Secure" } else { "" };
    format!("{SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0{secure_attr}")
}
