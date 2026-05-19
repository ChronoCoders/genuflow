-- Genuflow Phase 5 — user roles
--
-- Every user belongs to one brand and now carries a role. The roles form
-- a strict ordering: owner > admin > member. Owner is the only role with
-- billing / team-deletion authority; admin can invite and manage events;
-- member is the day-to-day operator role.
--
-- Back-fill: every pre-existing user is the sole user on their brand
-- (the Phase 1–4 register flow created one user per brand), so they are
-- promoted to 'owner'.

ALTER TABLE users
    ADD COLUMN role TEXT NOT NULL DEFAULT 'member'
        CHECK (role IN ('owner', 'admin', 'member'));

UPDATE users SET role = 'owner';
