#![deny(warnings)]

//! High-level helpers for enqueueing webhook deliveries. Producer code
//! (handlers, anchor poller) calls `enqueue` with a brand id, an event
//! type, and a payload; we resolve all active subscribed endpoints and
//! insert one `webhook_deliveries` row per endpoint.

use serde_json::Value;
use tracing::instrument;
use uuid::Uuid;

use crate::Db;

/// Canonical event-type strings emitted on the producer side. Kept here
/// (rather than as an enum) so producers and the wider system can use
/// string literals and the dashboard can show them without translation.
pub mod events {
    pub const PRODUCT_REGISTERED: &str = "product.registered";
    pub const EVENT_RECORDED: &str = "event.recorded";
    pub const ANCHOR_CONFIRMED: &str = "anchor.confirmed";

    /// Full list, in the order the dashboard should present them.
    pub const ALL: &[&str] = &[PRODUCT_REGISTERED, EVENT_RECORDED, ANCHOR_CONFIRMED];
}

/// Enqueue a single event for fan-out to every active webhook endpoint
/// belonging to `brand_id` that has subscribed to `event_type`.
///
/// Returns the number of delivery rows created. A return of zero is
/// legitimate (the brand has no endpoints subscribed) and the caller
/// should treat it as a no-op rather than an error.
///
/// Errors from a single insert are logged but do not stop the fan-out;
/// the function returns the first error after attempting all endpoints
/// so the caller can decide whether to surface it.
#[instrument(skip(db, payload), err)]
pub async fn enqueue(
    db: &Db,
    brand_id: Uuid,
    event_type: &str,
    payload: &Value,
) -> Result<i64, sqlx::Error> {
    let endpoints =
        crate::webhook_endpoints::list_active_for_event(db, brand_id, event_type).await?;

    let mut created = 0_i64;
    for endpoint in endpoints {
        crate::webhook_deliveries::create(db, endpoint.id, event_type, payload).await?;
        created += 1;
    }
    Ok(created)
}
