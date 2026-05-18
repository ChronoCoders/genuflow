#![deny(warnings)]

use axum::{
    extract::{Path, State},
    Json,
};
use common::{AppError, EventType, ProvenanceEvent};
use serde::{Deserialize, Serialize};
use serde_json::json;
use uuid::Uuid;

use crate::state::AppState;

#[derive(Serialize)]
pub struct VerifyResponse {
    pub product: common::PublicProduct,
    pub brand: common::Brand,
    pub events: Vec<common::ProvenanceEvent>,
    pub latest_anchor: Option<common::BrandAnchorView>,
}

/// Public ownership-transfer request. Bound to `POST /verify/:product_id/transfer`,
/// no authentication. The consumer scans a QR, sees a "sold" item in the
/// provenance, and registers themselves as the new owner.
///
/// Server-side invariants:
/// - Product must exist (else 404).
/// - Product must have at least one `sold` event in its history; otherwise
///   the item is still in the brand's possession and a public transfer is
///   nonsensical (400).
/// - `new_owner_email` must be non-empty and contain an `@` (cheap format
///   sanity check; deeper validation belongs at the edge or a future
///   verification step).
/// - `note`, when provided, is bounded to 500 chars to keep `detail`
///   payloads small.
#[derive(Deserialize)]
pub struct TransferRequest {
    pub new_owner_email: String,
    #[serde(default)]
    pub note: Option<String>,
}

const NOTE_MAX_LEN: usize = 500;
const EMAIL_MAX_LEN: usize = 254;

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

/// `POST /verify/:product_id/transfer` — public, unauthenticated. Records a
/// `transferred` event with `{ new_owner_email, note }` in `detail`. The
/// product must exist and have at least one prior `sold` event.
pub async fn transfer(
    State(state): State<AppState>,
    Path(product_id): Path<Uuid>,
    Json(body): Json<TransferRequest>,
) -> Result<Json<ProvenanceEvent>, AppError> {
    let email = body.new_owner_email.trim();
    if email.is_empty() || !email.contains('@') || email.len() > EMAIL_MAX_LEN {
        return Err(AppError::BadRequest(
            "new_owner_email must be a valid email address".to_string(),
        ));
    }

    let note = match body.note.as_deref().map(str::trim).filter(|s| !s.is_empty()) {
        Some(n) if n.chars().count() > NOTE_MAX_LEN => {
            return Err(AppError::BadRequest(format!(
                "note must be at most {NOTE_MAX_LEN} characters"
            )));
        }
        other => other.map(str::to_string),
    };

    db::products::get_by_id(&state.db, product_id)
        .await?
        .ok_or(AppError::NotFound)?;

    let history = db::events::list_by_product(&state.db, product_id).await?;
    if !history.iter().any(|e| matches!(e.event_type, EventType::Sold)) {
        return Err(AppError::BadRequest(
            "this item is not yet eligible for ownership transfer".to_string(),
        ));
    }

    let detail = json!({
        "new_owner_email": email,
        "note": note,
    });

    let event =
        db::events::create(&state.db, product_id, &EventType::Transferred, Some(&detail)).await?;
    Ok(Json(event))
}
