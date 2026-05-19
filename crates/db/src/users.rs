#![deny(warnings)]

//! Queries against the `users` table.

use common::{User, UserRole};
use tracing::instrument;
use uuid::Uuid;

use crate::Db;

/// Insert a new dashboard user at the given role. `password_hash` must
/// already be an argon2id PHC string — this layer never sees plain text.
#[instrument(skip(db, password_hash), err)]
pub async fn create(
    db: &Db,
    brand_id: Uuid,
    email: &str,
    password_hash: &str,
    role: UserRole,
) -> Result<User, sqlx::Error> {
    sqlx::query_as::<_, User>(
        r#"
        INSERT INTO users (brand_id, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, brand_id, email, password_hash, role, created_at
        "#,
    )
    .bind(brand_id)
    .bind(email)
    .bind(password_hash)
    .bind(role)
    .fetch_one(db)
    .await
}

/// Fetch a user by id.
#[instrument(skip(db), err)]
pub async fn get_by_id(db: &Db, id: Uuid) -> Result<Option<User>, sqlx::Error> {
    sqlx::query_as::<_, User>(
        r#"
        SELECT id, brand_id, email, password_hash, role, created_at
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
        SELECT id, brand_id, email, password_hash, role, created_at
        FROM users
        WHERE email = $1
        "#,
    )
    .bind(email)
    .fetch_optional(db)
    .await
}

/// List all users belonging to `brand_id`, oldest first.
#[instrument(skip(db), err)]
pub async fn list_by_brand(db: &Db, brand_id: Uuid) -> Result<Vec<User>, sqlx::Error> {
    sqlx::query_as::<_, User>(
        r#"
        SELECT id, brand_id, email, password_hash, role, created_at
        FROM users
        WHERE brand_id = $1
        ORDER BY created_at ASC
        "#,
    )
    .bind(brand_id)
    .fetch_all(db)
    .await
}

/// Set the role on a user. Tenant-scoped: the user must belong to
/// `brand_id`, else this returns 0 rows.
#[instrument(skip(db), err)]
pub async fn set_role(
    db: &Db,
    user_id: Uuid,
    brand_id: Uuid,
    role: UserRole,
) -> Result<u64, sqlx::Error> {
    let res = sqlx::query(
        r#"
        UPDATE users
        SET role = $3
        WHERE id = $1
          AND brand_id = $2
        "#,
    )
    .bind(user_id)
    .bind(brand_id)
    .bind(role)
    .execute(db)
    .await?;
    Ok(res.rows_affected())
}

/// Hard-delete a user. Tenant-scoped: the user must belong to
/// `brand_id`. Returns the number of rows deleted (0 if no match).
#[instrument(skip(db), err)]
pub async fn delete(db: &Db, user_id: Uuid, brand_id: Uuid) -> Result<u64, sqlx::Error> {
    let res = sqlx::query(
        r#"
        DELETE FROM users
        WHERE id = $1
          AND brand_id = $2
        "#,
    )
    .bind(user_id)
    .bind(brand_id)
    .execute(db)
    .await?;
    Ok(res.rows_affected())
}

/// Count owners on a brand. Used to enforce the "at least one owner"
/// invariant — a brand must always have at least one user with role
/// 'owner', so an owner cannot demote themselves if they're the last.
#[instrument(skip(db), err)]
pub async fn count_owners(db: &Db, brand_id: Uuid) -> Result<i64, sqlx::Error> {
    let row: (i64,) = sqlx::query_as(
        r#"
        SELECT COUNT(*)
        FROM users
        WHERE brand_id = $1
          AND role = 'owner'
        "#,
    )
    .bind(brand_id)
    .fetch_one(db)
    .await?;
    Ok(row.0)
}
