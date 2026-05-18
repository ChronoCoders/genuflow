#![deny(warnings)]

//! Queries against the `provenance_events` table.

use common::{EventType, ProvenanceEvent};
use serde_json::Value;
use sqlx::{Postgres, QueryBuilder};
use tracing::instrument;
use uuid::Uuid;

use crate::Db;

/// Filter mode for `list_by_brand_filtered`.
#[derive(Debug, Clone, Copy)]
pub enum AnchorStatusFilter {
    Anchored,
    Unanchored,
}

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

/// Count events recorded against products owned by `brand_id`.
#[instrument(skip(db), err)]
pub async fn count_by_brand(db: &Db, brand_id: Uuid) -> Result<i64, sqlx::Error> {
    let row: (i64,) = sqlx::query_as(
        r#"
        SELECT COUNT(*)
        FROM provenance_events e
        JOIN products p ON p.id = e.product_id
        WHERE p.brand_id = $1
        "#,
    )
    .bind(brand_id)
    .fetch_one(db)
    .await?;
    Ok(row.0)
}

/// A `(brand_id, event_id)` pair used by the anchor poller when computing
/// per-brand subhashes for a confirmed batch.
#[derive(Debug, sqlx::FromRow)]
pub struct BrandEventPair {
    pub brand_id: Uuid,
    pub event_id: Uuid,
}

/// Return every event attached to `anchor_batch_id`, paired with the
/// `brand_id` that owns the parent product. Used by the anchor poller to
/// group events by brand before computing per-brand subhashes.
#[instrument(skip(db), err)]
pub async fn brand_event_pairs_for_batch(
    db: &Db,
    anchor_batch_id: Uuid,
) -> Result<Vec<BrandEventPair>, sqlx::Error> {
    sqlx::query_as::<_, BrandEventPair>(
        r#"
        SELECT p.brand_id AS brand_id, e.id AS event_id
        FROM provenance_events e
        JOIN products p ON p.id = e.product_id
        WHERE e.anchor_batch_id = $1
        "#,
    )
    .bind(anchor_batch_id)
    .fetch_all(db)
    .await
}

/// Paginated, filtered event listing scoped to `brand_id`. All filter
/// arguments are optional and compose with `AND`. Ordered by `recorded_at`
/// DESC (newest first).
#[instrument(skip(db), err)]
pub async fn list_by_brand_filtered(
    db: &Db,
    brand_id: Uuid,
    product_id: Option<Uuid>,
    event_type: Option<&EventType>,
    anchor_status: Option<AnchorStatusFilter>,
    limit: i64,
    offset: i64,
) -> Result<Vec<ProvenanceEvent>, sqlx::Error> {
    let mut q: QueryBuilder<'_, Postgres> = QueryBuilder::new(
        r#"SELECT e.id, e.product_id, e.event_type, e.detail, e.recorded_at, e.anchor_batch_id
           FROM provenance_events e
           JOIN products p ON p.id = e.product_id
           WHERE p.brand_id = "#,
    );
    q.push_bind(brand_id);

    if let Some(pid) = product_id {
        q.push(" AND e.product_id = ");
        q.push_bind(pid);
    }
    if let Some(et) = event_type {
        q.push(" AND e.event_type = ");
        q.push_bind(et);
    }
    match anchor_status {
        Some(AnchorStatusFilter::Anchored) => {
            q.push(" AND e.anchor_batch_id IS NOT NULL");
        }
        Some(AnchorStatusFilter::Unanchored) => {
            q.push(" AND e.anchor_batch_id IS NULL");
        }
        None => {}
    }

    q.push(" ORDER BY e.recorded_at DESC LIMIT ");
    q.push_bind(limit);
    q.push(" OFFSET ");
    q.push_bind(offset);

    q.build_query_as::<ProvenanceEvent>().fetch_all(db).await
}

/// Fetch the most recent events across all products owned by `brand_id`.
/// Used to populate the dashboard's "recent events" panel.
#[instrument(skip(db), err)]
pub async fn recent_by_brand(
    db: &Db,
    brand_id: Uuid,
    limit: i64,
) -> Result<Vec<ProvenanceEvent>, sqlx::Error> {
    sqlx::query_as::<_, ProvenanceEvent>(
        r#"
        SELECT e.id, e.product_id, e.event_type, e.detail, e.recorded_at, e.anchor_batch_id
        FROM provenance_events e
        JOIN products p ON p.id = e.product_id
        WHERE p.brand_id = $1
        ORDER BY e.recorded_at DESC
        LIMIT $2
        "#,
    )
    .bind(brand_id)
    .bind(limit)
    .fetch_all(db)
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
