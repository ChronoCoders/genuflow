-- Genuflow Phase 4 — subscriptions
--
-- Each brand has at most one active subscription. The row is created at
-- registration with plan='atelier', status='active'. Stripe identifiers are
-- populated lazily when a brand upgrades through Checkout — until then they
-- stay NULL and the system runs against the local plan/status fields only.

CREATE TABLE subscriptions (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id               UUID NOT NULL UNIQUE REFERENCES brands(id) ON DELETE CASCADE,
    plan                   TEXT NOT NULL CHECK (plan IN ('atelier', 'maison', 'couture')),
    status                 TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
    stripe_customer_id     TEXT,
    stripe_subscription_id TEXT,
    current_period_end     TIMESTAMPTZ,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_brand_id ON subscriptions(brand_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- Back-fill: every brand that existed before this migration gets the
-- default Atelier / active subscription. New brands receive a row at
-- registration time from the application code.
INSERT INTO subscriptions (brand_id, plan, status)
SELECT id, 'atelier', 'active' FROM brands
ON CONFLICT (brand_id) DO NOTHING;
