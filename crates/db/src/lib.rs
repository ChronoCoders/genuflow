#![deny(warnings)]

pub mod brands;
pub mod api_keys;
pub mod products;
pub mod events;
pub mod anchors;
pub mod users;
pub mod subscriptions;
pub mod usage_records;

use sqlx::PgPool;

/// Shared database pool type alias.
pub type Db = PgPool;
