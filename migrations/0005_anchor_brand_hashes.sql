-- Genuflow Phase 2 — per-brand anchor hashes
--
-- One row per (batch, brand) pair, carrying a SHA-256 over just that
-- brand's events in the batch. Used by GET /v1/anchors so brands cannot
-- correlate batches via a shared global records_hash.

CREATE TABLE anchor_brand_hashes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anchor_batch_id UUID NOT NULL REFERENCES anchor_batches(id) ON DELETE CASCADE,
    brand_id        UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    brand_hash      TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (anchor_batch_id, brand_id)
);

CREATE INDEX idx_anchor_brand_hashes_brand_id
    ON anchor_brand_hashes(brand_id);

CREATE INDEX idx_anchor_brand_hashes_batch_id
    ON anchor_brand_hashes(anchor_batch_id);
