# Genuflow

B2B authentication platform for luxury and fashion goods. Brands integrate via a REST API; each product is issued a cryptographic identity, every provenance event is recorded in PostgreSQL, and event batches are anchored to Base mainnet every two hours. End customers verify a product by scanning a QR — the verification page returns the brand, the chronological event timeline, and the on-chain transaction hash.

The product is aimed at:

- Houses producing handbags, leather, and ready-to-wear that need an authentication layer separate from the certificate of authenticity.
- Brands preparing for the EU Digital Product Passport (textile category, ESPR delegated acts).
- Watch and jewelry makers tracking service history across a piece's secondary-market lifetime.

The core value proposition is that authentication becomes a property of the object, not of the platform that's selling it. Records remain verifiable on chain even if Genuflow ceases to operate.

## Architecture

### Workspace layout

```
crates/
  common      shared types (Product, ProvenanceEvent, Plan, etc.) and AppError
  db          SQLx queries, embedded migrations
  anchor      Base anchor service (background tokio task)
  webhooks    outbound webhook delivery (background tokio task)
  api         Axum server, handlers, middleware, routing
frontend/     Next.js 14 app (marketing, dashboard, public verify, accept-invite)
migrations/   versioned SQL, applied at API startup via sqlx::migrate!
```

### Tech stack

- **API** — Rust 1.90, Axum 0.7, Tokio
- **Database** — PostgreSQL 16, SQLx 0.8.6 (rustls-tls)
- **Chain** — Alloy-rs against Base mainnet
- **Frontend** — Next.js 14 (App Router), Tailwind 3.4, DM Serif Display + DM Sans
- **Auth** — Argon2id password hashing, HS256 JWT in HttpOnly cookie, API keys stored as SHA-256 digests
- **Edge** — Cloudflare (TLS, WAF, DDoS, edge caching)

### Key design decisions

**PostgreSQL is the source of truth.** Every product, event, anchor batch, and audit record lives in Postgres. The blockchain holds a cryptographic commitment — not a copy of the data. If we lose access to Postgres, the on-chain anchor still proves a record existed at a specific time, but the readable record itself is in our database.

**Per-brand anchor projection.** Anchor batches mix events from many brands but the public verification page only exposes a per-brand subhash, computed as `SHA-256` over the brand's event ids in the batch. Two brands sharing a batch cannot correlate their on-chain activity against each other.

**Plan-limit enforcement is transactional.** `POST /v1/products` and `POST /v1/products/bulk` wrap the count check and the insert in a single transaction with `SELECT ... FOR UPDATE` on the brand's subscription row. Concurrent inserts serialize on the row lock; the limit cannot be exceeded under any concurrency pattern.

**Same-origin proxy, no CORS.** The browser only ever talks to the Next.js host. `/api/*` is rewritten to the Rust API via `next.config.mjs`. The session cookie stays first-party, no third-party blocking, no CORS middleware to maintain. Cloudflare handles TLS at the edge for both origins.

**Stripe is optional.** Billing endpoints work with or without a Stripe key set. Webhook signature verification uses `hmac` + `subtle` directly (no `async-stripe` dependency). Checkout sessions are created via a single `reqwest` POST. The deployment can run in placeholder mode for development without losing the integration surface.

**No `unwrap` / `expect` / `println!` in production code.** `#![deny(warnings)]` is set workspace-wide. Logging is `tracing` only.

## Local development

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ and npm
- Rust toolchain (only required if you want to run the API outside Docker for development)

### Environment

Copy `.env.example` to `.env` and fill in the values you care about. The minimum required for local boot:

```
DATABASE_URL=postgres://genuflow:changeme@db:5432/genuflow
POSTGRES_PASSWORD=changeme
JWT_SECRET=<32+ bytes of entropy>
COOKIE_SECURE=false
PUBLIC_BASE_URL=http://localhost:3000
BASE_RPC_URL=https://sepolia.base.org
ANCHOR_PRIVATE_KEY=<hex private key, anchor wallet on Base Sepolia>
```

Stripe variables remain commented out; the API starts in placeholder mode and the billing UI surfaces a banner indicating so.

### Bring up the stack

```
docker compose up --build -d
```

This starts Postgres on host port `5433` and the API on `8081`. Migrations 0001–0012 run automatically at API startup, including back-fills for users (every existing user becomes an owner) and subscriptions (every existing brand gets the Atelier default).

### Frontend

```
cd frontend
npm install
INTERNAL_API_URL=http://localhost:8081 npm run dev
```

Dev server runs on `http://localhost:3000` and proxies `/api/*` to the API.

### Verifying

- Public marketing site at `http://localhost:3000/`
- Register a brand at `/register`
- Issue an API key from the dashboard, then:

```
curl -X POST http://localhost:3000/api/v1/products \
  -H "X-API-Key: $KEY" -H "Content-Type: application/json" \
  -d '{"name":"Test product"}'
```

## API reference summary

All `/v1/*` endpoints require either an `X-API-Key` header or a valid `gf_session` cookie. `/v1/team/*` and `/v1/settings/*` require a session specifically (API keys carry no user identity, so role checks would be meaningless). `/verify/*` and `/webhooks/stripe` are public.

### Auth

```
POST /auth/register                 brand + first user (owner)
POST /auth/login                    sets gf_session cookie
POST /auth/logout                   clears cookie
POST /auth/accept-invite/:token     public; consumes invite atomically
GET  /auth/me                       user + brand + role + custom_domain
```

### Products

```
POST   /v1/products                 register one
POST   /v1/products/bulk            JSON array, up to 1000
POST   /v1/products/bulk/csv        multipart, 5 MB cap, name/external_ref/metadata_json
GET    /v1/products                 paginated (limit, offset)
GET    /v1/products/:id
GET    /v1/products/:id/qr          512x512 PNG of the verify URL
GET    /v1/products/:id/events      chronological provenance
POST   /v1/products/:id/events      record an event
```

Plan limits: Atelier 500, Maison 10,000, Couture unlimited. Exceeding returns HTTP 402.

### Events

```
GET /v1/events                      paginated, filter by product_id / event_type / anchor_status
```

### Webhooks

```
POST   /v1/webhooks                 register endpoint, returns secret once
GET    /v1/webhooks
DELETE /v1/webhooks/:id
GET    /v1/webhooks/:id/deliveries  delivery log, capped at 100
```

Event types: `product.registered`, `event.recorded`, `anchor.confirmed`. Outbound payloads carry `X-Genuflow-Signature: t=<unix>,v1=<hex_hmac>` over `{ts}.{raw_body}`.

### Team and roles

```
GET    /v1/team/                    members + pending invites
POST   /v1/team/invite              owner/admin only
DELETE /v1/team/invite/:id          revoke pending
DELETE /v1/team/:user_id            owner only; last-owner protected
PATCH  /v1/team/:user_id/role       owner only; last-owner protected
```

### Billing

```
GET  /v1/billing                                plan + usage + limit
POST /v1/billing/create-checkout-session        Stripe Checkout URL (or placeholder)
```

### Settings

```
PUT /v1/settings/domain             owner only; sets/clears custom verify domain
```

### Anchors

```
GET /v1/anchors                     brand-scoped anchor batch history
```

### Public

```
GET  /verify/:product_id            public verification record
POST /verify/:product_id/transfer   public ownership transfer (gated by prior 'sold' event)
POST /webhooks/stripe               Stripe webhook ingestion
```

Full reference with curl examples lives at `/docs` in the marketing site.

## Deployment

### Topology

The intended production topology is:

- **Cloudflare** in front of every origin. Handles TLS termination, WAF, DDoS, and edge caching. No HTTPS terminates on application origins.
- **Akamai** for object delivery where required (large PDFs, marketing imagery beyond what Next.js can statically generate).
- **API** behind Cloudflare; only Cloudflare's IPs allowed on the origin firewall.
- **Frontend** is served by Next.js (Node.js runtime) behind Cloudflare. The marketing pages are statically generated and CDN-cached aggressively; dashboard routes are dynamic and pass through to the origin.
- **PostgreSQL** in a private subnet, no public ingress.

### Required environment variables in production

```
DATABASE_URL                       full connection string with TLS
JWT_SECRET                         32+ bytes from a CSPRNG
COOKIE_SECURE=true                 HTTPS-only cookie
PUBLIC_BASE_URL=https://genuflow.com
BASE_RPC_URL                       Base mainnet RPC (paid provider recommended for reliability)
ANCHOR_PRIVATE_KEY                 anchor wallet hex key; wallet must hold ETH on Base for gas

# Stripe (required to enable real billing)
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID_MAISON
STRIPE_PRICE_ID_COUTURE
```

### Optional

```
RUST_LOG=info,sqlx=warn            recommended log filter
INTERNAL_API_URL                   set on the Next.js process to point at the api service
```

### Migrations

`sqlx::migrate!("../../migrations")` runs at API startup. There is no separate migration tool — bringing up a fresh API instance against an empty database applies migrations 0001 through 0012 in order. The 0006 (subscriptions) and 0010 (user roles) migrations include back-fills for any pre-Phase-4/5 data.

### Custom verification domains

A brand's custom domain (set via `PUT /v1/settings/domain`) is stored in `brands.custom_domain` with a UNIQUE constraint. Production routing is handled by Cloudflare via `verify.genuflow.com` as the CNAME target. The application is responsible for storing the domain and rejecting reserved namespaces (`genuflow.com`, `*.local`, `*.internal`, `localhost`, raw IPv4); DNS / TLS / routing is the edge's job.

## Security

The following invariants are enforced in code, not policy:

- **Tenant isolation.** Every query that operates on brand-scoped data is parameterised by `brand_id` at the SQL layer. No application-side filtering. The composed `require_api_key` middleware injects the resolved brand id as an `Extension<Uuid>` that every handler consumes.

- **Plan-limit race resistance.** Single-product and bulk product inserts both run inside a transaction with `SELECT ... FOR UPDATE` on the brand's subscriptions row. Two concurrent requests cannot both pass the count check and both succeed.

- **Last-owner protection.** Both `PATCH /v1/team/:id/role` and `DELETE /v1/team/:id` run in a transaction with `SELECT ... FOR UPDATE` on subscriptions and call `count_owners` before mutating. Two concurrent owner-deletes-owner requests cannot leave a brand owner-less.

- **Atomic invite claim.** `POST /auth/accept-invite/:token` claims the invite with a single `UPDATE invites SET accepted_at = NOW() WHERE token = $1 AND accepted_at IS NULL AND expires_at > NOW() RETURNING ...`. The `users.email` UNIQUE constraint is a backstop, not the primary guard.

- **HMAC signing on outbound webhooks.** Payloads are signed with HMAC-SHA256 over `{timestamp}.{raw_body}`, sent in `X-Genuflow-Signature: t=,v1=`. Receivers must verify against the secret returned at endpoint creation. The same scheme is used inbound from Stripe at `/webhooks/stripe`.

- **Stripe webhook verification.** Raw body is captured via `axum::body::Bytes` *before* JSON parsing. Signature is verified with a 5-minute timestamp tolerance and constant-time comparison via `subtle::ct_eq`. Only after verification is the body deserialized.

- **Argon2id password hashing.** Plaintext passwords are never persisted. Login runs the verify against a static dummy hash when the email is unknown, equalising wall-clock time and closing the user-existence timing oracle.

- **API key material.** Keys are stored as SHA-256 digests. Plaintext is returned exactly once at creation and never recoverable.

- **Token-bearing log fields are redacted.** `db::invites::get_by_token` and `claim_by_token` use `#[instrument(skip(db, token), err)]` so invite tokens never land in tracing spans.

- **CSV import body cap is pre-allocation.** `DefaultBodyLimit::max(MAX_CSV_BYTES)` is layered on the `/v1/products/bulk/csv` route so Axum rejects oversize uploads before any byte is buffered.

- **Reserved-domain blocklist.** `PUT /v1/settings/domain` rejects `genuflow.com`, any `*.genuflow.com` subdomain, `localhost` and any `*.localhost`, `*.local`, `*.internal`, and raw IPv4 literals — closing the squatting vector against our own infrastructure.

- **Constant-time hex comparison** for all signature checks (`subtle::ct_eq`).

- **No `unwrap` / `expect` / `println!`** in production code; clippy gates every workspace build under `#![deny(warnings)]`.

Eleven unit tests cover the Stripe-webhook signature surface (valid, tampered, expired, wrong secret) and the custom-domain validator (acceptance, apex/subdomain rejection, reserved namespaces, IPv4 literals, lookalike names).

### Disclosure

Security issues should be reported to `security@genuflow.com`. We commit to acknowledging within one business day.

## License

Genuflow is licensed under the **Business Source License 1.1** (BSL 1.1).

- **Change Date:** 2029-05-14
- **Change License:** Apache License 2.0

Until the Change Date, you may use, copy, modify, and redistribute this software for any non-production purpose. Production use requires a commercial licence from Genuflow. On the Change Date, the licence converts automatically to Apache 2.0.

The complete licence text lives in `LICENSE`.
