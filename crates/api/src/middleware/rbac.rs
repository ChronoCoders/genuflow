#![deny(warnings)]

//! Role-based authorization extractors. Both are typed wrappers around
//! the `UserRole` extension injected by `require_session`. A handler
//! that takes `OwnerOnly` cannot run for non-owners; the extractor
//! returns `AppError::Forbidden` *before* the handler body executes.

use axum::{async_trait, extract::FromRequestParts, http::request::Parts};
use common::{AppError, UserRole};

/// Extractor that fails with 403 unless the calling user is an owner.
pub struct OwnerOnly;

#[async_trait]
impl<S> FromRequestParts<S> for OwnerOnly
where
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, _: &S) -> Result<Self, Self::Rejection> {
        let role = parts
            .extensions
            .get::<UserRole>()
            .copied()
            .ok_or(AppError::Unauthorized)?;
        if matches!(role, UserRole::Owner) {
            Ok(OwnerOnly)
        } else {
            Err(AppError::Forbidden(
                "owner role required for this action".into(),
            ))
        }
    }
}

/// Extractor that fails with 403 unless the calling user is an owner
/// or admin.
pub struct OwnerOrAdmin;

#[async_trait]
impl<S> FromRequestParts<S> for OwnerOrAdmin
where
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, _: &S) -> Result<Self, Self::Rejection> {
        let role = parts
            .extensions
            .get::<UserRole>()
            .copied()
            .ok_or(AppError::Unauthorized)?;
        if matches!(role, UserRole::Owner | UserRole::Admin) {
            Ok(OwnerOrAdmin)
        } else {
            Err(AppError::Forbidden(
                "owner or admin role required for this action".into(),
            ))
        }
    }
}
