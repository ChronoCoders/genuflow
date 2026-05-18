#![deny(warnings)]

use std::collections::HashMap;

use chrono::Utc;
use common::{AnchorBatch, AppError};
use tracing::{info, warn};
use uuid::Uuid;

use crate::{batch, AnchorConfig};

/// Maximum number of events committed in a single anchor batch.
const MAX_BATCH_SIZE: i64 = 1000;

/// How old a pending row must be (no receipt observed) before we treat the
/// underlying transaction as dropped from the mempool and expire the row.
const PENDING_EXPIRE_SECS: i64 = 3600;

/// Execute one anchor run.
///
/// Order of operations:
/// 1. Resolve every pending row left over from a prior tick. Each is either
///    promoted to `confirmed` (receipt has enough confirmations) or expired
///    (no receipt and older than [`PENDING_EXPIRE_SECS`]).
/// 2. Collect unanchored events and compute their `records_hash`.
/// 3. Submit a new batch idempotently — re-attaching to any pending row
///    that already matches the same `records_hash` rather than broadcasting
///    a duplicate.
pub async fn run_once(config: &AnchorConfig, db: &db::Db) -> Result<(), AppError> {
    resolve_pending_batches(config, db).await?;

    let events = db::events::list_unanchored(db, MAX_BATCH_SIZE).await?;
    if events.is_empty() {
        info!("anchor: no unanchored events, skipping");
        return Ok(());
    }

    let event_ids: Vec<Uuid> = events.iter().map(|e| e.id).collect();
    let records_hash = batch::hash_event_ids(&event_ids);
    info!(
        events = event_ids.len(),
        records_hash = %records_hash,
        "anchor: preparing batch"
    );

    submit_batch(config, db, &records_hash, &event_ids).await
}

async fn resolve_pending_batches(config: &AnchorConfig, db: &db::Db) -> Result<(), AppError> {
    let pending = db::anchors::list_pending(db).await?;
    if pending.is_empty() {
        return Ok(());
    }
    info!(count = pending.len(), "anchor: resolving pending batches");

    for row in pending {
        if let Err(e) = resolve_one(config, db, &row).await {
            // Per-row failure should not poison the rest of the tick.
            warn!(batch_id = %row.id, error = %e, "anchor: failed to resolve pending batch");
        }
    }
    Ok(())
}

async fn resolve_one(
    config: &AnchorConfig,
    db: &db::Db,
    row: &AnchorBatch,
) -> Result<(), AppError> {
    let tx_hash = row.tx_hash.as_deref().ok_or_else(|| {
        AppError::Internal(format!(
            "pending batch {} has null tx_hash (invariant violation)",
            row.id
        ))
    })?;

    let status = batch::receipt_status_for(&config.rpc_url, tx_hash).await?;
    match status {
        Some((block_number, confirmations)) if confirmations >= batch::MIN_CONFIRMATIONS => {
            let block_i64 = i64::try_from(block_number).map_err(|_| {
                AppError::Internal(format!(
                    "block_number {block_number} does not fit in i64"
                ))
            })?;
            db::anchors::confirm(db, row.id, block_i64).await?;
            record_brand_hashes(db, row.id).await?;
            info!(
                batch_id = %row.id,
                block_number = block_i64,
                "anchor: pending batch promoted to confirmed"
            );
        }
        Some((_, confirmations)) => {
            info!(
                batch_id = %row.id,
                confirmations,
                required = batch::MIN_CONFIRMATIONS,
                "anchor: pending batch not yet confirmed, leaving for next tick"
            );
        }
        None => {
            let age = (Utc::now() - row.anchored_at).num_seconds();
            if age > PENDING_EXPIRE_SECS {
                warn!(
                    batch_id = %row.id,
                    age_secs = age,
                    "anchor: expiring pending batch with no receipt"
                );
                // ON DELETE SET NULL on provenance_events.anchor_batch_id
                // detaches the attached events as a side effect.
                db::anchors::expire_pending(db, row.id).await?;
            } else {
                info!(
                    batch_id = %row.id,
                    age_secs = age,
                    "anchor: no receipt yet, will retry next tick"
                );
            }
        }
    }

    Ok(())
}

async fn submit_batch(
    config: &AnchorConfig,
    db: &db::Db,
    records_hash: &str,
    event_ids: &[Uuid],
) -> Result<(), AppError> {
    let existing = db::anchors::find_pending_by_records_hash(db, records_hash).await?;

    let (batch_id, tx_hash) = match existing {
        Some(row) => {
            // Pre-submit guard: a broadcast already happened for this exact
            // event set on an earlier tick. Skip re-broadcast.
            let tx_hash = row.tx_hash.ok_or_else(|| {
                AppError::Internal(format!(
                    "pending batch {} has null tx_hash (invariant violation)",
                    row.id
                ))
            })?;
            info!(
                batch_id = %row.id,
                tx_hash = %tx_hash,
                "anchor: resuming in-flight pending batch"
            );
            (row.id, tx_hash)
        }
        None => {
            let tx_hash =
                batch::broadcast(&config.rpc_url, &config.private_key, records_hash).await?;
            let pending = db::anchors::create_pending(db, records_hash, &tx_hash).await?;
            db::events::mark_anchored(db, event_ids, pending.id).await?;
            info!(
                batch_id = %pending.id,
                tx_hash = %tx_hash,
                "anchor: pending batch created"
            );
            (pending.id, tx_hash)
        }
    };

    let block_number = batch::await_confirmation(&config.rpc_url, &tx_hash).await?;
    db::anchors::confirm(db, batch_id, block_number).await?;
    record_brand_hashes(db, batch_id).await?;
    info!(
        batch_id = %batch_id,
        tx_hash = %tx_hash,
        block_number,
        "anchor: batch confirmed"
    );

    Ok(())
}

/// Compute and persist a per-brand SHA-256 over the brand's events in
/// `batch_id`. One row per (batch, brand) is inserted into
/// `anchor_brand_hashes`. Idempotent — safe to call more than once for
/// the same batch.
async fn record_brand_hashes(db: &db::Db, batch_id: Uuid) -> Result<(), AppError> {
    let pairs = db::events::brand_event_pairs_for_batch(db, batch_id).await?;
    if pairs.is_empty() {
        // A batch with zero attached events should never reach `confirm`,
        // but if it does, there's nothing to project — just return.
        return Ok(());
    }

    let mut by_brand: HashMap<Uuid, Vec<Uuid>> = HashMap::new();
    for pair in pairs {
        by_brand.entry(pair.brand_id).or_default().push(pair.event_id);
    }

    for (brand_id, event_ids) in by_brand {
        let brand_hash = batch::hash_event_ids(&event_ids);
        db::anchors::insert_brand_hash(db, batch_id, brand_id, &brand_hash).await?;
        info!(
            batch_id = %batch_id,
            brand_id = %brand_id,
            events = event_ids.len(),
            "anchor: recorded brand hash"
        );
    }

    Ok(())
}
