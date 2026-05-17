#![deny(warnings)]

use axum::{
    extract::{Path, State},
    Json,
};
use common::AppError;
use serde::Serialize;
use uuid::Uuid;

use crate::state::AppState;

#[derive(Serialize)]
pub struct VerifyResponse {
    pub product: common::PublicProduct,
    pub brand: common::Brand,
    pub events: Vec<common::ProvenanceEvent>,
    pub latest_anchor: Option<common::AnchorBatch>,
}

pub async fn verify(
    State(state): State<AppState>,
    Path(product_id): Path<Uuid>,
) -> Result<Json<VerifyResponse>, AppError> {
    let product = db::products::get_by_id(&state.db, product_id)
        .await?
        .ok_or(AppError::NotFound)?;

    let brand = db::brands::get_by_id(&state.db, product.brand_id)
        .await?
        .ok_or(AppError::NotFound)?;

    let events = db::events::list_by_product(&state.db, product_id).await?;

    let latest_anchor = db::anchors::latest_for_product(&state.db, product_id).await?;

    Ok(Json(VerifyResponse {
        product: product.into(),
        brand,
        events,
        latest_anchor,
    }))
}
