#![deny(warnings)]

mod auth;
mod middleware;
mod routes;
mod state;

use std::sync::Arc;
use std::time::Duration;

use anyhow::Context;
use tracing::info;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    let database_url = std::env::var("DATABASE_URL").context("DATABASE_URL must be set")?;
    let api_port: u16 = std::env::var("API_PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse()
        .context("API_PORT must be a valid port number")?;

    let pool = sqlx::PgPool::connect(&database_url).await?;
    sqlx::migrate!("../../migrations").run(&pool).await?;

    let jwt_secret = std::env::var("JWT_SECRET").context("JWT_SECRET must be set")?;
    let cookie_secure = std::env::var("COOKIE_SECURE")
        .map(|v| v != "false")
        .unwrap_or(true);
    let public_base_url = std::env::var("PUBLIC_BASE_URL")
        .unwrap_or_else(|_| "http://localhost:3000".to_string())
        .trim_end_matches('/')
        .to_string();

    let rpc_url = std::env::var("BASE_RPC_URL").context("BASE_RPC_URL must be set")?;
    let private_key =
        std::env::var("ANCHOR_PRIVATE_KEY").context("ANCHOR_PRIVATE_KEY must be set")?;

    let anchor_config = anchor::AnchorConfig {
        rpc_url,
        private_key,
        interval: Duration::from_secs(7200),
    };

    let db_clone = pool.clone();
    tokio::spawn(async move {
        anchor::run(anchor_config, db_clone).await;
    });

    let db_clone = pool.clone();
    tokio::spawn(async move {
        webhooks::run(webhooks::WebhookConfig::default(), db_clone).await;
    });

    let stripe_config = std::env::var("STRIPE_SECRET_KEY").ok().map(|secret_key| {
        state::StripeConfig {
            secret_key,
            webhook_secret: std::env::var("STRIPE_WEBHOOK_SECRET").ok(),
            price_id_maison: std::env::var("STRIPE_PRICE_ID_MAISON").ok(),
            price_id_couture: std::env::var("STRIPE_PRICE_ID_COUTURE").ok(),
            http: reqwest::Client::new(),
        }
    });
    if stripe_config.is_none() {
        info!("STRIPE_SECRET_KEY not set — billing endpoints will run in placeholder mode");
    }

    let state = state::AppState {
        db: pool,
        auth: Arc::new(state::AuthConfig {
            jwt_secret,
            cookie_secure,
        }),
        public_base_url: Arc::new(public_base_url),
        stripe: Arc::new(stripe_config),
    };
    let app = routes::router(state);

    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", api_port)).await?;
    info!("genuflow listening on port {}", api_port);

    axum::serve(listener, app).await?;
    Ok(())
}
