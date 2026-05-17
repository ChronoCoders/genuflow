#![deny(warnings)]

use axum::{
    extract::{Extension, Path, State},
    Json,
};
use common::{AppError, Product};
use serde::Deserialize;
use serde_json::Value;
use uuid::Uuid;

use crate::state::AppState;

#[derive(Deserialize)]
pub struct RegisterProductRequest {
    pub name: String,
    pub external_ref: Option<String>,
    pub metadata: Option<Value>,
}

pub async fn register(
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
    Json(body): Json<RegisterProductRequest>,
) -> Result<Json<Product>, AppError> {
    let product = db::products::create(
        &state.db,
        brand_id,
        &body.name,
        body.external_ref.as_deref(),
        body.metadata.as_ref(),
    )
    .await?;
    Ok(Json(product))
}

pub async fn get(
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
    Path(id): Path<Uuid>,
) -> Result<Json<Product>, AppError> {
    let product = db::products::get_by_id_for_brand(&state.db, id, brand_id)
        .await?
        .ok_or(AppError::NotFound)?;
    Ok(Json(product))
}
