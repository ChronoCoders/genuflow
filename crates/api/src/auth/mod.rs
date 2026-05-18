#![deny(warnings)]

pub mod jwt;
pub mod password;

use uuid::Uuid;

/// Newtype wrapping the authenticated user's id. Used as an axum
/// `Extension` so handlers can distinguish it from `brand_id` (both are
/// `Uuid` and would otherwise collide in the extension map).
#[derive(Debug, Clone, Copy)]
pub struct UserId(pub Uuid);

/// Cookie name carrying the session JWT.
pub const SESSION_COOKIE: &str = "gf_session";

/// Cookie lifetime in seconds — matches the JWT `exp`.
pub const SESSION_TTL_SECS: i64 = 24 * 60 * 60;
