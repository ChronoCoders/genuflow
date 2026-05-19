#![deny(warnings)]

//! Queries against the `brands` table.

use common::Brand;
use tracing::instrument;
use uuid::Uuid;

use crate::Db;

/// Insert a new brand and return the persisted row.
#[instrument(skip(db), err)]
pub async fn create(db: &Db, name: &str, slug: &str) -> Result<Brand, sqlx::Error> {
    sqlx::query_as::<_, Brand>(
        r#"
        INSERT INTO brands (name, slug)
        VALUES ($1, $2)
        RETURNING id, name, slug, custom_domain, created_at
        "#,
    )
    .bind(name)
    .bind(slug)
    .fetch_one(db)
    .await
}

/// Fetch a brand by id. Returns `None` if no such brand exists.
#[instrument(skip(db), err)]
pub async fn get_by_id(db: &Db, id: Uuid) -> Result<Option<Brand>, sqlx::Error> {
    sqlx::query_as::<_, Brand>(
        r#"
        SELECT id, name, slug, custom_domain, created_at
        FROM brands
        WHERE id = $1
        "#,
    )
    .bind(id)
    .fetch_optional(db)
    .await
}

/// Fetch a brand by its unique slug. Returns `None` if no such brand exists.
#[instrument(skip(db), err)]
pub async fn get_by_slug(db: &Db, slug: &str) -> Result<Option<Brand>, sqlx::Error> {
    sqlx::query_as::<_, Brand>(
        r#"
        SELECT id, name, slug, custom_domain, created_at
        FROM brands
        WHERE slug = $1
        "#,
    )
    .bind(slug)
    .fetch_optional(db)
    .await
}

/// Look up a brand by its custom verification domain. Returns `None`
/// if no brand currently has this host configured. Used by the
/// frontend's host-based router to map an inbound `Host` header to
/// the brand whose verification page should be served.
#[instrument(skip(db), err)]
pub async fn get_by_custom_domain(
    db: &Db,
    custom_domain: &str,
) -> Result<Option<Brand>, sqlx::Error> {
    sqlx::query_as::<_, Brand>(
        r#"
        SELECT id, name, slug, custom_domain, created_at
        FROM brands
        WHERE custom_domain = $1
        "#,
    )
    .bind(custom_domain)
    .fetch_optional(db)
    .await
}

/// Set or clear the brand's custom verification domain. `None` clears
/// the column; `Some` writes the supplied host. The caller is
/// responsible for validating the hostname's shape — this layer only
/// surfaces the underlying UNIQUE-violation error to the caller via
/// `sqlx::Error::Database`. Returns `None` only if no brand with
/// `brand_id` exists.
#[instrument(skip(db), err)]
pub async fn set_custom_domain(
    db: &Db,
    brand_id: Uuid,
    custom_domain: Option<&str>,
) -> Result<Option<Brand>, sqlx::Error> {
    sqlx::query_as::<_, Brand>(
        r#"
        UPDATE brands
        SET custom_domain = $2
        WHERE id = $1
        RETURNING id, name, slug, custom_domain, created_at
        "#,
    )
    .bind(brand_id)
    .bind(custom_domain)
    .fetch_optional(db)
    .await
}

/// List all brands, oldest first.
#[instrument(skip(db), err)]
pub async fn list(db: &Db) -> Result<Vec<Brand>, sqlx::Error> {
    sqlx::query_as::<_, Brand>(
        r#"
        SELECT id, name, slug, custom_domain, created_at
        FROM brands
        ORDER BY created_at ASC
        "#,
    )
    .fetch_all(db)
    .await
}
