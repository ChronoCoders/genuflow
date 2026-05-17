#![deny(warnings)]

use axum::{extract::State, Json};
use common::AppError;
use serde::Deserialize;
use crate::state::AppState;

#[derive(Deserialize)]
pub struct CreateBrandRequest {
    pub name: String,
    pub slug: String,
}

pub async fn create_brand(
    State(state): State<AppState>,
    Json(body): Json<CreateBrandRequest>,
) -> Result<Json<common::Brand>, AppError> {
    let brand = db::brands::create(&state.db, &body.name, &body.slug).await?;
    Ok(Json(brand))
}
