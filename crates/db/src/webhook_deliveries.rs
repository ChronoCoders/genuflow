#![deny(warnings)]

//! Queries against the `webhook_deliveries` table. Acts as a durable
//! outbox: producers insert rows with `status = pending`; the delivery
//! service polls and updates status as it attempts to send.

use chrono::{DateTime, Utc};
use common::{WebhookDelivery, WebhookDeliveryStatus};
use serde_json::Value;
use tracing::instrument;
use uuid::Uuid;

use crate::Db;

/// A pending delivery joined with its endpoint's URL and secret, so the
/// delivery worker can dispatch a single row without an extra lookup.
#[derive(Debug, Clone, sqlx::FromRow)]
pub struct PendingDelivery {
    pub id: Uuid,
    pub webhook_endpoint_id: Uuid,
    pub event_type: String,
    pub payload: Value,
    pub attempts: i32,
    pub url: String,
    pub secret: String,
}

/// Insert a pending delivery row for `webhook_endpoint_id`. The worker
/// will pick it up on its next tick.
#[instrument(skip(db, payload), err)]
pub async fn create(
    db: &Db,
    webhook_endpoint_id: Uuid,
    event_type: &str,
    payload: &Value,
) -> Result<WebhookDelivery, sqlx::Error> {
    sqlx::query_as::<_, WebhookDelivery>(
        r#"
        INSERT INTO webhook_deliveries (webhook_endpoint_id, event_type, payload)
        VALUES ($1, $2, $3)
        RETURNING id, webhook_endpoint_id, event_type, payload, status,
                  attempts, last_attempted_at, created_at
        "#,
    )
    .bind(webhook_endpoint_id)
    .bind(event_type)
    .bind(payload)
    .fetch_one(db)
    .await
}

/// Per-endpoint delivery log for the dashboard. Newest first, bounded.
#[instrument(skip(db), err)]
pub async fn list_by_endpoint(
    db: &Db,
    webhook_endpoint_id: Uuid,
    limit: i64,
) -> Result<Vec<WebhookDelivery>, sqlx::Error> {
    sqlx::query_as::<_, WebhookDelivery>(
        r#"
        SELECT id, webhook_endpoint_id, event_type, payload, status,
               attempts, last_attempted_at, created_at
        FROM webhook_deliveries
        WHERE webhook_endpoint_id = $1
        ORDER BY created_at DESC
        LIMIT $2
        "#,
    )
    .bind(webhook_endpoint_id)
    .bind(limit)
    .fetch_all(db)
    .await
}

/// Pick up to `limit` pending deliveries whose backoff window has elapsed.
/// `now` is passed in by the caller to keep the function deterministic
/// against a chosen wall-clock instant. The backoff schedule is
/// 5s → 25s → 125s, derived as `5 * 5^attempts` seconds.
///
/// The JOIN against `webhook_endpoints` filters out deliveries whose
/// endpoint has since been deactivated — they stay pending in the table
/// but are no longer attempted.
#[instrument(skip(db), err)]
pub async fn list_pending_due(
    db: &Db,
    now: DateTime<Utc>,
    limit: i64,
) -> Result<Vec<PendingDelivery>, sqlx::Error> {
    sqlx::query_as::<_, PendingDelivery>(
        r#"
        SELECT d.id,
               d.webhook_endpoint_id,
               d.event_type,
               d.payload,
               d.attempts,
               e.url,
               e.secret
        FROM webhook_deliveries d
        JOIN webhook_endpoints e ON e.id = d.webhook_endpoint_id
        WHERE d.status = 'pending'
          AND e.active = TRUE
          AND (
              d.last_attempted_at IS NULL
              OR d.last_attempted_at + (interval '1 second' * (5 * power(5, d.attempts))) <= $1
          )
        ORDER BY d.created_at ASC
        LIMIT $2
        "#,
    )
    .bind(now)
    .bind(limit)
    .fetch_all(db)
    .await
}

/// Update a delivery's status, attempt count, and last-attempted timestamp
/// after a delivery attempt. The caller computes the new state.
#[instrument(skip(db), err)]
pub async fn update_status(
    db: &Db,
    id: Uuid,
    status: WebhookDeliveryStatus,
    attempts: i32,
    last_attempted_at: DateTime<Utc>,
) -> Result<u64, sqlx::Error> {
    let res = sqlx::query(
        r#"
        UPDATE webhook_deliveries
        SET status = $2,
            attempts = $3,
            last_attempted_at = $4
        WHERE id = $1
        "#,
    )
    .bind(id)
    .bind(status)
    .bind(attempts)
    .bind(last_attempted_at)
    .execute(db)
    .await?;
    Ok(res.rows_affected())
}
