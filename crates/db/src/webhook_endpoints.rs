#![deny(warnings)]

//! Queries against the `webhook_endpoints` table.

use common::WebhookEndpoint;
use tracing::instrument;
use uuid::Uuid;

use crate::Db;

/// Register a new webhook endpoint for a brand. `secret` is the HMAC-SHA256
/// signing material the caller will later use to verify deliveries.
#[instrument(skip(db, secret), err)]
pub async fn create(
    db: &Db,
    brand_id: Uuid,
    url: &str,
    secret: &str,
    events: &[String],
) -> Result<WebhookEndpoint, sqlx::Error> {
    sqlx::query_as::<_, WebhookEndpoint>(
        r#"
        INSERT INTO webhook_endpoints (brand_id, url, secret, events)
        VALUES ($1, $2, $3, $4)
        RETURNING id, brand_id, url, secret, events, active, created_at
        "#,
    )
    .bind(brand_id)
    .bind(url)
    .bind(secret)
    .bind(events)
    .fetch_one(db)
    .await
}

/// List a brand's webhook endpoints (both active and deactivated), newest
/// first.
#[instrument(skip(db), err)]
pub async fn list_by_brand(
    db: &Db,
    brand_id: Uuid,
) -> Result<Vec<WebhookEndpoint>, sqlx::Error> {
    sqlx::query_as::<_, WebhookEndpoint>(
        r#"
        SELECT id, brand_id, url, secret, events, active, created_at
        FROM webhook_endpoints
        WHERE brand_id = $1
        ORDER BY created_at DESC
        "#,
    )
    .bind(brand_id)
    .fetch_all(db)
    .await
}

/// Fetch a webhook endpoint by id, scoped to a brand. Used for tenant
/// isolation on all per-endpoint operations.
#[instrument(skip(db), err)]
pub async fn get_by_id_for_brand(
    db: &Db,
    id: Uuid,
    brand_id: Uuid,
) -> Result<Option<WebhookEndpoint>, sqlx::Error> {
    sqlx::query_as::<_, WebhookEndpoint>(
        r#"
        SELECT id, brand_id, url, secret, events, active, created_at
        FROM webhook_endpoints
        WHERE id = $1
          AND brand_id = $2
        "#,
    )
    .bind(id)
    .bind(brand_id)
    .fetch_optional(db)
    .await
}

/// Deactivate (soft-delete) a webhook endpoint. The row is preserved so
/// historical deliveries remain attributable; new deliveries will not be
/// enqueued against it.
#[instrument(skip(db), err)]
pub async fn deactivate(db: &Db, id: Uuid, brand_id: Uuid) -> Result<u64, sqlx::Error> {
    let res = sqlx::query(
        r#"
        UPDATE webhook_endpoints
        SET active = FALSE
        WHERE id = $1
          AND brand_id = $2
        "#,
    )
    .bind(id)
    .bind(brand_id)
    .execute(db)
    .await?;
    Ok(res.rows_affected())
}

/// Find every active webhook endpoint for `brand_id` that is subscribed to
/// `event_type`. Used by the producer side to fan a single event out to
/// every interested endpoint.
#[instrument(skip(db), err)]
pub async fn list_active_for_event(
    db: &Db,
    brand_id: Uuid,
    event_type: &str,
) -> Result<Vec<WebhookEndpoint>, sqlx::Error> {
    sqlx::query_as::<_, WebhookEndpoint>(
        r#"
        SELECT id, brand_id, url, secret, events, active, created_at
        FROM webhook_endpoints
        WHERE brand_id = $1
          AND active = TRUE
          AND $2 = ANY(events)
        "#,
    )
    .bind(brand_id)
    .bind(event_type)
    .fetch_all(db)
    .await
}
