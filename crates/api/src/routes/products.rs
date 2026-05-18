#![deny(warnings)]

use std::io::Cursor;

use axum::{
    extract::{Extension, Path, Query, State},
    http::{header, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use common::{AppError, Product, ProvenanceEvent};
use image::{ImageFormat, Luma};
use qrcode::QrCode;
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

/// `GET /v1/products/:id/qr` — PNG QR code that encodes the public
/// verification URL for this product. The URL host comes from
/// `PUBLIC_BASE_URL` so the same QR works regardless of how the API is
/// reached. Tenant-scoped: a brand can only fetch QR codes for its own
/// products.
pub async fn qr(
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
    Path(id): Path<Uuid>,
) -> Result<Response, AppError> {
    db::products::get_by_id_for_brand(&state.db, id, brand_id)
        .await?
        .ok_or(AppError::NotFound)?;

    let url = format!("{}/verify/{}", state.public_base_url, id);
    let code = QrCode::new(url.as_bytes())
        .map_err(|e| AppError::Internal(format!("QR encode failed: {e}")))?;
    let image = code
        .render::<Luma<u8>>()
        .min_dimensions(512, 512)
        .quiet_zone(true)
        .build();

    let mut buf: Vec<u8> = Vec::new();
    image
        .write_to(&mut Cursor::new(&mut buf), ImageFormat::Png)
        .map_err(|e| AppError::Internal(format!("PNG encode failed: {e}")))?;

    let mut response = (StatusCode::OK, buf).into_response();
    response.headers_mut().insert(
        header::CONTENT_TYPE,
        HeaderValue::from_static("image/png"),
    );
    response.headers_mut().insert(
        header::CACHE_CONTROL,
        HeaderValue::from_static("private, max-age=3600"),
    );
    Ok(response)
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
