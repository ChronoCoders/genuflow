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
        RETURNING id, name, slug, created_at
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
        SELECT id, name, slug, created_at
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
        SELECT id, name, slug, created_at
        FROM brands
        WHERE slug = $1
        "#,
    )
    .bind(slug)
    .fetch_optional(db)
    .await
}

/// List all brands, oldest first.
#[instrument(skip(db), err)]
pub async fn list(db: &Db) -> Result<Vec<Brand>, sqlx::Error> {
    sqlx::query_as::<_, Brand>(
        r#"
        SELECT id, name, slug, created_at
        FROM brands
        ORDER BY created_at ASC
        "#,
    )
    .fetch_all(db)
    .await
}
