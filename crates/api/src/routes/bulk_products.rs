#![deny(warnings)]

//! `/v1/products/bulk` and `/v1/products/bulk/csv` — atomic bulk
//! product registration with plan-limit enforcement.
//!
//! Items are validated row-by-row in the handler. Invalid items are
//! collected into a `failed` list (with their original index in the
//! request and a short reason) and never reach the database. Valid
//! items go through `db::products::bulk_insert_with_plan_check`, which
//! takes a `SELECT ... FOR UPDATE` lock on the brand's subscription
//! row and inserts everything inside one transaction.
//!
//! If the requested batch would push the brand over its plan limit,
//! the transaction rolls back and the request fails with **402** —
//! bulk imports are intentionally all-or-nothing at the plan boundary
//! (silently inserting only the first N would be surprising).

use axum::{
    extract::{Extension, Multipart, State},
    Json,
};
use common::{AppError, Plan, Product};
use db::products::{BulkItem, BulkOutcome};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

use crate::state::AppState;

const MAX_BULK_ITEMS: usize = 1000;
/// Hard cap on multipart body size for the CSV endpoint. Enforced via
/// `axum::extract::DefaultBodyLimit` on the route layer so axum rejects
/// oversized uploads pre-allocation, before any field is buffered.
pub const MAX_CSV_BYTES: usize = 5 * 1024 * 1024;
const NAME_MAX_LEN: usize = 200;
const EXTERNAL_REF_MAX_LEN: usize = 200;

#[derive(Deserialize)]
pub struct BulkProductItem {
    pub name: String,
    #[serde(default)]
    pub external_ref: Option<String>,
    #[serde(default)]
    pub metadata: Option<Value>,
}

#[derive(Serialize)]
pub struct BulkFailure {
    pub index: usize,
    pub reason: String,
}

#[derive(Serialize)]
pub struct BulkResponse {
    pub created: usize,
    pub products: Vec<Product>,
    pub failed: Vec<BulkFailure>,
}

/// Validate one request item. Returns either a normalised `BulkItem`
/// ready for insertion, or a short human-readable rejection reason.
fn validate(item: BulkProductItem) -> Result<BulkItem, String> {
    let name = item.name.trim().to_string();
    if name.is_empty() {
        return Err("name is required".into());
    }
    if name.chars().count() > NAME_MAX_LEN {
        return Err(format!("name must be at most {NAME_MAX_LEN} characters"));
    }

    let external_ref = match item.external_ref {
        Some(ref s) => {
            let trimmed = s.trim();
            if trimmed.is_empty() {
                None
            } else if trimmed.chars().count() > EXTERNAL_REF_MAX_LEN {
                return Err(format!(
                    "external_ref must be at most {EXTERNAL_REF_MAX_LEN} characters"
                ));
            } else {
                Some(trimmed.to_string())
            }
        }
        None => None,
    };

    Ok(BulkItem {
        name,
        external_ref,
        metadata: item.metadata,
    })
}

/// `POST /v1/products/bulk` — JSON array of product items, up to
/// `MAX_BULK_ITEMS`.
pub async fn bulk_json(
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
    Json(items): Json<Vec<BulkProductItem>>,
) -> Result<Json<BulkResponse>, AppError> {
    process_bulk(&state, brand_id, items).await
}

/// `POST /v1/products/bulk/csv` — multipart/form-data with a `file`
/// field carrying CSV bytes. CSV must have columns `name`,
/// `external_ref`, and `metadata_json` (the last two are optional).
pub async fn bulk_csv(
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
    mut multipart: Multipart,
) -> Result<Json<BulkResponse>, AppError> {
    let mut bytes: Option<Vec<u8>> = None;

    loop {
        let field = multipart
            .next_field()
            .await
            .map_err(|e| AppError::BadRequest(format!("malformed multipart: {e}")))?;
        let Some(field) = field else { break };

        if field.name() == Some("file") {
            let data = field
                .bytes()
                .await
                .map_err(|e| AppError::BadRequest(format!("could not read uploaded file: {e}")))?;
            if data.len() > MAX_CSV_BYTES {
                return Err(AppError::BadRequest(format!(
                    "CSV file is too large (max {MAX_CSV_BYTES} bytes)"
                )));
            }
            bytes = Some(data.to_vec());
        }
    }

    let bytes = bytes
        .ok_or_else(|| AppError::BadRequest("missing 'file' field in multipart body".into()))?;

    let items = parse_csv(&bytes)?;
    process_bulk(&state, brand_id, items).await
}

/// Parse a CSV byte buffer into a `Vec<BulkProductItem>`. Required
/// header: `name`. Optional headers: `external_ref`, `metadata_json`.
/// Unknown headers are tolerated and ignored.
fn parse_csv(bytes: &[u8]) -> Result<Vec<BulkProductItem>, AppError> {
    let mut reader = csv::ReaderBuilder::new()
        .has_headers(true)
        .trim(csv::Trim::All)
        .from_reader(bytes);

    let headers = reader
        .headers()
        .map_err(|e| AppError::BadRequest(format!("could not read CSV header row: {e}")))?
        .clone();

    let name_col = headers.iter().position(|h| h == "name");
    let external_ref_col = headers.iter().position(|h| h == "external_ref");
    let metadata_col = headers.iter().position(|h| h == "metadata_json");

    let Some(name_col) = name_col else {
        return Err(AppError::BadRequest(
            "CSV must have a 'name' column".into(),
        ));
    };

    let mut items = Vec::new();
    for (row_idx, record) in reader.records().enumerate() {
        let record = record.map_err(|e| {
            AppError::BadRequest(format!(
                "could not parse CSV row {}: {e}",
                row_idx + 2 // +1 for header, +1 for 1-based
            ))
        })?;

        let name = record.get(name_col).unwrap_or("").to_string();
        let external_ref =
            external_ref_col.and_then(|c| record.get(c)).map(str::to_string);
        let metadata = match metadata_col.and_then(|c| record.get(c)) {
            Some(s) if !s.trim().is_empty() => Some(serde_json::from_str(s).map_err(|e| {
                AppError::BadRequest(format!(
                    "metadata_json on CSV row {} is not valid JSON: {e}",
                    row_idx + 2
                ))
            })?),
            _ => None,
        };

        items.push(BulkProductItem {
            name,
            external_ref,
            metadata,
        });
    }
    Ok(items)
}

async fn process_bulk(
    state: &AppState,
    brand_id: Uuid,
    items: Vec<BulkProductItem>,
) -> Result<Json<BulkResponse>, AppError> {
    if items.is_empty() {
        return Err(AppError::BadRequest("bulk request must not be empty".into()));
    }
    if items.len() > MAX_BULK_ITEMS {
        return Err(AppError::BadRequest(format!(
            "bulk request may contain at most {MAX_BULK_ITEMS} items"
        )));
    }

    let plan = db::subscriptions::get_by_brand(&state.db, brand_id)
        .await?
        .map(|s| s.plan)
        .unwrap_or(Plan::Atelier);

    // Partition into validated items (preserving their original index for
    // error reporting) and failures.
    let mut valid: Vec<(usize, BulkItem)> = Vec::new();
    let mut failed: Vec<BulkFailure> = Vec::new();
    for (idx, item) in items.into_iter().enumerate() {
        match validate(item) {
            Ok(v) => valid.push((idx, v)),
            Err(reason) => failed.push(BulkFailure { index: idx, reason }),
        }
    }

    if valid.is_empty() {
        return Ok(Json(BulkResponse {
            created: 0,
            products: Vec::new(),
            failed,
        }));
    }

    let to_insert: Vec<BulkItem> = valid.iter().map(|(_, item)| item.clone()).collect();
    let outcome =
        db::products::bulk_insert_with_plan_check(&state.db, brand_id, plan, &to_insert).await?;

    match outcome {
        BulkOutcome::Created(products) => {
            // Best-effort webhook fan-out, one per created product. Same
            // pattern as the single-product path: enqueue failures are
            // logged but never fail the request.
            for product in &products {
                let payload = serde_json::to_value(product).unwrap_or(Value::Null);
                if let Err(e) = db::webhooks::enqueue(
                    &state.db,
                    brand_id,
                    db::webhooks::events::PRODUCT_REGISTERED,
                    &payload,
                )
                .await
                {
                    tracing::warn!(
                        error = %e,
                        brand_id = %brand_id,
                        product_id = %product.id,
                        "failed to enqueue product.registered webhook (bulk)"
                    );
                }
            }
            Ok(Json(BulkResponse {
                created: products.len(),
                products,
                failed,
            }))
        }
        BulkOutcome::LimitExceeded {
            count,
            limit,
            requested,
        } => Err(AppError::PaymentRequired(format!(
            "bulk import rejected: {count} + {requested} > {limit} product limit; upgrade your plan"
        ))),
    }
}
