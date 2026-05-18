#![deny(warnings)]

use axum::{
    extract::{Request, State},
    middleware::Next,
    response::Response,
};
use common::AppError;
use sha2::{Digest, Sha256};

use crate::auth::jwt;
use crate::middleware::session::session_cookie;
use crate::state::AppState;

/// Authenticate the requesting brand from either a session cookie (set by
/// the dashboard login flow) or an `X-API-Key` header (used by
/// machine-to-machine integrations). Whichever yields a `brand_id` first
/// is accepted; if neither does, the request is rejected with 401.
///
/// The handler downstream receives the `brand_id` as an `Extension<Uuid>`
/// and does not need to know which auth path was used.
pub async fn require_api_key(
    State(state): State<AppState>,
    mut req: Request,
    next: Next,
) -> Result<Response, AppError> {
    if let Some(token) = session_cookie(&req) {
        if let Ok(claims) = jwt::verify(&state.auth.jwt_secret, &token) {
            req.extensions_mut().insert(claims.brand_id);
            return Ok(next.run(req).await);
        }
    }

    let key = req
        .headers()
        .get("X-API-Key")
        .and_then(|v| v.to_str().ok())
        .ok_or(AppError::Unauthorized)?;

    let key_hash = hex::encode(Sha256::digest(key.as_bytes()));
    let api_key = db::api_keys::get_active_by_hash(&state.db, &key_hash)
        .await?
        .ok_or(AppError::Unauthorized)?;

    req.extensions_mut().insert(api_key.brand_id);
    Ok(next.run(req).await)
}
