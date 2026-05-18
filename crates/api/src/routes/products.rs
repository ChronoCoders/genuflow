#![deny(warnings)]

use axum::{
    extract::{Extension, Path, Query, State},
    Json,
};
use common::{AppError, Product, ProvenanceEvent};
use serde::Deserialize;
use serde_json::Value;
use uuid::Uuid;

use crate::routes::PageParams;
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

/// `GET /v1/products` — paginated list of products owned by the
/// authenticated brand, newest first.
pub async fn list(
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
    Query(page): Query<PageParams>,
) -> Result<Json<Vec<Product>>, AppError> {
    let (limit, offset) = page.normalized();
    let items = db::products::list_by_brand(&state.db, brand_id, limit, offset).await?;
    Ok(Json(items))
}

/// `GET /v1/products/:id/events` — chronological event list for a product
/// owned by the authenticated brand.
pub async fn list_events(
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
    Path(id): Path<Uuid>,
) -> Result<Json<Vec<ProvenanceEvent>>, AppError> {
    db::products::get_by_id_for_brand(&state.db, id, brand_id)
        .await?
        .ok_or(AppError::NotFound)?;
    let events = db::events::list_by_product(&state.db, id).await?;
    Ok(Json(events))
}
