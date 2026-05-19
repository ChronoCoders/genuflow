#![deny(warnings)]

pub mod admin;
pub mod anchors;
pub mod auth;
pub mod billing;
pub mod bulk_products;
pub mod dashboard;
pub mod events;
pub mod keys;
pub mod products;
pub mod settings;
pub mod team;
pub mod verify;
pub mod webhook_endpoints;
pub mod webhooks;

use axum::{
    extract::DefaultBodyLimit,
    middleware::from_fn_with_state,
    routing::{delete, get, post},
    Router,
};
use serde::Deserialize;

use crate::middleware::auth::require_api_key;
use crate::middleware::session::require_session;
use crate::state::AppState;

/// Shared query-string pagination parameters. `limit` is clamped to
/// `MAX_LIMIT` so callers cannot ask for unbounded result sets.
#[derive(Debug, Deserialize)]
pub struct PageParams {
    #[serde(default = "PageParams::default_limit")]
    pub limit: i64,
    #[serde(default)]
    pub offset: i64,
}

impl PageParams {
    const DEFAULT_LIMIT: i64 = 50;
    const MAX_LIMIT: i64 = 200;

    fn default_limit() -> i64 {
        Self::DEFAULT_LIMIT
    }

    /// Clamp `limit` into `[1, MAX_LIMIT]` and `offset` into `[0, _)`.
    pub fn normalized(&self) -> (i64, i64) {
        let limit = self.limit.clamp(1, Self::MAX_LIMIT);
        let offset = self.offset.max(0);
        (limit, offset)
    }
}

pub fn router(state: AppState) -> Router {
    let auth_open = Router::new()
        .route("/register", post(auth::register))
        .route("/login", post(auth::login))
        .route("/logout", post(auth::logout))
        .route("/accept-invite/:token", post(auth::accept_invite));

    let auth_me = Router::new()
        .route("/me", get(auth::me))
        .route_layer(from_fn_with_state(state.clone(), require_session));

    let auth = Router::new().merge(auth_open).merge(auth_me);

    // Team management. Session-only (API keys are brand-scoped and
    // carry no user identity, so role checks would be meaningless).
    let team = Router::new()
        .route("/", get(team::get))
        .route("/invite", post(team::create_invite))
        .route("/invite/:id", delete(team::revoke_invite))
        .route("/:user_id", delete(team::remove_member))
        .route("/:user_id/role", axum::routing::patch(team::change_role))
        .route_layer(from_fn_with_state(state.clone(), require_session));

    // Brand-level settings (custom verification domain). Session-only
    // for the same reason as /v1/team: the OwnerOnly extractor needs a
    // user role, which API keys don't carry.
    let settings = Router::new()
        .route(
            "/domain",
            axum::routing::put(settings::set_domain),
        )
        .route_layer(from_fn_with_state(state.clone(), require_session));

    let v1 = Router::new()
        .route("/dashboard", get(dashboard::metrics))
        .route("/keys", get(keys::list_keys).post(keys::create_key))
        .route("/keys/:id", delete(keys::revoke_key))
        .route("/products", get(products::list).post(products::register))
        .route("/products/bulk", post(bulk_products::bulk_json))
        .route(
            "/products/bulk/csv",
            post(bulk_products::bulk_csv)
                .layer(DefaultBodyLimit::max(bulk_products::MAX_CSV_BYTES)),
        )
        .route("/products/:id", get(products::get))
        .route("/products/:id/events", get(products::list_events).post(events::record))
        .route("/products/:id/qr", get(products::qr))
        .route("/events", get(events::list))
        .route("/anchors", get(anchors::list))
        .route("/billing", get(billing::get))
        .route(
            "/billing/create-checkout-session",
            post(billing::create_checkout_session),
        )
        .route(
            "/webhooks",
            get(webhook_endpoints::list).post(webhook_endpoints::create),
        )
        .route("/webhooks/:id", delete(webhook_endpoints::deactivate))
        .route(
            "/webhooks/:id/deliveries",
            get(webhook_endpoints::list_deliveries),
        )
        .route_layer(from_fn_with_state(state.clone(), require_api_key));

    let admin = Router::new()
        .route("/brands", post(admin::create_brand))
        .route_layer(from_fn_with_state(state.clone(), require_api_key));

    let verify = Router::new()
        .route("/:product_id", get(verify::verify))
        .route("/:product_id/transfer", post(verify::transfer));

    let webhooks = Router::new().route("/stripe", post(webhooks::stripe));

    Router::new()
        .nest("/auth", auth)
        .nest("/v1", v1)
        .nest("/v1/team", team)
        .nest("/v1/settings", settings)
        .nest("/admin", admin)
        .nest("/verify", verify)
        .nest("/webhooks", webhooks)
        .with_state(state)
}
