-- Genuflow Phase 1 — initial schema

CREATE TABLE brands (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE api_keys (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id    UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    key_hash    TEXT NOT NULL UNIQUE,
    label       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at  TIMESTAMPTZ
);

CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_brand_id ON api_keys(brand_id);

CREATE TABLE products (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id     UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    external_ref TEXT,
    name         TEXT NOT NULL,
    metadata     JSONB,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_brand_id ON products(brand_id);

CREATE TABLE anchor_batches (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    records_hash TEXT NOT NULL,
    tx_hash      TEXT NOT NULL,
    block_number BIGINT NOT NULL,
    anchored_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE provenance_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    event_type      TEXT NOT NULL,
    detail          JSONB,
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    anchor_batch_id UUID REFERENCES anchor_batches(id)
);

CREATE INDEX idx_events_product_id      ON provenance_events(product_id);
CREATE INDEX idx_events_anchor_batch_id ON provenance_events(anchor_batch_id);
CREATE INDEX idx_events_unanchored      ON provenance_events(id) WHERE anchor_batch_id IS NULL;
