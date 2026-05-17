#![deny(warnings)]

//! Queries against the `api_keys` table.
//!
//! Only the hashed form of an API key is ever persisted. Plain-text keys must
//! never reach this layer.

use chrono::{DateTime, Utc};
use common::ApiKey;
use tracing::instrument;
use uuid::Uuid;

use crate::Db;

/// Insert a new API key record for `brand_id`.
#[instrument(skip(db, key_hash), err)]
pub async fn create(
    db: &Db,
    brand_id: Uuid,
    key_hash: &str,
    label: Option<&str>,
) -> Result<ApiKey, sqlx::Error> {
    sqlx::query_as::<_, ApiKey>(
        r#"
        INSERT INTO api_keys (brand_id, key_hash, label)
        VALUES ($1, $2, $3)
        RETURNING id, brand_id, key_hash, label, created_at, revoked_at
        "#,
    )
    .bind(brand_id)
    .bind(key_hash)
    .bind(label)
    .fetch_one(db)
    .await
}

/// Fetch an active (non-revoked) API key by its hash.
#[instrument(skip(db, key_hash), err)]
pub async fn get_active_by_hash(
    db: &Db,
    key_hash: &str,
) -> Result<Option<ApiKey>, sqlx::Error> {
    sqlx::query_as::<_, ApiKey>(
        r#"
        SELECT id, brand_id, key_hash, label, created_at, revoked_at
        FROM api_keys
        WHERE key_hash = $1
          AND revoked_at IS NULL
        "#,
    )
    .bind(key_hash)
    .fetch_optional(db)
    .await
}

/// Fetch an API key by id, irrespective of revocation status.
#[instrument(skip(db), err)]
pub async fn get_by_id(db: &Db, id: Uuid) -> Result<Option<ApiKey>, sqlx::Error> {
    sqlx::query_as::<_, ApiKey>(
        r#"
        SELECT id, brand_id, key_hash, label, created_at, revoked_at
        FROM api_keys
        WHERE id = $1
        "#,
    )
    .bind(id)
    .fetch_optional(db)
    .await
}

/// List all API keys belonging to `brand_id`, newest first.
#[instrument(skip(db), err)]
pub async fn list_by_brand(db: &Db, brand_id: Uuid) -> Result<Vec<ApiKey>, sqlx::Error> {
    sqlx::query_as::<_, ApiKey>(
        r#"
        SELECT id, brand_id, key_hash, label, created_at, revoked_at
        FROM api_keys
        WHERE brand_id = $1
        ORDER BY created_at DESC
        "#,
    )
    .bind(brand_id)
    .fetch_all(db)
    .await
}

/// Mark an API key as revoked. Returns the updated row, or `None` if the
/// key did not exist or was already revoked.
#[instrument(skip(db), err)]
pub async fn revoke(db: &Db, id: Uuid) -> Result<Option<ApiKey>, sqlx::Error> {
    let now: DateTime<Utc> = Utc::now();
    sqlx::query_as::<_, ApiKey>(
        r#"
        UPDATE api_keys
        SET revoked_at = $2
        WHERE id = $1
          AND revoked_at IS NULL
        RETURNING id, brand_id, key_hash, label, created_at, revoked_at
        "#,
    )
    .bind(id)
    .bind(now)
    .fetch_optional(db)
    .await
}
