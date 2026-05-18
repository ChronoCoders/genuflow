#![deny(warnings)]

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

/// A brand registered on Genuflow.
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Brand {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub created_at: DateTime<Utc>,
}

/// A dashboard user. `password_hash` is an argon2id PHC string and is
/// never serialized over the wire (excluded from JSON).
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: Uuid,
    pub brand_id: Uuid,
    pub email: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub created_at: DateTime<Utc>,
}

/// An API key record (key_hash stored, plain text never persisted).
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct ApiKey {
    pub id: Uuid,
    pub brand_id: Uuid,
    pub key_hash: String,
    pub label: Option<String>,
    pub created_at: DateTime<Utc>,
    pub revoked_at: Option<DateTime<Utc>>,
}

/// A luxury product registered by a brand.
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Product {
    pub id: Uuid,
    pub brand_id: Uuid,
    pub external_ref: Option<String>,
    pub name: String,
    pub metadata: Option<Value>,
    pub created_at: DateTime<Utc>,
}

/// Public-facing projection of [`Product`] for the unauthenticated
/// verification endpoint. Excludes brand-private fields (`external_ref`,
/// `metadata`) so they cannot leak through `/verify/*`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublicProduct {
    pub id: Uuid,
    pub brand_id: Uuid,
    pub name: String,
    pub created_at: DateTime<Utc>,
}

impl From<Product> for PublicProduct {
    fn from(p: Product) -> Self {
        Self {
            id: p.id,
            brand_id: p.brand_id,
            name: p.name,
            created_at: p.created_at,
        }
    }
}

/// A provenance event recorded against a product.
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct ProvenanceEvent {
    pub id: Uuid,
    pub product_id: Uuid,
    pub event_type: EventType,
    pub detail: Option<Value>,
    pub recorded_at: DateTime<Utc>,
    pub anchor_batch_id: Option<Uuid>,
}

/// Valid provenance event types.
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum EventType {
    Manufactured,
    Inspected,
    Shipped,
    Sold,
    Transferred,
}

/// Lifecycle state of an anchor batch.
///
/// `Pending` rows have been broadcast on-chain but have not yet accumulated
/// the required block confirmations. `Confirmed` rows are final and may be
/// surfaced via the public verification endpoint.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum AnchorStatus {
    Pending,
    Confirmed,
}

/// A brand-scoped view of an anchor batch. Carries `brand_hash` — a
/// SHA-256 over only the events in the batch that belong to the
/// authenticated brand — instead of the global `records_hash`. This
/// prevents two brands sharing a batch from correlating each other's
/// anchor activity by comparing hashes.
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct BrandAnchorView {
    pub id: Uuid,
    pub brand_hash: String,
    pub tx_hash: Option<String>,
    pub block_number: Option<i64>,
    pub status: AnchorStatus,
    pub anchored_at: DateTime<Utc>,
}

/// Subscription plan. Determines the brand's product registration limit.
/// Atelier: 500. Maison: 10,000. Couture: unlimited.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum Plan {
    Atelier,
    Maison,
    Couture,
}

impl Plan {
    /// Product registration ceiling for the plan. `None` means unlimited.
    pub fn product_limit(&self) -> Option<i64> {
        match self {
            Plan::Atelier => Some(500),
            Plan::Maison => Some(10_000),
            Plan::Couture => None,
        }
    }
}

/// Lifecycle state of a subscription. Mirrors Stripe's vocabulary so that
/// webhook ingestion is a direct field copy.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum SubscriptionStatus {
    Active,
    PastDue,
    Canceled,
    Trialing,
}

/// A brand's subscription record. One row per brand (enforced by a UNIQUE
/// constraint on `brand_id`). Stripe identifiers are populated lazily when
/// the brand actually upgrades through Checkout.
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Subscription {
    pub id: Uuid,
    pub brand_id: Uuid,
    pub plan: Plan,
    pub status: SubscriptionStatus,
    pub stripe_customer_id: Option<String>,
    pub stripe_subscription_id: Option<String>,
    pub current_period_end: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

/// A batch of events anchored to Base mainnet.
///
/// `tx_hash` and `block_number` are nullable to support the idempotent
/// submission flow: a row is inserted with `status = pending` and a
/// `tx_hash` as soon as the transaction is broadcast; `block_number` is set
/// once enough confirmations have accumulated. If the broadcast is dropped
/// from the mempool the row is expired by nulling `tx_hash`, leaving it as
/// a sentinel that the poller can re-attach to on a later run.
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct AnchorBatch {
    pub id: Uuid,
    pub records_hash: String,
    pub tx_hash: Option<String>,
    pub block_number: Option<i64>,
    pub status: AnchorStatus,
    pub anchored_at: DateTime<Utc>,
}
