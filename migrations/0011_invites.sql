-- Genuflow Phase 5 — team invitations
--
-- A pending invite is created by an owner or admin. The recipient
-- exchanges the token at POST /auth/accept-invite/:token, which creates
-- their user record at the named role and marks the invite accepted.
--
-- Invites are never created at the 'owner' role — ownership is bound to
-- the registering account and changes through PATCH /v1/team/:id/role,
-- not through invitations.

CREATE TABLE invites (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id    UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    email       TEXT NOT NULL,
    role        TEXT NOT NULL CHECK (role IN ('admin', 'member')),
    token       UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    expires_at  TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- At most one outstanding invite per (brand, email). Accepted rows are
-- excluded so the same address can be re-invited after a previous join.
CREATE UNIQUE INDEX idx_invites_brand_email_pending
    ON invites(brand_id, email)
    WHERE accepted_at IS NULL;

CREATE INDEX idx_invites_token ON invites(token);
CREATE INDEX idx_invites_brand_pending
    ON invites(brand_id, created_at DESC)
    WHERE accepted_at IS NULL;
