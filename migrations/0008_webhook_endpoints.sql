-- Genuflow Phase 5 — webhook endpoints
--
-- A webhook endpoint belongs to a brand and subscribes to one or more
-- event types. Each endpoint has a secret used to sign outgoing payloads
-- (HMAC-SHA256 in the X-Genuflow-Signature header). Soft-deletion is
-- implemented by toggling `active` rather than dropping rows, so that
-- prior delivery history remains attributable.

CREATE TABLE webhook_endpoints (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id   UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    url        TEXT NOT NULL,
    secret     TEXT NOT NULL,
    events     TEXT[] NOT NULL,
    active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_endpoints_brand_id ON webhook_endpoints(brand_id);
CREATE INDEX idx_webhook_endpoints_active ON webhook_endpoints(active) WHERE active = TRUE;
