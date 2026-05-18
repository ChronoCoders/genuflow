#![deny(warnings)]

//! Stripe webhook ingestion.
//!
//! `POST /webhooks/stripe` — public, no middleware. The handler verifies
//! the request signature against the configured webhook secret using
//! Stripe's documented `t=…,v1=…` scheme, then dispatches on the event
//! type. When `STRIPE_SECRET_KEY` is not set the endpoint exists but
//! returns 503 to make the misconfiguration loud.

use axum::{
    body::Bytes,
    extract::State,
    http::{HeaderMap, StatusCode},
};
use chrono::{TimeZone, Utc};
use common::{Plan, SubscriptionStatus};
use hmac::{Hmac, Mac};
use serde::Deserialize;
use serde_json::Value;
use sha2::Sha256;
use subtle::ConstantTimeEq;
use tracing::{info, warn};

use crate::state::AppState;

type HmacSha256 = Hmac<Sha256>;

/// Stripe documents 5 minutes as the default tolerance window. We follow it
/// exactly so an attacker who captures a valid signature cannot replay it
/// indefinitely.
const SIGNATURE_TOLERANCE_SECS: i64 = 300;

pub async fn stripe(
    State(state): State<AppState>,
    headers: HeaderMap,
    body: Bytes,
) -> Result<StatusCode, (StatusCode, String)> {
    let Some(stripe) = state.stripe.as_ref().as_ref() else {
        return Err((
            StatusCode::SERVICE_UNAVAILABLE,
            "stripe is not configured on this deployment".into(),
        ));
    };

    let webhook_secret = stripe.webhook_secret.as_deref().ok_or((
        StatusCode::SERVICE_UNAVAILABLE,
        "STRIPE_WEBHOOK_SECRET is not configured".to_string(),
    ))?;

    let signature_header = headers
        .get("stripe-signature")
        .and_then(|v| v.to_str().ok())
        .ok_or((
            StatusCode::BAD_REQUEST,
            "missing Stripe-Signature header".into(),
        ))?;

    verify_signature(signature_header, &body, webhook_secret).map_err(|reason| {
        warn!(reason, "stripe webhook signature verification failed");
        (StatusCode::BAD_REQUEST, format!("invalid signature: {reason}"))
    })?;

    let event: StripeEvent = serde_json::from_slice(&body).map_err(|e| {
        warn!(error = %e, "stripe webhook body was not valid JSON");
        (StatusCode::BAD_REQUEST, format!("bad request body: {e}"))
    })?;

    info!(event_type = %event.event_type, "stripe webhook received");

    match event.event_type.as_str() {
        "checkout.session.completed" => {
            handle_checkout_session_completed(&state, &event.data.object, stripe).await
        }
        "customer.subscription.updated" | "customer.subscription.deleted" => {
            handle_subscription_event(&state, &event.event_type, &event.data.object, stripe).await
        }
        // Any other event type is acknowledged so Stripe doesn't retry,
        // but we don't do anything with it.
        _ => Ok(StatusCode::OK),
    }
}

#[derive(Deserialize)]
struct StripeEvent {
    #[serde(rename = "type")]
    event_type: String,
    data: StripeEventData,
}

#[derive(Deserialize)]
struct StripeEventData {
    object: Value,
}

async fn handle_checkout_session_completed(
    state: &AppState,
    object: &Value,
    _stripe: &crate::state::StripeConfig,
) -> Result<StatusCode, (StatusCode, String)> {
    // `client_reference_id` is the field we use to round-trip brand id
    // (set in `create-checkout-session`). `subscription` and `customer`
    // are populated when the session is mode=subscription.
    let brand_id_str = object
        .get("client_reference_id")
        .and_then(|v| v.as_str())
        .ok_or((
            StatusCode::BAD_REQUEST,
            "checkout session missing client_reference_id".into(),
        ))?;
    let brand_id = brand_id_str.parse::<uuid::Uuid>().map_err(|e| {
        (
            StatusCode::BAD_REQUEST,
            format!("invalid client_reference_id: {e}"),
        )
    })?;

    let customer_id = object
        .get("customer")
        .and_then(|v| v.as_str())
        .ok_or((
            StatusCode::BAD_REQUEST,
            "checkout session missing customer".into(),
        ))?;
    let subscription_id = object
        .get("subscription")
        .and_then(|v| v.as_str())
        .ok_or((
            StatusCode::BAD_REQUEST,
            "checkout session missing subscription".into(),
        ))?;

    db::subscriptions::update_stripe_ids(&state.db, brand_id, customer_id, subscription_id)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("database error: {e}"),
            )
        })?;

    Ok(StatusCode::OK)
}

async fn handle_subscription_event(
    state: &AppState,
    event_type: &str,
    object: &Value,
    stripe: &crate::state::StripeConfig,
) -> Result<StatusCode, (StatusCode, String)> {
    let subscription_id = object.get("id").and_then(|v| v.as_str()).ok_or((
        StatusCode::BAD_REQUEST,
        "subscription event missing id".into(),
    ))?;

    let status = if event_type == "customer.subscription.deleted" {
        SubscriptionStatus::Canceled
    } else {
        match object.get("status").and_then(|v| v.as_str()) {
            Some("active") => SubscriptionStatus::Active,
            Some("trialing") => SubscriptionStatus::Trialing,
            Some("past_due") => SubscriptionStatus::PastDue,
            Some("canceled") | Some("unpaid") | Some("incomplete_expired") => {
                SubscriptionStatus::Canceled
            }
            // Any other status (incomplete, paused, etc.) is treated as
            // past_due — the brand keeps their plan but is flagged.
            _ => SubscriptionStatus::PastDue,
        }
    };

    let plan = plan_from_subscription(object, stripe).unwrap_or(Plan::Maison);

    let current_period_end = object
        .get("current_period_end")
        .and_then(|v| v.as_i64())
        .and_then(|secs| Utc.timestamp_opt(secs, 0).single());

    let rows = db::subscriptions::update_status(
        &state.db,
        subscription_id,
        plan,
        status,
        current_period_end,
    )
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("database error: {e}"),
        )
    })?;

    if rows == 0 {
        info!(
            subscription_id,
            "stripe subscription event for unknown local subscription — ignoring"
        );
    }

    Ok(StatusCode::OK)
}

fn plan_from_subscription(object: &Value, stripe: &crate::state::StripeConfig) -> Option<Plan> {
    // The price id lives at items.data[0].price.id on a Stripe Subscription.
    let price_id = object
        .pointer("/items/data/0/price/id")
        .and_then(|v| v.as_str())?;
    if stripe
        .price_id_maison
        .as_deref()
        .is_some_and(|id| id == price_id)
    {
        Some(Plan::Maison)
    } else if stripe
        .price_id_couture
        .as_deref()
        .is_some_and(|id| id == price_id)
    {
        Some(Plan::Couture)
    } else {
        None
    }
}

/// Verify a Stripe webhook signature. Returns `Ok(())` on success or a
/// short reason string on failure (suitable for logs and the 400
/// response body).
fn verify_signature(header: &str, body: &[u8], secret: &str) -> Result<(), String> {
    // Header shape: `t=<ts>,v1=<hex>[,v1=<hex>...][,v0=...]`
    let mut timestamp: Option<i64> = None;
    let mut v1_signatures: Vec<String> = Vec::new();
    for kv in header.split(',') {
        let (k, v) = kv.split_once('=').ok_or_else(|| "malformed header".to_string())?;
        match k.trim() {
            "t" => {
                timestamp = Some(v.trim().parse::<i64>().map_err(|_| "bad timestamp")?);
            }
            "v1" => v1_signatures.push(v.trim().to_string()),
            _ => {}
        }
    }
    let timestamp = timestamp.ok_or_else(|| "missing timestamp".to_string())?;
    if v1_signatures.is_empty() {
        return Err("no v1 signature in header".into());
    }

    let now = Utc::now().timestamp();
    if (now - timestamp).abs() > SIGNATURE_TOLERANCE_SECS {
        return Err("timestamp outside tolerance".into());
    }

    let mut mac = HmacSha256::new_from_slice(secret.as_bytes())
        .map_err(|e| format!("hmac init failed: {e}"))?;
    mac.update(timestamp.to_string().as_bytes());
    mac.update(b".");
    mac.update(body);
    let expected = mac.finalize().into_bytes();
    let expected_hex = hex::encode(expected);
    let expected_bytes = expected_hex.as_bytes();

    let any_match = v1_signatures.iter().any(|sig| {
        let sig_bytes = sig.as_bytes();
        sig_bytes.len() == expected_bytes.len()
            && bool::from(sig_bytes.ct_eq(expected_bytes))
    });

    if any_match {
        Ok(())
    } else {
        Err("no signature matched".into())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_header(secret: &str, body: &[u8], timestamp: i64) -> String {
        let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).unwrap();
        mac.update(timestamp.to_string().as_bytes());
        mac.update(b".");
        mac.update(body);
        let sig = hex::encode(mac.finalize().into_bytes());
        format!("t={timestamp},v1={sig}")
    }

    #[test]
    fn verify_signature_accepts_valid() {
        let secret = "whsec_test";
        let body = br#"{"hello":"world"}"#;
        let ts = Utc::now().timestamp();
        let header = make_header(secret, body, ts);
        verify_signature(&header, body, secret).unwrap();
    }

    #[test]
    fn verify_signature_rejects_tampered_body() {
        let secret = "whsec_test";
        let body = br#"{"hello":"world"}"#;
        let ts = Utc::now().timestamp();
        let header = make_header(secret, body, ts);
        let result = verify_signature(&header, br#"{"hello":"there"}"#, secret);
        assert!(result.is_err());
    }

    #[test]
    fn verify_signature_rejects_old_timestamp() {
        let secret = "whsec_test";
        let body = b"x";
        let ts = Utc::now().timestamp() - (SIGNATURE_TOLERANCE_SECS + 60);
        let header = make_header(secret, body, ts);
        let result = verify_signature(&header, body, secret);
        assert!(result.is_err());
    }

    #[test]
    fn verify_signature_rejects_wrong_secret() {
        let body = b"x";
        let ts = Utc::now().timestamp();
        let header = make_header("right", body, ts);
        let result = verify_signature(&header, body, "wrong");
        assert!(result.is_err());
    }
}
