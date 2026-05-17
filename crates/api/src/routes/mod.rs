#![deny(warnings)]

pub mod admin;
pub mod events;
pub mod keys;
pub mod products;
pub mod verify;

use axum::{
    middleware::from_fn_with_state,
    routing::{delete, get, post},
    Router,
};

use crate::middleware::auth::require_api_key;
use crate::state::AppState;

pub fn router(state: AppState) -> Router {
    let v1 = Router::new()
        .route("/keys", post(keys::create_key))
        .route("/keys/:id", delete(keys::revoke_key))
        .route("/products", post(products::register))
        .route("/products/:id", get(products::get))
        .route("/products/:id/events", post(events::record))
        .route_layer(from_fn_with_state(state.clone(), require_api_key));

    let admin = Router::new()
        .route("/brands", post(admin::create_brand))
        .route_layer(from_fn_with_state(state.clone(), require_api_key));

    let verify = Router::new().route("/:product_id", get(verify::verify));

    Router::new()
        .nest("/v1", v1)
        .nest("/admin", admin)
        .nest("/verify", verify)
        .with_state(state)
}
