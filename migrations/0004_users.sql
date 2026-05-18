-- Genuflow Phase 2 — brand dashboard users
--
-- Each user belongs to one brand. The schema permits multiple users per
-- brand for forward compatibility, but the Phase 2 register flow only
-- creates one user per brand (multi-user invitations land in a later phase).

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id      UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_brand_id ON users(brand_id);
