#![deny(warnings)]

use axum::{
    extract::{Request, State},
    middleware::Next,
    response::Response,
};
use common::AppError;

use crate::auth::{jwt, UserId, SESSION_COOKIE};
use crate::state::AppState;

/// Require a valid session cookie. Injects both the `brand_id` (as `Uuid`)
/// and the `UserId` into request extensions on success.
///
/// Used by routes that specifically need the human-user identity, like
/// `/auth/me`. Routes that only need a brand should use the composed
/// `require_api_key` middleware instead.
pub async fn require_session(
    State(state): State<AppState>,
    mut req: Request,
    next: Next,
) -> Result<Response, AppError> {
    let token = session_cookie(&req).ok_or(AppError::Unauthorized)?;
    let claims = jwt::verify(&state.auth.jwt_secret, &token)?;
    req.extensions_mut().insert(claims.brand_id);
    req.extensions_mut().insert(UserId(claims.sub));
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
