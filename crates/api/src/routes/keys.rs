#![deny(warnings)]

use axum::{
    extract::{Extension, Path, State},
    Json,
};
use common::AppError;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use uuid::Uuid;

use crate::state::AppState;

#[derive(Deserialize)]
pub struct CreateKeyRequest {
    pub label: Option<String>,
}

#[derive(Serialize)]
pub struct CreateKeyResponse {
    pub id: Uuid,
    pub key: String,
}

pub async fn create_key(
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
    Json(body): Json<CreateKeyRequest>,
) -> Result<Json<CreateKeyResponse>, AppError> {
    let plain = format!("gf_{}", Uuid::new_v4().simple());
    let key_hash = hex::encode(Sha256::digest(plain.as_bytes()));

    let api_key =
        db::api_keys::create(&state.db, brand_id, &key_hash, body.label.as_deref()).await?;

    Ok(Json(CreateKeyResponse {
        id: api_key.id,
        key: plain,
    }))
}

pub async fn revoke_key(
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Tenant isolation: only the owning brand may revoke its own keys.
    let existing = db::api_keys::get_by_id(&state.db, id)
        .await?
        .ok_or(AppError::NotFound)?;
    if existing.brand_id != brand_id {
        return Err(AppError::NotFound);
    }

    db::api_keys::revoke(&state.db, id)
        .await?
        .ok_or(AppError::NotFound)?;

    Ok(Json(serde_json::json!({ "revoked": true })))
}
