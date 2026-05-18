#![deny(warnings)]

use axum::{
    extract::{Extension, State},
    Json,
};
use common::{AppError, BrandAnchorView, ProvenanceEvent};
use serde::Serialize;
use uuid::Uuid;

use crate::state::AppState;

/// Number of recent events surfaced on the dashboard.
const RECENT_EVENTS_LIMIT: i64 = 10;

#[derive(Serialize)]
pub struct DashboardMetrics {
    pub product_count: i64,
    pub event_count: i64,
    pub last_anchor: Option<BrandAnchorView>,
    pub recent_events: Vec<ProvenanceEvent>,
}

/// `GET /v1/dashboard` — aggregate overview metrics for the authenticated
/// brand: product count, event count, the most recent confirmed anchor
/// containing one of the brand's events, and the latest events.
pub async fn metrics(
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
) -> Result<Json<DashboardMetrics>, AppError> {
    let product_count = db::products::count_by_brand(&state.db, brand_id).await?;
    let event_count = db::events::count_by_brand(&state.db, brand_id).await?;
    let last_anchor = db::anchors::latest_for_brand(&state.db, brand_id).await?;
    let recent_events =
        db::events::recent_by_brand(&state.db, brand_id, RECENT_EVENTS_LIMIT).await?;

    Ok(Json(DashboardMetrics {
        product_count,
        event_count,
        last_anchor,
        recent_events,
    }))
}
