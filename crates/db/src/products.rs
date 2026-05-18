#![deny(warnings)]

//! Queries against the `products` table.

use common::Product;
use serde_json::Value;
use tracing::instrument;
use uuid::Uuid;

use crate::Db;

/// Insert a new product owned by `brand_id`.
#[instrument(skip(db, metadata), err)]
pub async fn create(
    db: &Db,
    brand_id: Uuid,
    name: &str,
    external_ref: Option<&str>,
    metadata: Option<&Value>,
) -> Result<Product, sqlx::Error> {
    sqlx::query_as::<_, Product>(
        r#"
        INSERT INTO products (brand_id, external_ref, name, metadata)
        VALUES ($1, $2, $3, $4)
        RETURNING id, brand_id, external_ref, name, metadata, created_at
        "#,
    )
    .bind(brand_id)
    .bind(external_ref)
    .bind(name)
    .bind(metadata)
    .fetch_one(db)
    .await
}

/// Fetch a product by id. Returns `None` if no such product exists.
#[instrument(skip(db), err)]
pub async fn get_by_id(db: &Db, id: Uuid) -> Result<Option<Product>, sqlx::Error> {
    sqlx::query_as::<_, Product>(
        r#"
        SELECT id, brand_id, external_ref, name, metadata, created_at
        FROM products
        WHERE id = $1
        "#,
    )
    .bind(id)
    .fetch_optional(db)
    .await
}

/// Fetch a product by id only if it belongs to `brand_id`. Used for tenant
/// isolation at the query layer.
#[instrument(skip(db), err)]
pub async fn get_by_id_for_brand(
    db: &Db,
    id: Uuid,
    brand_id: Uuid,
) -> Result<Option<Product>, sqlx::Error> {
    sqlx::query_as::<_, Product>(
        r#"
        SELECT id, brand_id, external_ref, name, metadata, created_at
        FROM products
        WHERE id = $1
          AND brand_id = $2
        "#,
    )
    .bind(id)
    .bind(brand_id)
    .fetch_optional(db)
    .await
}

/// Count products owned by `brand_id`.
#[instrument(skip(db), err)]
pub async fn count_by_brand(db: &Db, brand_id: Uuid) -> Result<i64, sqlx::Error> {
    let row: (i64,) = sqlx::query_as(
        r#"SELECT COUNT(*) FROM products WHERE brand_id = $1"#,
    )
    .bind(brand_id)
    .fetch_one(db)
    .await?;
    Ok(row.0)
}

/// List products belonging to `brand_id`, newest first, with pagination.
#[instrument(skip(db), err)]
pub async fn list_by_brand(
    db: &Db,
    brand_id: Uuid,
    limit: i64,
    offset: i64,
) -> Result<Vec<Product>, sqlx::Error> {
    sqlx::query_as::<_, Product>(
        r#"
        SELECT id, brand_id, external_ref, name, metadata, created_at
        FROM products
        WHERE brand_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
        "#,
    )
    .bind(brand_id)
    .bind(limit)
    .bind(offset)
    .fetch_all(db)
    .await
}
