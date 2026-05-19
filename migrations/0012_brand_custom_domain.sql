-- Genuflow Phase 5 — brand custom verification domain
--
-- A brand can opt into serving its public verification page from its
-- own host (e.g. verify.luxuryhouse.com) instead of the default
-- genuflow.com subpath. Cloudflare handles the DNS/TLS termination in
-- production; this column is purely the application's record of which
-- host belongs to which brand, used by the frontend's host-based
-- routing on /verify/[product_id].

ALTER TABLE brands
    ADD COLUMN custom_domain TEXT UNIQUE;

-- Lookup index for the by-host resolver path (matched against the
-- inbound request's Host header).
CREATE INDEX idx_brands_custom_domain ON brands(custom_domain) WHERE custom_domain IS NOT NULL;
