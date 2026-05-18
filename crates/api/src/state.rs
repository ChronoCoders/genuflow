#![deny(warnings)]

use std::sync::Arc;

use db::Db;

/// Shared application state injected into all handlers.
#[derive(Clone)]
pub struct AppState {
    pub db: Db,
    pub auth: Arc<AuthConfig>,
}

/// Auth-related runtime configuration. Wrapped in `Arc` so the AppState
/// clone happening on every request stays cheap.
pub struct AuthConfig {
    /// HS256 secret used to sign and verify session JWTs.
    pub jwt_secret: String,
    /// Whether the session cookie carries the `Secure` flag. Should be
    /// `true` in production (HTTPS-only) and `false` for local HTTP dev.
    pub cookie_secure: bool,
}
