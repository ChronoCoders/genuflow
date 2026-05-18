#![deny(warnings)]

//! Queries against the `products` table.

use common::{Plan, Product};
use serde_json::Value;
use tracing::instrument;
use uuid::Uuid;

use crate::Db;

/// Outcome of an atomic plan-checked product registration. The
/// `LimitExceeded` branch carries the live count and the plan ceiling so
/// the caller can render a precise error message.
#[derive(Debug)]
pub enum RegisterOutcome {
    Created(Product),
    LimitExceeded { count: i64, limit: i64 },
}

/// Atomic product registration with plan-limit enforcement.
///
/// Wraps the count check and the insert in a single transaction. The
/// subscription row for `brand_id` is taken with `SELECT ... FOR UPDATE`
/// at the top of the transaction; this serializes all concurrent product
/// inserts for the same brand on that row lock, so two concurrent
/// requests cannot both pass the limit check and both insert.
///
/// `plan` is the brand's current plan, passed in by the caller (the
/// handler already resolves it for error-message purposes). When the plan
/// has no ceiling (Couture), no count is performed and the insert
/// proceeds inside the transaction unchanged.
#[instrument(skip(db, metadata), err)]
pub async fn create_with_plan_check(
    db: &Db,
    brand_id: Uuid,
    plan: Plan,
    name: &str,
    external_ref: Option<&str>,
    metadata: Option<&Value>,
) -> Result<RegisterOutcome, sqlx::Error> {
    let mut tx = db.begin().await?;

    // Row-level lock on the brand's subscription row. Any concurrent
    // product insert for the same brand will block here until this
    // transaction commits or rolls back, eliminating the TOCTOU window
    // between count and insert. Missing-subscription brands (legacy
    // pre-Phase-4 rows that were not back-filled) take no lock and rely
    // on the count check below; this is acceptable because the
    // back-fill in migration 0006 ensures all real rows have one.
    sqlx::query("SELECT id FROM subscriptions WHERE brand_id = $1 FOR UPDATE")
        .bind(brand_id)
        .fetch_optional(&mut *tx)
        .await?;

    if let Some(limit) = plan.product_limit() {
        let row: (i64,) =
            sqlx::query_as("SELECT COUNT(*) FROM products WHERE brand_id = $1")
                .bind(brand_id)
                .fetch_one(&mut *tx)
                .await?;
        if row.0 >= limit {
            // Drop the tx implicitly via rollback. No insert happened.
            return Ok(RegisterOutcome::LimitExceeded {
                count: row.0,
                limit,
            });
        }
    }

    let product = sqlx::query_as::<_, Product>(
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
    .fetch_one(&mut *tx)
    .await?;

    tx.commit().await?;
    Ok(RegisterOutcome::Created(product))
}

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
