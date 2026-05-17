#![deny(warnings)]

use db::Db;

/// Shared application state injected into all handlers.
#[derive(Clone)]
pub struct AppState {
    pub db: Db,
}
