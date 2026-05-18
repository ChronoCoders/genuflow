#![deny(warnings)]

//! Billing endpoints — `GET /v1/billing` and
//! `POST /v1/billing/create-checkout-session`.
//!
//! Both endpoints are scoped to the authenticated brand. The checkout
//! handler is Stripe-ready but degrades gracefully when no Stripe key is
//! configured: it returns a placeholder URL so that the frontend flow can
//! be exercised end-to-end during development without a real Stripe
//! account.

use axum::{
    extract::{Extension, State},
    Json,
};
use chrono::{DateTime, Utc};
use common::{AppError, Plan, SubscriptionStatus};
use serde::{Deserialize, Serialize};
use tracing::warn;
use uuid::Uuid;

use crate::state::AppState;

/// Generic message returned to API callers when a Stripe-side error
/// occurs. Detail is captured server-side via `tracing` rather than
/// echoed to the client, so we don't expose Stripe response bodies or
/// internal request shapes through error responses.
const PAYMENT_PROVIDER_ERROR: &str = "payment provider error; please try again later";

#[derive(Serialize)]
pub struct BillingResponse {
    pub plan: Plan,
    pub status: SubscriptionStatus,
    pub product_count: i64,
    /// `None` means the plan has no ceiling (Couture).
    pub product_limit: Option<i64>,
    pub current_period_end: Option<DateTime<Utc>>,
    pub stripe_configured: bool,
}

/// `GET /v1/billing` — current plan, usage, and limit for the brand.
pub async fn get(
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
) -> Result<Json<BillingResponse>, AppError> {
    let subscription = db::subscriptions::get_by_brand(&state.db, brand_id).await?;
    let product_count = db::products::count_by_brand(&state.db, brand_id).await?;

    // Defensive default for any pre-Phase-4 brand without a subscription
    // row. New brands always have one (created at registration).
    let (plan, status, current_period_end) = subscription
        .as_ref()
        .map(|s| (s.plan, s.status, s.current_period_end))
        .unwrap_or((Plan::Atelier, SubscriptionStatus::Active, None));

    Ok(Json(BillingResponse {
        plan,
        status,
        product_count,
        product_limit: plan.product_limit(),
        current_period_end,
        stripe_configured: state.stripe.is_some(),
    }))
}

#[derive(Deserialize)]
pub struct CreateCheckoutRequest {
    pub plan: Plan,
}

#[derive(Serialize)]
pub struct CreateCheckoutResponse {
    pub url: String,
    /// `true` when Stripe is configured and the URL points at a real
    /// Stripe Checkout session; `false` when the URL is a local
    /// placeholder.
    pub stripe: bool,
}

/// `POST /v1/billing/create-checkout-session` — initiate an upgrade.
///
/// When `STRIPE_SECRET_KEY` is set, this hits Stripe's
/// `/v1/checkout/sessions` endpoint and returns the hosted URL. When it is
/// not, the handler returns a placeholder URL so the frontend integration
/// can be exercised end-to-end without a Stripe account.
pub async fn create_checkout_session(
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
    Json(body): Json<CreateCheckoutRequest>,
) -> Result<Json<CreateCheckoutResponse>, AppError> {
    if matches!(body.plan, Plan::Atelier) {
        return Err(AppError::BadRequest(
            "atelier is the default plan; nothing to upgrade".into(),
        ));
    }

    let Some(stripe) = state.stripe.as_ref().as_ref() else {
        // Graceful fallback. The placeholder URL bounces back to the
        // dashboard so the frontend can exercise the redirect path.
        let url = format!(
            "{}/billing?placeholder=1&plan={}",
            state.public_base_url,
            plan_slug(body.plan),
        );
        return Ok(Json(CreateCheckoutResponse { url, stripe: false }));
    };

    let price_id = match body.plan {
        Plan::Maison => stripe.price_id_maison.as_deref(),
        Plan::Couture => stripe.price_id_couture.as_deref(),
        Plan::Atelier => unreachable!("rejected above"),
    }
    .ok_or_else(|| {
        AppError::Internal(format!(
            "stripe price id is not configured for plan {}",
            plan_slug(body.plan),
        ))
    })?;

    // Stripe Checkout takes URL-encoded form data, not JSON. Build the
    // form body manually so we keep the dependency surface minimal.
    let success_url = format!("{}/billing?session=success", state.public_base_url);
    let cancel_url = format!("{}/billing?session=cancel", state.public_base_url);
    let form = [
        ("mode", "subscription".to_string()),
        ("line_items[0][price]", price_id.to_string()),
        ("line_items[0][quantity]", "1".to_string()),
        ("success_url", success_url),
        ("cancel_url", cancel_url),
        ("client_reference_id", brand_id.to_string()),
        ("metadata[brand_id]", brand_id.to_string()),
        ("metadata[plan]", plan_slug(body.plan).to_string()),
    ];

    let resp = stripe
        .http
        .post("https://api.stripe.com/v1/checkout/sessions")
        .basic_auth(&stripe.secret_key, Some(""))
        .form(&form)
        .send()
        .await
        .map_err(|e| {
            warn!(error = %e, brand_id = %brand_id, "stripe checkout request failed");
            AppError::Internal(PAYMENT_PROVIDER_ERROR.to_string())
        })?;

    if !resp.status().is_success() {
        let status = resp.status();
        let body = resp.text().await.unwrap_or_default();
        warn!(
            stripe_status = %status,
            stripe_body = %body,
            brand_id = %brand_id,
            "stripe returned a non-success status"
        );
        return Err(AppError::Internal(PAYMENT_PROVIDER_ERROR.to_string()));
    }

    #[derive(Deserialize)]
    struct CheckoutSession {
        url: String,
    }
    let session: CheckoutSession = resp.json().await.map_err(|e| {
        warn!(error = %e, brand_id = %brand_id, "stripe response was not valid JSON");
        AppError::Internal(PAYMENT_PROVIDER_ERROR.to_string())
    })?;

    Ok(Json(CreateCheckoutResponse {
        url: session.url,
        stripe: true,
    }))
}

fn plan_slug(plan: Plan) -> &'static str {
    match plan {
        Plan::Atelier => "atelier",
        Plan::Maison => "maison",
        Plan::Couture => "couture",
    }
}
