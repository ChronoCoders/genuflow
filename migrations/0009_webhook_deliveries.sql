-- Genuflow Phase 5 — webhook deliveries
--
-- Outbox: every webhook delivery starts as a row here with status =
-- 'pending'. The background delivery service polls pending rows whose
-- backoff window has elapsed, attempts to send, and updates status +
-- attempts + last_attempted_at. After three failed attempts the row is
-- marked 'failed' and not retried again.

CREATE TABLE webhook_deliveries (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_endpoint_id UUID NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
    event_type          TEXT NOT NULL,
    payload             JSONB NOT NULL,
    status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'delivered', 'failed')),
    attempts            INTEGER NOT NULL DEFAULT 0,
    last_attempted_at   TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- The poller's primary lookup: pending rows ordered by creation.
CREATE INDEX idx_webhook_deliveries_pending
    ON webhook_deliveries(status, last_attempted_at, created_at)
    WHERE status = 'pending';

-- For the per-endpoint delivery log view in the dashboard.
CREATE INDEX idx_webhook_deliveries_endpoint
    ON webhook_deliveries(webhook_endpoint_id, created_at DESC);
