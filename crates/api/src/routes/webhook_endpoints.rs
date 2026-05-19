#![deny(warnings)]

//! `/v1/webhooks/*` — brand-scoped webhook endpoint management.

use axum::{
    extract::{Extension, Path, State},
    http::StatusCode,
    Json,
};
use common::{AppError, WebhookDelivery, WebhookEndpoint};
use rand::RngCore;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::state::AppState;

#[derive(Deserialize)]
pub struct CreateWebhookRequest {
    pub url: String,
    pub events: Vec<String>,
}

/// Response for `POST /v1/webhooks`. Includes the freshly generated
/// signing secret, returned exactly once. Subsequent fetches of the
/// endpoint omit the secret entirely (the `WebhookEndpoint` type already
/// `#[serde(skip_serializing)]`s it).
#[derive(Serialize)]
pub struct CreateWebhookResponse {
    #[serde(flatten)]
    pub endpoint: SerializedEndpoint,
    /// The signing secret. Store it now — it cannot be retrieved later.
    pub secret: String,
}

/// Mirror of `common::WebhookEndpoint` that explicitly *does* serialize
/// `secret` (used in `CreateWebhookResponse` only).
#[derive(Serialize)]
pub struct SerializedEndpoint {
    pub id: Uuid,
    pub brand_id: Uuid,
    pub url: String,
    pub events: Vec<String>,
    pub active: bool,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

impl From<&WebhookEndpoint> for SerializedEndpoint {
    fn from(e: &WebhookEndpoint) -> Self {
        Self {
            id: e.id,
            brand_id: e.brand_id,
            url: e.url.clone(),
            events: e.events.clone(),
            active: e.active,
            created_at: e.created_at,
        }
    }
}

/// `POST /v1/webhooks` — register a new endpoint and return the signing
/// secret. The secret is shown exactly once; clients must store it on
/// receipt.
pub async fn create(
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
    Json(body): Json<CreateWebhookRequest>,
) -> Result<Json<CreateWebhookResponse>, AppError> {
    let url = body.url.trim();
    if url.is_empty() {
        return Err(AppError::BadRequest("url is required".into()));
    }
    if !url.starts_with("http://") && !url.starts_with("https://") {
        return Err(AppError::BadRequest(
            "url must start with http:// or https://".into(),
        ));
    }
    if url.len() > 2048 {
        return Err(AppError::BadRequest(
            "url must be at most 2048 characters".into(),
        ));
    }

    if body.events.is_empty() {
        return Err(AppError::BadRequest(
            "at least one event subscription is required".into(),
        ));
    }
    for event in &body.events {
        if !db::webhooks::events::ALL.contains(&event.as_str()) {
            return Err(AppError::BadRequest(format!(
                "unknown event type: {event}"
            )));
        }
    }

    let secret = generate_secret();
    let endpoint =
        db::webhook_endpoints::create(&state.db, brand_id, url, &secret, &body.events).await?;

    Ok(Json(CreateWebhookResponse {
        endpoint: SerializedEndpoint::from(&endpoint),
        secret,
    }))
}

/// `GET /v1/webhooks` — list this brand's webhook endpoints. Secret is
/// elided from the response.
pub async fn list(
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
) -> Result<Json<Vec<WebhookEndpoint>>, AppError> {
    let endpoints = db::webhook_endpoints::list_by_brand(&state.db, brand_id).await?;
    Ok(Json(endpoints))
}

/// `DELETE /v1/webhooks/:id` — soft-delete (deactivate) an endpoint.
pub async fn deactivate(
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    let rows = db::webhook_endpoints::deactivate(&state.db, id, brand_id).await?;
    if rows == 0 {
        return Err(AppError::NotFound);
    }
    Ok(StatusCode::NO_CONTENT)
}

/// `GET /v1/webhooks/:id/deliveries` — per-endpoint delivery log.
pub async fn list_deliveries(
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
    Path(id): Path<Uuid>,
) -> Result<Json<Vec<WebhookDelivery>>, AppError> {
    db::webhook_endpoints::get_by_id_for_brand(&state.db, id, brand_id)
        .await?
        .ok_or(AppError::NotFound)?;
    let deliveries = db::webhook_deliveries::list_by_endpoint(&state.db, id, 100).await?;
    Ok(Json(deliveries))
}

/// 32 random bytes hex-encoded → 64-char secret. Generated with the OS
/// random source; on a modern Linux box that's `/dev/urandom`.
fn generate_secret() -> String {
    let mut buf = [0u8; 32];
    rand::rngs::OsRng.fill_bytes(&mut buf);
    hex::encode(buf)
}
