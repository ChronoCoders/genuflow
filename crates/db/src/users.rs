#![deny(warnings)]

//! Queries against the `users` table.

use common::User;
use tracing::instrument;
use uuid::Uuid;

use crate::Db;

/// Insert a new dashboard user. `password_hash` must already be an argon2id
/// PHC string — this layer never sees plain text.
#[instrument(skip(db, password_hash), err)]
pub async fn create(
    db: &Db,
    brand_id: Uuid,
    email: &str,
    password_hash: &str,
) -> Result<User, sqlx::Error> {
    sqlx::query_as::<_, User>(
        r#"
        INSERT INTO users (brand_id, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, brand_id, email, password_hash, created_at
        "#,
    )
    .bind(brand_id)
    .bind(email)
    .bind(password_hash)
    .fetch_one(db)
    .await
}

/// Fetch a user by id.
#[instrument(skip(db), err)]
pub async fn get_by_id(db: &Db, id: Uuid) -> Result<Option<User>, sqlx::Error> {
    sqlx::query_as::<_, User>(
        r#"
        SELECT id, brand_id, email, password_hash, created_at
        FROM users
        WHERE id = $1
        "#,
    )
    .bind(id)
    .fetch_optional(db)
    .await
}

/// Fetch a user by email. Used by the login flow.
#[instrument(skip(db), err)]
pub async fn get_by_email(db: &Db, email: &str) -> Result<Option<User>, sqlx::Error> {
    sqlx::query_as::<_, User>(
        r#"
        SELECT id, brand_id, email, password_hash, created_at
        FROM users
        WHERE email = $1
        "#,
    )
    .bind(email)
    .fetch_optional(db)
    .await
}
