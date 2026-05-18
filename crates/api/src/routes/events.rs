#![deny(warnings)]

use axum::{
    extract::{Extension, Path, Query, State},
    Json,
};
use common::{AppError, EventType, ProvenanceEvent};
use db::events::AnchorStatusFilter;
use serde::Deserialize;
use serde_json::Value;
use uuid::Uuid;

use crate::state::AppState;

#[derive(Deserialize)]
pub struct RecordEventRequest {
    pub event_type: EventType,
    pub detail: Option<Value>,
}

#[derive(Debug, Deserialize, Clone, Copy)]
#[serde(rename_all = "lowercase")]
pub enum AnchorStatusParam {
    Anchored,
    Unanchored,
}

impl From<AnchorStatusParam> for AnchorStatusFilter {
    fn from(value: AnchorStatusParam) -> Self {
        match value {
            AnchorStatusParam::Anchored => AnchorStatusFilter::Anchored,
            AnchorStatusParam::Unanchored => AnchorStatusFilter::Unanchored,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct EventListQuery {
    pub product_id: Option<Uuid>,
    pub event_type: Option<EventType>,
    pub anchor_status: Option<AnchorStatusParam>,
    #[serde(default = "EventListQuery::default_limit")]
    pub limit: i64,
    #[serde(default)]
    pub offset: i64,
}

impl EventListQuery {
    const DEFAULT_LIMIT: i64 = 50;
    const MAX_LIMIT: i64 = 200;

    fn default_limit() -> i64 {
        Self::DEFAULT_LIMIT
    }

    fn normalized(&self) -> (i64, i64) {
        (self.limit.clamp(1, Self::MAX_LIMIT), self.offset.max(0))
    }
}

/// `GET /v1/events` — paginated event list scoped to the authenticated
/// brand. Supports optional `product_id`, `event_type`, and
/// `anchor_status` filters (compose with `AND`).
pub async fn list(
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
    Query(params): Query<EventListQuery>,
) -> Result<Json<Vec<ProvenanceEvent>>, AppError> {
    let (limit, offset) = params.normalized();
    let items = db::events::list_by_brand_filtered(
        &state.db,
        brand_id,
        params.product_id,
        params.event_type.as_ref(),
        params.anchor_status.map(AnchorStatusFilter::from),
        limit,
        offset,
    )
    .await?;
    Ok(Json(items))
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
