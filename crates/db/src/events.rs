#![deny(warnings)]

//! Queries against the `provenance_events` table.

use common::{EventType, ProvenanceEvent};
use serde_json::Value;
use tracing::instrument;
use uuid::Uuid;

use crate::Db;

/// Insert a new provenance event against `product_id`. The event is created
/// unanchored; it will be picked up by the anchor service on its next run.
#[instrument(skip(db, detail), err)]
pub async fn create(
    db: &Db,
    product_id: Uuid,
    event_type: &EventType,
    detail: Option<&Value>,
) -> Result<ProvenanceEvent, sqlx::Error> {
    sqlx::query_as::<_, ProvenanceEvent>(
        r#"
        INSERT INTO provenance_events (product_id, event_type, detail)
        VALUES ($1, $2, $3)
        RETURNING id, product_id, event_type, detail, recorded_at, anchor_batch_id
        "#,
    )
    .bind(product_id)
    .bind(event_type)
    .bind(detail)
    .fetch_one(db)
    .await
}

/// Fetch a provenance event by id.
#[instrument(skip(db), err)]
pub async fn get_by_id(db: &Db, id: Uuid) -> Result<Option<ProvenanceEvent>, sqlx::Error> {
    sqlx::query_as::<_, ProvenanceEvent>(
        r#"
        SELECT id, product_id, event_type, detail, recorded_at, anchor_batch_id
        FROM provenance_events
        WHERE id = $1
        "#,
    )
    .bind(id)
    .fetch_optional(db)
    .await
}

/// List all events for `product_id`, oldest first (chronological provenance).
#[instrument(skip(db), err)]
pub async fn list_by_product(
    db: &Db,
    product_id: Uuid,
) -> Result<Vec<ProvenanceEvent>, sqlx::Error> {
    sqlx::query_as::<_, ProvenanceEvent>(
        r#"
        SELECT id, product_id, event_type, detail, recorded_at, anchor_batch_id
        FROM provenance_events
        WHERE product_id = $1
        ORDER BY recorded_at ASC
        "#,
    )
    .bind(product_id)
    .fetch_all(db)
    .await
}

/// Fetch up to `limit` unanchored events, oldest first. Used by the anchor
/// service to assemble a batch.
#[instrument(skip(db), err)]
pub async fn list_unanchored(
    db: &Db,
    limit: i64,
) -> Result<Vec<ProvenanceEvent>, sqlx::Error> {
    sqlx::query_as::<_, ProvenanceEvent>(
        r#"
        SELECT id, product_id, event_type, detail, recorded_at, anchor_batch_id
        FROM provenance_events
        WHERE anchor_batch_id IS NULL
        ORDER BY recorded_at ASC
        LIMIT $1
        "#,
    )
    .bind(limit)
    .fetch_all(db)
    .await
}

/// Attach `anchor_batch_id` to every event whose id is in `event_ids`. Used
/// after a successful on-chain anchor to mark the batch as committed.
///
/// Returns the number of rows updated.
#[instrument(skip(db, event_ids), fields(count = event_ids.len()), err)]
pub async fn mark_anchored(
    db: &Db,
    event_ids: &[Uuid],
    anchor_batch_id: Uuid,
) -> Result<u64, sqlx::Error> {
    if event_ids.is_empty() {
        return Ok(0);
    }
    let res = sqlx::query(
        r#"
        UPDATE provenance_events
        SET anchor_batch_id = $2
        WHERE id = ANY($1)
          AND anchor_batch_id IS NULL
        "#,
    )
    .bind(event_ids)
    .bind(anchor_batch_id)
    .execute(db)
    .await?;
    Ok(res.rows_affected())
}
