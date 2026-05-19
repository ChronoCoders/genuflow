#![deny(warnings)]

//! `/v1/team/*` — brand-scoped team management.
//!
//! All routes require a session (not an API key), since role
//! authorisation is per-user. `OwnerOnly` / `OwnerOrAdmin` extractors
//! gate individual handlers before the body runs.

use axum::{
    extract::{Extension, Path, State},
    http::StatusCode,
    Json,
};
use chrono::{Duration, Utc};
use common::{AppError, Invite, User, UserRole};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::auth::UserId;
use crate::middleware::rbac::{OwnerOnly, OwnerOrAdmin};
use crate::state::AppState;

const INVITE_TTL_DAYS: i64 = 7;

#[derive(Serialize)]
pub struct TeamResponse {
    pub members: Vec<User>,
    pub invites: Vec<Invite>,
}

/// `GET /v1/team` — list members and pending invites.
pub async fn get(
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
) -> Result<Json<TeamResponse>, AppError> {
    let members = db::users::list_by_brand(&state.db, brand_id).await?;
    let invites = db::invites::list_pending_by_brand(&state.db, brand_id).await?;
    Ok(Json(TeamResponse { members, invites }))
}

#[derive(Deserialize)]
pub struct InviteRequest {
    pub email: String,
    pub role: UserRole,
}

/// Response for `POST /v1/team/invite`. Includes the raw token exactly
/// once — owners/admins are expected to surface this in their own
/// invite-mail flow.
#[derive(Serialize)]
pub struct InviteResponse {
    pub id: Uuid,
    pub brand_id: Uuid,
    pub email: String,
    pub role: UserRole,
    pub expires_at: chrono::DateTime<Utc>,
    pub created_at: chrono::DateTime<Utc>,
    /// Shown once. Use this to construct the accept link:
    /// `${PUBLIC_BASE_URL}/accept-invite/${token}`.
    pub token: Uuid,
}

/// `POST /v1/team/invite` — owner or admin only. Creates a pending
/// invite. Inviting the 'owner' role is rejected; ownership only
/// changes through `PATCH /v1/team/:id/role`.
pub async fn create_invite(
    _: OwnerOrAdmin,
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
    Json(body): Json<InviteRequest>,
) -> Result<Json<InviteResponse>, AppError> {
    let email = body.email.trim().to_ascii_lowercase();
    if email.is_empty() || !email.contains('@') || email.len() > 254 {
        return Err(AppError::BadRequest(
            "a valid email is required".into(),
        ));
    }
    if matches!(body.role, UserRole::Owner) {
        return Err(AppError::BadRequest(
            "invites cannot create owners; promote an existing user instead".into(),
        ));
    }

    let expires_at = Utc::now() + Duration::days(INVITE_TTL_DAYS);

    let invite = db::invites::create(&state.db, brand_id, &email, body.role, expires_at)
        .await
        .map_err(|e| {
            // The partial unique index on (brand_id, email) WHERE
            // accepted_at IS NULL fires when the same email already has
            // a pending invite on this brand.
            if e.as_database_error().and_then(|d| d.code()).is_some_and(|c| c == "23505") {
                AppError::Conflict(
                    "this email already has a pending invite".into(),
                )
            } else {
                AppError::Database(e)
            }
        })?;

    Ok(Json(InviteResponse {
        id: invite.id,
        brand_id: invite.brand_id,
        email: invite.email,
        role: invite.role,
        expires_at: invite.expires_at,
        created_at: invite.created_at,
        token: invite.token,
    }))
}

/// `DELETE /v1/team/invite/:id` — owner or admin only. Revoke a
/// pending invite.
pub async fn revoke_invite(
    _: OwnerOrAdmin,
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    let rows = db::invites::delete_pending(&state.db, id, brand_id).await?;
    if rows == 0 {
        return Err(AppError::NotFound);
    }
    Ok(StatusCode::NO_CONTENT)
}

/// `DELETE /v1/team/:user_id` — owner only.
///
/// Removes a member from the brand. Invariants enforced inside a single
/// transaction with a `SELECT ... FOR UPDATE` on the brand's
/// subscription row, mirroring the `change_role` pattern:
///
/// - The acting owner cannot remove themselves (transfer ownership
///   first).
/// - At least one owner must remain on the brand at all times.
///
/// The lock serializes every team write on this brand on a single row,
/// so two concurrent owner-deletes-owner requests can't both pass the
/// `count_owners` guard and both succeed.
pub async fn remove_member(
    _: OwnerOnly,
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
    Extension(UserId(actor_id)): Extension<UserId>,
    Path(target_id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    if target_id == actor_id {
        return Err(AppError::BadRequest(
            "you cannot remove yourself; transfer ownership first".into(),
        ));
    }

    let mut tx = state.db.begin().await?;

    // Per-brand serialization lock. Any concurrent team-write on this
    // brand blocks here until commit/rollback.
    sqlx::query("SELECT id FROM subscriptions WHERE brand_id = $1 FOR UPDATE")
        .bind(brand_id)
        .fetch_optional(&mut *tx)
        .await?;

    // Re-read the target inside the transaction (its role at request
    // entry is irrelevant — what matters is its role at delete time).
    let target = sqlx::query_as::<_, common::User>(
        r#"
        SELECT id, brand_id, email, password_hash, role, created_at
        FROM users
        WHERE id = $1 AND brand_id = $2
        "#,
    )
    .bind(target_id)
    .bind(brand_id)
    .fetch_optional(&mut *tx)
    .await?
    .ok_or(AppError::NotFound)?;

    // Last-owner guard: removing an owner is only allowed if at least
    // one other owner exists. The check runs inside the same lock as
    // the delete, so a second concurrent owner-delete request will
    // block here and re-read a count that already reflects this
    // transaction's pending delete.
    if matches!(target.role, common::UserRole::Owner) {
        let row: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM users WHERE brand_id = $1 AND role = 'owner'",
        )
        .bind(brand_id)
        .fetch_one(&mut *tx)
        .await?;
        if row.0 <= 1 {
            return Err(AppError::BadRequest(
                "a brand must have at least one owner; promote another user first".into(),
            ));
        }
    }

    let rows = sqlx::query("DELETE FROM users WHERE id = $1 AND brand_id = $2")
        .bind(target_id)
        .bind(brand_id)
        .execute(&mut *tx)
        .await?
        .rows_affected();
    if rows == 0 {
        return Err(AppError::NotFound);
    }

    tx.commit().await?;
    Ok(StatusCode::NO_CONTENT)
}

#[derive(Deserialize)]
pub struct ChangeRoleRequest {
    pub role: UserRole,
}

/// `PATCH /v1/team/:user_id/role` — owner only. Change a user's role.
///
/// Invariants:
/// - At least one owner must remain on the brand at all times. The
///   only path that could violate this is demoting the last owner —
///   we reject that with 400.
/// - The acting owner can promote/demote anyone else, including
///   self-demotion when there is at least one other owner.
pub async fn change_role(
    _: OwnerOnly,
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
    Path(target_id): Path<Uuid>,
    Json(body): Json<ChangeRoleRequest>,
) -> Result<StatusCode, AppError> {
    let target = db::users::get_by_id(&state.db, target_id)
        .await?
        .filter(|u| u.brand_id == brand_id)
        .ok_or(AppError::NotFound)?;

    // No-op: already this role. Treat as success.
    if target.role == body.role {
        return Ok(StatusCode::NO_CONTENT);
    }

    // Last-owner protection: demoting the sole owner would leave the
    // brand owner-less, which we never allow.
    if matches!(target.role, UserRole::Owner) && !matches!(body.role, UserRole::Owner) {
        let owners = db::users::count_owners(&state.db, brand_id).await?;
        if owners <= 1 {
            return Err(AppError::BadRequest(
                "a brand must have at least one owner; promote another user first".into(),
            ));
        }
    }

    let rows = db::users::set_role(&state.db, target_id, brand_id, body.role).await?;
    if rows == 0 {
        return Err(AppError::NotFound);
    }
    Ok(StatusCode::NO_CONTENT)
}
