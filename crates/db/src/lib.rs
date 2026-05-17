#![deny(warnings)]

pub mod brands;
pub mod api_keys;
pub mod products;
pub mod events;
pub mod anchors;

use sqlx::PgPool;

/// Shared database pool type alias.
pub type Db = PgPool;
