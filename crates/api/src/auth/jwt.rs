#![deny(warnings)]

//! HS256 JWT signing and verification for dashboard sessions.

use chrono::{Duration, Utc};
use common::AppError;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::SESSION_TTL_SECS;

/// Claims carried in the session JWT.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    /// Subject — the user id.
    pub sub: Uuid,
    /// Brand the user belongs to.
    pub brand_id: Uuid,
    /// Issued-at, seconds since epoch.
    pub iat: i64,
    /// Expiration, seconds since epoch.
    pub exp: i64,
}

/// Sign a new session token for `user_id` belonging to `brand_id`.
pub fn sign(secret: &str, user_id: Uuid, brand_id: Uuid) -> Result<String, AppError> {
    let now = Utc::now();
    let exp = now + Duration::seconds(SESSION_TTL_SECS);
    let claims = Claims {
        sub: user_id,
        brand_id,
        iat: now.timestamp(),
        exp: exp.timestamp(),
    };
    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| AppError::Internal(format!("JWT sign failed: {e}")))
}

/// Verify a session token. Any failure (expired, malformed, bad signature)
/// collapses to `AppError::Unauthorized` so the client cannot distinguish
/// between cases.
pub fn verify(secret: &str, token: &str) -> Result<Claims, AppError> {
    let data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|_| AppError::Unauthorized)?;
    Ok(data.claims)
}
