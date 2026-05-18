#![deny(warnings)]

use std::sync::Arc;

use db::Db;

/// Shared application state injected into all handlers.
#[derive(Clone)]
pub struct AppState {
    pub db: Db,
    pub auth: Arc<AuthConfig>,
    /// Origin used to build user-facing URLs (e.g., the verify URL encoded
    /// into product QR codes). No trailing slash. Reads from
    /// `PUBLIC_BASE_URL`, defaults to `http://localhost:3000` for dev.
    pub public_base_url: Arc<String>,
    /// Stripe configuration. When `None`, billing endpoints respond with
    /// placeholder values and the webhook handler rejects all requests.
    pub stripe: Arc<Option<StripeConfig>>,
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

/// Stripe-side configuration. Populated only when `STRIPE_SECRET_KEY` is
/// set; otherwise the whole `Option` is `None` and the billing endpoints
/// fall back to placeholder behaviour.
pub struct StripeConfig {
    pub secret_key: String,
    pub webhook_secret: Option<String>,
    pub price_id_maison: Option<String>,
    pub price_id_couture: Option<String>,
    /// Pre-built shared HTTP client used for all outbound calls to Stripe.
    pub http: reqwest::Client,
}
