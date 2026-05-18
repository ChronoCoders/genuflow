-- Genuflow Phase 4 — usage records
--
-- Periodic snapshots of a brand's product count, used for downstream
-- reporting and as the basis for usage-based billing reconciliation when
-- Stripe enters the loop. Each row represents one billing period.

CREATE TABLE usage_records (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id      UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    period_start  TIMESTAMPTZ NOT NULL,
    period_end    TIMESTAMPTZ NOT NULL,
    product_count INTEGER NOT NULL CHECK (product_count >= 0),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usage_records_brand_period ON usage_records(brand_id, period_start);
