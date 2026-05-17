#![deny(warnings)]

pub mod poller;
pub mod batch;

use std::time::Duration;
use tokio::time;
use tracing::{error, info};

/// Anchor service configuration.
pub struct AnchorConfig {
    /// Base mainnet RPC URL.
    pub rpc_url: String,
    /// Private key for the anchor wallet (hex, no 0x prefix).
    pub private_key: String,
    /// How often to run the anchor job.
    pub interval: Duration,
}

/// Start the anchor background task.
///
/// Runs indefinitely. Errors within a single run are logged and skipped;
/// they do not terminate the task.
pub async fn run(config: AnchorConfig, db: db::Db) {
    info!("anchor service started, interval={:?}", config.interval);
    let mut ticker = time::interval(config.interval);

    loop {
        ticker.tick().await;
        if let Err(e) = poller::run_once(&config, &db).await {
            error!("anchor run failed: {}", e);
        }
    }
}
