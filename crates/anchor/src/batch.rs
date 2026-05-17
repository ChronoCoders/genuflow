#![deny(warnings)]

use std::time::Duration;

use alloy::{
    network::{EthereumWallet, TransactionBuilder},
    primitives::{keccak256, Bytes, FixedBytes, B256, U256},
    providers::{Provider, ProviderBuilder},
    rpc::types::TransactionRequest,
    signers::local::PrivateKeySigner,
};
use common::AppError;
use sha2::{Digest, Sha256};
use tokio::time::sleep;
use tracing::{info, instrument, warn};
use uuid::Uuid;

/// Domain-separator prefix prepended to every anchor payload. Computed once
/// from a static string so verifiers can recognise Genuflow anchors on-chain.
const ANCHOR_DOMAIN: &[u8] = b"genuflow:anchor:v1";

/// Minimum number of block confirmations required before an anchor is
/// considered final.
pub const MIN_CONFIRMATIONS: u64 = 3;

/// How often to poll the chain for receipt status while awaiting
/// confirmations.
const POLL_INTERVAL: Duration = Duration::from_secs(2);

/// Maximum wall-clock time to spend in a single `await_confirmation` call.
/// Beyond this, the call returns an error and the batch stays pending; the
/// next poller tick can resume it.
const CONFIRMATION_TIMEOUT: Duration = Duration::from_secs(300);

/// Compute SHA-256 of sorted event IDs.
///
/// IDs are sorted before hashing to ensure determinism regardless of query order.
pub fn hash_event_ids(ids: &[Uuid]) -> String {
    let mut sorted: Vec<String> = ids.iter().map(|id| id.to_string()).collect();
    sorted.sort();

    let mut hasher = Sha256::new();
    for id in &sorted {
        hasher.update(id.as_bytes());
    }

    hex::encode(hasher.finalize())
}

/// Broadcast a single anchor transaction without waiting for confirmations.
///
/// Calldata format: `keccak256("genuflow:anchor:v1")` (32 bytes) followed by
/// `records_hash` (32 bytes), for 64 bytes total. The transaction is sent
/// from the anchor wallet to itself with zero value.
///
/// Returns the transaction hash as `0x`-prefixed hex.
#[instrument(skip(rpc_url, private_key, records_hash), err)]
pub async fn broadcast(
    rpc_url: &str,
    private_key: &str,
    records_hash: &str,
) -> Result<String, AppError> {
    let records_bytes = decode_records_hash(records_hash)?;

    let signer: PrivateKeySigner = private_key
        .parse()
        .map_err(|e| AppError::Internal(format!("invalid anchor private key: {e}")))?;
    let from = signer.address();
    let wallet = EthereumWallet::from(signer);

    let provider = ProviderBuilder::new()
        .with_recommended_fillers()
        .wallet(wallet)
        .on_builtin(rpc_url)
        .await
        .map_err(|e| AppError::Internal(format!("Base RPC connect failed: {e}")))?;

    let domain: FixedBytes<32> = keccak256(ANCHOR_DOMAIN);
    let mut calldata = Vec::with_capacity(64);
    calldata.extend_from_slice(domain.as_slice());
    calldata.extend_from_slice(&records_bytes);

    let tx = TransactionRequest::default()
        .with_from(from)
        .with_to(from)
        .with_value(U256::ZERO)
        .with_input(Bytes::from(calldata));

    let pending = provider
        .send_transaction(tx)
        .await
        .map_err(|e| AppError::Internal(format!("send_transaction failed: {e}")))?;

    let tx_hash = *pending.tx_hash();
    let tx_hash_hex = format!("0x{}", hex::encode(tx_hash.as_slice()));
    info!(tx_hash = %tx_hash_hex, "anchor: tx broadcast");
    Ok(tx_hash_hex)
}

/// Wait for `tx_hash` to accumulate [`MIN_CONFIRMATIONS`] confirmations on
/// Base mainnet, then return the containing block number.
///
/// Bounded by [`CONFIRMATION_TIMEOUT`]; on timeout returns an error and the
/// caller is expected to resume on a later tick.
#[instrument(skip(rpc_url, tx_hash), err)]
pub async fn await_confirmation(rpc_url: &str, tx_hash: &str) -> Result<i64, AppError> {
    let tx_hash_bytes = parse_tx_hash(tx_hash)?;

    let provider = ProviderBuilder::new()
        .on_builtin(rpc_url)
        .await
        .map_err(|e| AppError::Internal(format!("Base RPC connect failed: {e}")))?;

    let deadline = tokio::time::Instant::now() + CONFIRMATION_TIMEOUT;
    loop {
        if let Some((block_number, confirmations)) =
            receipt_status(&provider, tx_hash_bytes).await?
        {
            if confirmations >= MIN_CONFIRMATIONS {
                let block_i64 = i64::try_from(block_number).map_err(|_| {
                    AppError::Internal(format!(
                        "block_number {block_number} does not fit in i64"
                    ))
                })?;
                info!(
                    tx_hash = %tx_hash,
                    block_number = block_i64,
                    confirmations,
                    "anchor: confirmed on Base mainnet"
                );
                return Ok(block_i64);
            }
        }

        if tokio::time::Instant::now() >= deadline {
            return Err(AppError::Internal(format!(
                "timed out waiting for {MIN_CONFIRMATIONS} confirmations on tx {tx_hash}"
            )));
        }
        sleep(POLL_INTERVAL).await;
    }
}

/// Check on-chain status of a tx without blocking. Returns:
/// - `Ok(None)` if no receipt is yet available
/// - `Ok(Some((block_number, confirmations)))` if mined
///
/// Used by the poller's pending-row resolver to decide whether to confirm
/// or to keep waiting / expire.
pub async fn receipt_status_for(
    rpc_url: &str,
    tx_hash: &str,
) -> Result<Option<(u64, u64)>, AppError> {
    let tx_hash_bytes = parse_tx_hash(tx_hash)?;
    let provider = ProviderBuilder::new()
        .on_builtin(rpc_url)
        .await
        .map_err(|e| AppError::Internal(format!("Base RPC connect failed: {e}")))?;
    receipt_status(&provider, tx_hash_bytes).await
}

async fn receipt_status<P: Provider>(
    provider: &P,
    tx_hash: B256,
) -> Result<Option<(u64, u64)>, AppError> {
    let receipt = provider
        .get_transaction_receipt(tx_hash)
        .await
        .map_err(|e| AppError::Internal(format!("get_transaction_receipt failed: {e}")))?;

    let Some(receipt) = receipt else {
        return Ok(None);
    };

    let Some(block_number) = receipt.block_number else {
        // Mined but block number missing — treat as not-yet-confirmable.
        warn!("anchor: receipt has no block_number, treating as pending");
        return Ok(None);
    };

    let head = provider
        .get_block_number()
        .await
        .map_err(|e| AppError::Internal(format!("get_block_number failed: {e}")))?;

    let confirmations = head.saturating_sub(block_number).saturating_add(1);
    Ok(Some((block_number, confirmations)))
}

fn decode_records_hash(records_hash: &str) -> Result<Vec<u8>, AppError> {
    let bytes = hex::decode(records_hash)
        .map_err(|e| AppError::Internal(format!("records_hash is not valid hex: {e}")))?;
    if bytes.len() != 32 {
        return Err(AppError::Internal(format!(
            "records_hash must be 32 bytes, got {}",
            bytes.len()
        )));
    }
    Ok(bytes)
}

fn parse_tx_hash(tx_hash: &str) -> Result<B256, AppError> {
    let stripped = tx_hash.strip_prefix("0x").unwrap_or(tx_hash);
    let bytes = hex::decode(stripped)
        .map_err(|e| AppError::Internal(format!("tx_hash is not valid hex: {e}")))?;
    if bytes.len() != 32 {
        return Err(AppError::Internal(format!(
            "tx_hash must be 32 bytes, got {}",
            bytes.len()
        )));
    }
    Ok(B256::from_slice(&bytes))
}
