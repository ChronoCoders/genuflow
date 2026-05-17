#![deny(warnings)]

use axum::{
    extract::{Request, State},
    middleware::Next,
    response::Response,
};
use common::AppError;
use sha2::{Digest, Sha256};
use crate::state::AppState;

/// Extract and validate X-API-Key header.
///
/// Resolves brand_id from key hash and injects it into request extensions.
pub async fn require_api_key(
    State(state): State<AppState>,
    mut req: Request,
    next: Next,
) -> Result<Response, AppError> {
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
