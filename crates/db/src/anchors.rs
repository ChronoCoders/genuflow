#![deny(warnings)]

//! Queries against the `anchor_batches` table.

use common::{AnchorBatch, BrandAnchorView};
use tracing::instrument;
use uuid::Uuid;

use crate::Db;

/// Insert a confirmed anchor batch in a single step. Used by callers that
/// already have a confirmed receipt and do not need the two-phase pending
/// flow (kept for callers outside the live anchor pipeline).
#[instrument(skip(db), err)]
pub async fn create(
    db: &Db,
    records_hash: &str,
    tx_hash: &str,
    block_number: i64,
) -> Result<AnchorBatch, sqlx::Error> {
    sqlx::query_as::<_, AnchorBatch>(
        r#"
        INSERT INTO anchor_batches (records_hash, tx_hash, block_number, status)
        VALUES ($1, $2, $3, 'confirmed')
        RETURNING id, records_hash, tx_hash, block_number, status, anchored_at
        "#,
    )
    .bind(records_hash)
    .bind(tx_hash)
    .bind(block_number)
    .fetch_one(db)
    .await
}

/// Insert a pending anchor row immediately after the transaction is
/// broadcast but before confirmations have accumulated. `block_number`
/// remains NULL until [`confirm`] is called.
#[instrument(skip(db), err)]
pub async fn create_pending(
    db: &Db,
    records_hash: &str,
    tx_hash: &str,
) -> Result<AnchorBatch, sqlx::Error> {
    sqlx::query_as::<_, AnchorBatch>(
        r#"
        INSERT INTO anchor_batches (records_hash, tx_hash, block_number, status)
        VALUES ($1, $2, NULL, 'pending')
        RETURNING id, records_hash, tx_hash, block_number, status, anchored_at
        "#,
    )
    .bind(records_hash)
    .bind(tx_hash)
    .fetch_one(db)
    .await
}

/// Mark a pending batch as confirmed and record the block number it landed
/// in. No-op if the batch has already been confirmed.
#[instrument(skip(db), err)]
pub async fn confirm(
    db: &Db,
    id: Uuid,
    block_number: i64,
) -> Result<AnchorBatch, sqlx::Error> {
    sqlx::query_as::<_, AnchorBatch>(
        r#"
        UPDATE anchor_batches
        SET status = 'confirmed',
            block_number = $2
        WHERE id = $1
        RETURNING id, records_hash, tx_hash, block_number, status, anchored_at
        "#,
    )
    .bind(id)
    .bind(block_number)
    .fetch_one(db)
    .await
}

/// Delete a pending batch whose broadcast appears to have been dropped
/// from the mempool. The `ON DELETE SET NULL` FK on `provenance_events`
/// detaches the previously-attached events as a side effect, freeing them
/// to be picked up by `list_unanchored` on the next tick.
///
/// Returns `true` if a row was deleted, `false` if it was already gone
/// (e.g., raced with a concurrent confirm).
#[instrument(skip(db), err)]
pub async fn expire_pending(db: &Db, id: Uuid) -> Result<bool, sqlx::Error> {
    let res = sqlx::query(
        r#"
        DELETE FROM anchor_batches
        WHERE id = $1
          AND status = 'pending'
        "#,
    )
    .bind(id)
    .execute(db)
    .await?;
    Ok(res.rows_affected() > 0)
}

/// Fetch every batch still in the pending state, oldest first.
#[instrument(skip(db), err)]
pub async fn list_pending(db: &Db) -> Result<Vec<AnchorBatch>, sqlx::Error> {
    sqlx::query_as::<_, AnchorBatch>(
        r#"
        SELECT id, records_hash, tx_hash, block_number, status, anchored_at
        FROM anchor_batches
        WHERE status = 'pending'
        ORDER BY anchored_at ASC
        "#,
    )
    .fetch_all(db)
    .await
}

/// Look up a pending batch by `records_hash`. Used as the pre-submit guard
/// so a re-computed event set never gets a second broadcast.
#[instrument(skip(db), err)]
pub async fn find_pending_by_records_hash(
    db: &Db,
    records_hash: &str,
) -> Result<Option<AnchorBatch>, sqlx::Error> {
    sqlx::query_as::<_, AnchorBatch>(
        r#"
        SELECT id, records_hash, tx_hash, block_number, status, anchored_at
        FROM anchor_batches
        WHERE records_hash = $1
          AND status = 'pending'
        LIMIT 1
        "#,
    )
    .bind(records_hash)
    .fetch_optional(db)
    .await
}

/// Fetch an anchor batch by id, regardless of status.
#[instrument(skip(db), err)]
pub async fn get_by_id(db: &Db, id: Uuid) -> Result<Option<AnchorBatch>, sqlx::Error> {
    sqlx::query_as::<_, AnchorBatch>(
        r#"
        SELECT id, records_hash, tx_hash, block_number, status, anchored_at
        FROM anchor_batches
        WHERE id = $1
        "#,
    )
    .bind(id)
    .fetch_optional(db)
    .await
}

/// Fetch a confirmed anchor batch by its on-chain transaction hash.
#[instrument(skip(db), err)]
pub async fn get_by_tx_hash(
    db: &Db,
    tx_hash: &str,
) -> Result<Option<AnchorBatch>, sqlx::Error> {
    sqlx::query_as::<_, AnchorBatch>(
        r#"
        SELECT id, records_hash, tx_hash, block_number, status, anchored_at
        FROM anchor_batches
        WHERE tx_hash = $1
        "#,
    )
    .bind(tx_hash)
    .fetch_optional(db)
    .await
}

/// List confirmed anchor batches, newest first, with pagination.
#[instrument(skip(db), err)]
pub async fn list(db: &Db, limit: i64, offset: i64) -> Result<Vec<AnchorBatch>, sqlx::Error> {
    sqlx::query_as::<_, AnchorBatch>(
        r#"
        SELECT id, records_hash, tx_hash, block_number, status, anchored_at
        FROM anchor_batches
        WHERE status = 'confirmed'
        ORDER BY anchored_at DESC
        LIMIT $1 OFFSET $2
        "#,
    )
    .bind(limit)
    .bind(offset)
    .fetch_all(db)
    .await
}

/// List anchor batches the brand is a participant in, with each row's
/// hash projected from `anchor_brand_hashes` so a brand never sees the
/// global `records_hash` (which would let it correlate batches with
/// other brands).
///
/// Only confirmed batches appear here, because `record_brand_hashes` in
/// the poller runs after confirmation. Pending batches are intentionally
/// hidden until the on-chain tx is final.
#[instrument(skip(db), err)]
pub async fn list_by_brand(
    db: &Db,
    brand_id: Uuid,
    limit: i64,
    offset: i64,
) -> Result<Vec<BrandAnchorView>, sqlx::Error> {
    sqlx::query_as::<_, BrandAnchorView>(
        r#"
        SELECT b.id, h.brand_hash, b.tx_hash, b.block_number, b.status, b.anchored_at
        FROM anchor_batches b
        JOIN anchor_brand_hashes h ON h.anchor_batch_id = b.id
        WHERE h.brand_id = $1
        ORDER BY b.anchored_at DESC
        LIMIT $2 OFFSET $3
        "#,
    )
    .bind(brand_id)
    .bind(limit)
    .bind(offset)
    .fetch_all(db)
    .await
}

/// Insert a per-brand subhash for a confirmed batch. Idempotent — if the
/// row already exists (e.g., poller retried after a partial failure) the
/// existing row is kept.
#[instrument(skip(db), err)]
pub async fn insert_brand_hash(
    db: &Db,
    anchor_batch_id: Uuid,
    brand_id: Uuid,
    brand_hash: &str,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        INSERT INTO anchor_brand_hashes (anchor_batch_id, brand_id, brand_hash)
        VALUES ($1, $2, $3)
        ON CONFLICT (anchor_batch_id, brand_id) DO NOTHING
        "#,
    )
    .bind(anchor_batch_id)
    .bind(brand_id)
    .bind(brand_hash)
    .execute(db)
    .await?;
    Ok(())
}

/// Fetch the most recent confirmed anchor batch that contains an event
/// for a product owned by `brand_id`, projected through
/// `anchor_brand_hashes` so the returned hash is brand-scoped (not the
/// global `records_hash`). Pending batches are excluded.
#[instrument(skip(db), err)]
pub async fn latest_for_brand(
    db: &Db,
    brand_id: Uuid,
) -> Result<Option<BrandAnchorView>, sqlx::Error> {
    sqlx::query_as::<_, BrandAnchorView>(
        r#"
        SELECT b.id, h.brand_hash, b.tx_hash, b.block_number, b.status, b.anchored_at
        FROM anchor_batches b
        JOIN anchor_brand_hashes h ON h.anchor_batch_id = b.id
        WHERE h.brand_id = $1
          AND b.status = 'confirmed'
        ORDER BY b.anchored_at DESC
        LIMIT 1
        "#,
    )
    .bind(brand_id)
    .fetch_optional(db)
    .await
}

/// Fetch the most recent confirmed anchor batch that includes an event
/// for `product_id`, projected through `anchor_brand_hashes` for the
/// product's owning brand. The returned `brand_hash` carries only that
/// brand's events in the batch — the global `records_hash` is never
/// exposed. Pending batches are excluded.
#[instrument(skip(db), err)]
pub async fn latest_for_product(
    db: &Db,
    product_id: Uuid,
) -> Result<Option<BrandAnchorView>, sqlx::Error> {
    sqlx::query_as::<_, BrandAnchorView>(
        r#"
        SELECT b.id, h.brand_hash, b.tx_hash, b.block_number, b.status, b.anchored_at
        FROM anchor_batches b
        JOIN anchor_brand_hashes h ON h.anchor_batch_id = b.id
        WHERE b.status = 'confirmed'
          AND h.brand_id = (SELECT brand_id FROM products WHERE id = $1)
          AND b.id IN (
              SELECT e.anchor_batch_id
              FROM provenance_events e
              WHERE e.product_id = $1
                AND e.anchor_batch_id IS NOT NULL
          )
        ORDER BY b.anchored_at DESC
        LIMIT 1
        "#,
    )
    .bind(product_id)
    .fetch_optional(db)
    .await
}

/// Fetch the most recent confirmed anchor batch, if any.
#[instrument(skip(db), err)]
pub async fn latest(db: &Db) -> Result<Option<AnchorBatch>, sqlx::Error> {
    sqlx::query_as::<_, AnchorBatch>(
        r#"
        SELECT id, records_hash, tx_hash, block_number, status, anchored_at
        FROM anchor_batches
        WHERE status = 'confirmed'
        ORDER BY anchored_at DESC
        LIMIT 1
        "#,
    )
    .fetch_optional(db)
    .await
}
