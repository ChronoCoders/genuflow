#![deny(warnings)]

//! Queries against the `subscriptions` table. Every brand has exactly one
//! row (enforced by a UNIQUE constraint on `brand_id`); it is created at
//! registration with the Atelier plan and an active status.

use chrono::{DateTime, Utc};
use common::{Plan, Subscription, SubscriptionStatus};
use tracing::instrument;
use uuid::Uuid;

use crate::Db;

/// Fetch a brand's subscription. None only happens for legacy rows created
/// before the subscriptions table existed (Phase 1–3 brands must be
/// back-filled by a one-shot migration if they are still in the database).
#[instrument(skip(db), err)]
pub async fn get_by_brand(db: &Db, brand_id: Uuid) -> Result<Option<Subscription>, sqlx::Error> {
    sqlx::query_as::<_, Subscription>(
        r#"
        SELECT id, brand_id, plan, status,
               stripe_customer_id, stripe_subscription_id,
               current_period_end, created_at
        FROM subscriptions
        WHERE brand_id = $1
        "#,
    )
    .bind(brand_id)
    .fetch_optional(db)
    .await
}

/// Insert a new subscription for `brand_id`. Called from the registration
/// handler with `plan = Atelier, status = Active`.
#[instrument(skip(db), err)]
pub async fn create(
    db: &Db,
    brand_id: Uuid,
    plan: Plan,
    status: SubscriptionStatus,
) -> Result<Subscription, sqlx::Error> {
    sqlx::query_as::<_, Subscription>(
        r#"
        INSERT INTO subscriptions (brand_id, plan, status)
        VALUES ($1, $2, $3)
        RETURNING id, brand_id, plan, status,
                  stripe_customer_id, stripe_subscription_id,
                  current_period_end, created_at
        "#,
    )
    .bind(brand_id)
    .bind(plan)
    .bind(status)
    .fetch_one(db)
    .await
}

/// Update a subscription's plan, status, and current period end. Used by
/// the Stripe webhook handler on `customer.subscription.updated` and
/// `customer.subscription.deleted`. Returns the number of rows updated
/// (0 if the subscription is not known locally).
#[instrument(skip(db), err)]
pub async fn update_status(
    db: &Db,
    stripe_subscription_id: &str,
    plan: Plan,
    status: SubscriptionStatus,
    current_period_end: Option<DateTime<Utc>>,
) -> Result<u64, sqlx::Error> {
    let res = sqlx::query(
        r#"
        UPDATE subscriptions
        SET plan = $2,
            status = $3,
            current_period_end = $4
        WHERE stripe_subscription_id = $1
        "#,
    )
    .bind(stripe_subscription_id)
    .bind(plan)
    .bind(status)
    .bind(current_period_end)
    .execute(db)
    .await?;
    Ok(res.rows_affected())
}

/// Set Stripe identifiers on a brand's subscription. Used by the
/// `checkout.session.completed` webhook to attach the just-created Stripe
/// customer + subscription to the existing local row.
#[instrument(skip(db), err)]
pub async fn update_stripe_ids(
    db: &Db,
    brand_id: Uuid,
    stripe_customer_id: &str,
    stripe_subscription_id: &str,
) -> Result<u64, sqlx::Error> {
    let res = sqlx::query(
        r#"
        UPDATE subscriptions
        SET stripe_customer_id = $2,
            stripe_subscription_id = $3
        WHERE brand_id = $1
        "#,
    )
    .bind(brand_id)
    .bind(stripe_customer_id)
    .bind(stripe_subscription_id)
    .execute(db)
    .await?;
    Ok(res.rows_affected())
}
