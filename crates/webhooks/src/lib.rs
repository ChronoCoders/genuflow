#![deny(warnings)]

//! Webhook delivery service.
//!
//! Runs as a Tokio background task. On each tick we pull a bounded batch
//! of pending deliveries whose backoff window has elapsed, sign each one
//! with the endpoint's secret, POST it, and update its status in the
//! database. Failed attempts are retried up to three times with a
//! geometric 5s → 25s → 125s backoff (so the row will be reconsidered on
//! the tick that follows each window). After three attempts the row is
//! marked `failed` and not retried again.
//!
//! Signature scheme matches the Stripe-style convention used elsewhere in
//! the codebase: `X-Genuflow-Signature: t=<unix_ts>,v1=<hex_hmac>`, where
//! the signed payload is `{ts}.{raw_body}` under HMAC-SHA256.

use std::time::Duration;

use chrono::Utc;
use common::WebhookDeliveryStatus;
use db::webhook_deliveries::PendingDelivery;
use futures::stream::{self, StreamExt};
use hmac::{Hmac, Mac};
use sha2::Sha256;
use tokio::time;
use tracing::{error, info, warn};

type HmacSha256 = Hmac<Sha256>;

const MAX_ATTEMPTS: i32 = 3;
const BATCH_LIMIT: i64 = 50;
const DELIVERY_CONCURRENCY: usize = 20;
const REQUEST_TIMEOUT: Duration = Duration::from_secs(10);
const SIGNATURE_HEADER: &str = "X-Genuflow-Signature";

/// Runtime configuration for the delivery loop.
pub struct WebhookConfig {
    /// How often the loop wakes and polls for due deliveries.
    pub interval: Duration,
}

impl Default for WebhookConfig {
    fn default() -> Self {
        Self {
            interval: Duration::from_secs(5),
        }
    }
}

/// Start the webhook delivery background task. Runs indefinitely; errors
/// within a single run are logged and skipped.
pub async fn run(config: WebhookConfig, db: db::Db) {
    info!("webhook delivery service started, interval={:?}", config.interval);
    let client = match build_client() {
        Ok(c) => c,
        Err(e) => {
            error!("webhook delivery: failed to build HTTP client: {e}");
            return;
        }
    };
    let mut ticker = time::interval(config.interval);

    loop {
        ticker.tick().await;
        if let Err(e) = run_once(&db, &client).await {
            error!("webhook delivery run failed: {}", e);
        }
    }
}

fn build_client() -> Result<reqwest::Client, reqwest::Error> {
    reqwest::Client::builder()
        .timeout(REQUEST_TIMEOUT)
        .user_agent("genuflow-webhooks/1.0")
        .build()
}

/// One pass over the pending queue. Public so it can be driven from
/// integration tests without spinning up the loop.
///
/// Deliveries are dispatched concurrently with a cap of
/// `DELIVERY_CONCURRENCY` in-flight at a time. This prevents a single
/// slow or stalled endpoint from blocking all other tenants' deliveries
/// during the same tick — without unbounded fan-out if the batch limit
/// is raised later.
pub async fn run_once(db: &db::Db, client: &reqwest::Client) -> Result<(), sqlx::Error> {
    let now = Utc::now();
    let due = db::webhook_deliveries::list_pending_due(db, now, BATCH_LIMIT).await?;
    if due.is_empty() {
        return Ok(());
    }

    stream::iter(due)
        .map(|delivery| deliver_one(db, client, delivery))
        .buffer_unordered(DELIVERY_CONCURRENCY)
        .for_each(|_| async {})
        .await;
    Ok(())
}

async fn deliver_one(db: &db::Db, client: &reqwest::Client, delivery: PendingDelivery) {
    let body = match serde_json::to_vec(&delivery.payload) {
        Ok(v) => v,
        Err(e) => {
            // Payload was inserted as JSONB so this should not happen
            // in practice. We mark the row failed rather than retry.
            warn!(
                delivery_id = %delivery.id,
                error = %e,
                "webhook payload could not be serialized; marking failed"
            );
            let _ = db::webhook_deliveries::update_status(
                db,
                delivery.id,
                WebhookDeliveryStatus::Failed,
                delivery.attempts + 1,
                Utc::now(),
            )
            .await;
            return;
        }
    };

    let timestamp = Utc::now().timestamp();
    let signature = sign(&delivery.secret, timestamp, &body);
    let header_value = format!("t={timestamp},v1={signature}");

    let result = client
        .post(&delivery.url)
        .header("Content-Type", "application/json")
        .header(SIGNATURE_HEADER, header_value)
        .header("X-Genuflow-Event", &delivery.event_type)
        .header("X-Genuflow-Delivery", delivery.id.to_string())
        .body(body)
        .send()
        .await;

    let new_attempts = delivery.attempts + 1;
    let now = Utc::now();

    let succeeded = match result {
        Ok(resp) if resp.status().is_success() => {
            info!(
                delivery_id = %delivery.id,
                endpoint_id = %delivery.webhook_endpoint_id,
                event_type = %delivery.event_type,
                attempts = new_attempts,
                "webhook delivered"
            );
            true
        }
        Ok(resp) => {
            warn!(
                delivery_id = %delivery.id,
                endpoint_id = %delivery.webhook_endpoint_id,
                status = %resp.status(),
                attempts = new_attempts,
                "webhook returned non-success"
            );
            false
        }
        Err(e) => {
            warn!(
                delivery_id = %delivery.id,
                endpoint_id = %delivery.webhook_endpoint_id,
                error = %e,
                attempts = new_attempts,
                "webhook request failed"
            );
            false
        }
    };

    let next_status = if succeeded {
        WebhookDeliveryStatus::Delivered
    } else if new_attempts >= MAX_ATTEMPTS {
        WebhookDeliveryStatus::Failed
    } else {
        WebhookDeliveryStatus::Pending
    };

    if let Err(e) =
        db::webhook_deliveries::update_status(db, delivery.id, next_status, new_attempts, now)
            .await
    {
        error!(
            delivery_id = %delivery.id,
            error = %e,
            "failed to persist webhook delivery status"
        );
    }
}

/// Compute the hex-encoded HMAC-SHA256 over `{timestamp}.{body}` using
/// `secret`. HMAC-SHA256 accepts any key length so `new_from_slice` is
/// not expected to fail in practice; we use a `let Ok ... else` so the
/// function stays free of panics if the upstream contract ever changes.
pub fn sign(secret: &str, timestamp: i64, body: &[u8]) -> String {
    let Ok(mut mac) = HmacSha256::new_from_slice(secret.as_bytes()) else {
        return String::new();
    };
    mac.update(timestamp.to_string().as_bytes());
    mac.update(b".");
    mac.update(body);
    hex::encode(mac.finalize().into_bytes())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sign_is_deterministic() {
        let a = sign("secret", 1700000000, b"hello");
        let b = sign("secret", 1700000000, b"hello");
        assert_eq!(a, b);
    }

    #[test]
    fn sign_changes_with_body() {
        let a = sign("secret", 1700000000, b"hello");
        let b = sign("secret", 1700000000, b"world");
        assert_ne!(a, b);
    }

    #[test]
    fn sign_changes_with_timestamp() {
        let a = sign("secret", 1700000000, b"hello");
        let b = sign("secret", 1700000001, b"hello");
        assert_ne!(a, b);
    }

    #[test]
    fn sign_changes_with_secret() {
        let a = sign("a", 1700000000, b"hello");
        let b = sign("b", 1700000000, b"hello");
        assert_ne!(a, b);
    }
}
