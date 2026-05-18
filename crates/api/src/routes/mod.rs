#![deny(warnings)]

pub mod admin;
pub mod anchors;
pub mod auth;
pub mod dashboard;
pub mod events;
pub mod keys;
pub mod products;
pub mod verify;

use axum::{
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
        .route("/logout", post(auth::logout));

    let auth_me = Router::new()
        .route("/me", get(auth::me))
        .route_layer(from_fn_with_state(state.clone(), require_session));

    let auth = Router::new().merge(auth_open).merge(auth_me);

    let v1 = Router::new()
        .route("/dashboard", get(dashboard::metrics))
        .route("/keys", get(keys::list_keys).post(keys::create_key))
        .route("/keys/:id", delete(keys::revoke_key))
        .route("/products", get(products::list).post(products::register))
        .route("/products/:id", get(products::get))
        .route("/products/:id/events", get(products::list_events).post(events::record))
        .route("/products/:id/qr", get(products::qr))
        .route("/events", get(events::list))
        .route("/anchors", get(anchors::list))
        .route_layer(from_fn_with_state(state.clone(), require_api_key));

    let admin = Router::new()
        .route("/brands", post(admin::create_brand))
        .route_layer(from_fn_with_state(state.clone(), require_api_key));

    let verify = Router::new().route("/:product_id", get(verify::verify));

    Router::new()
        .nest("/auth", auth)
        .nest("/v1", v1)
        .nest("/admin", admin)
        .nest("/verify", verify)
        .with_state(state)
}
