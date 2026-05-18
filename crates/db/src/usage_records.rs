#![deny(warnings)]

//! Queries against the `usage_records` table. Each row is a snapshot of a
//! brand's product count for a billing period — used downstream for
//! reporting and as the basis for usage-based reconciliation when Stripe
//! enters the loop.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use tracing::instrument;
use uuid::Uuid;

use crate::Db;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct UsageRecord {
    pub id: Uuid,
    pub brand_id: Uuid,
    pub period_start: DateTime<Utc>,
    pub period_end: DateTime<Utc>,
    pub product_count: i32,
    pub created_at: DateTime<Utc>,
}

/// Insert a usage snapshot for a brand. Caller supplies the period bounds
/// and the product count at the moment of snapshotting.
#[instrument(skip(db), err)]
pub async fn create(
    db: &Db,
    brand_id: Uuid,
    period_start: DateTime<Utc>,
    period_end: DateTime<Utc>,
    product_count: i32,
) -> Result<UsageRecord, sqlx::Error> {
    sqlx::query_as::<_, UsageRecord>(
        r#"
        INSERT INTO usage_records (brand_id, period_start, period_end, product_count)
        VALUES ($1, $2, $3, $4)
        RETURNING id, brand_id, period_start, period_end, product_count, created_at
        "#,
    )
    .bind(brand_id)
    .bind(period_start)
    .bind(period_end)
    .bind(product_count)
    .fetch_one(db)
    .await
}

/// List a brand's usage records, newest first. Bounded by `limit`.
#[instrument(skip(db), err)]
pub async fn list_by_brand(
    db: &Db,
    brand_id: Uuid,
    limit: i64,
) -> Result<Vec<UsageRecord>, sqlx::Error> {
    sqlx::query_as::<_, UsageRecord>(
        r#"
        SELECT id, brand_id, period_start, period_end, product_count, created_at
        FROM usage_records
        WHERE brand_id = $1
        ORDER BY period_start DESC
        LIMIT $2
        "#,
    )
    .bind(brand_id)
    .bind(limit)
    .fetch_all(db)
    .await
}
