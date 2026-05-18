#![deny(warnings)]

use axum::{
    extract::{Extension, Query, State},
    Json,
};
use common::{AppError, BrandAnchorView};
use uuid::Uuid;

use crate::routes::PageParams;
use crate::state::AppState;

/// `GET /v1/anchors` — paginated list of anchor batches that contain at
/// least one event for a product owned by the authenticated brand.
pub async fn list(
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
    Query(page): Query<PageParams>,
) -> Result<Json<Vec<BrandAnchorView>>, AppError> {
    let (limit, offset) = page.normalized();
    let items = db::anchors::list_by_brand(&state.db, brand_id, limit, offset).await?;
    Ok(Json(items))
}
