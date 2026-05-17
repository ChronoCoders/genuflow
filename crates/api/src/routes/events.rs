#![deny(warnings)]

use axum::{
    extract::{Extension, Path, State},
    Json,
};
use common::{AppError, EventType, ProvenanceEvent};
use serde::Deserialize;
use serde_json::Value;
use uuid::Uuid;

use crate::state::AppState;

#[derive(Deserialize)]
pub struct RecordEventRequest {
    pub event_type: EventType,
    pub detail: Option<Value>,
}

pub async fn record(
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
    Path(product_id): Path<Uuid>,
    Json(body): Json<RecordEventRequest>,
) -> Result<Json<ProvenanceEvent>, AppError> {
    // Tenant isolation: product must belong to the authenticated brand.
    db::products::get_by_id_for_brand(&state.db, product_id, brand_id)
        .await?
        .ok_or(AppError::NotFound)?;

    let event = db::events::create(
        &state.db,
        product_id,
        &body.event_type,
        body.detail.as_ref(),
    )
    .await?;
    Ok(Json(event))
}
