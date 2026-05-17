#![deny(warnings)]

mod middleware;
mod routes;
mod state;

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

    let state = state::AppState { db: pool };
    let app = routes::router(state);

    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", api_port)).await?;
    info!("genuflow listening on port {}", api_port);

    axum::serve(listener, app).await?;
    Ok(())
}
