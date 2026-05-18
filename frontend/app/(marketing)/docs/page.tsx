import Link from "next/link";

import { CodeBlock } from "@/components/marketing/code-block";
import { CTABand, Eyebrow, PageHero } from "@/components/marketing/section";

export const metadata = {
  title: "Documentation — Genuflow",
  description:
    "API reference, quickstart, and integration guide for the Genuflow authentication platform.",
};

const TOC = [
  { id: "quickstart", label: "Quickstart" },
  { id: "concepts", label: "Concepts" },
  { id: "auth", label: "Authentication" },
  { id: "products", label: "Products" },
  { id: "events", label: "Events" },
  { id: "verify", label: "Public verification" },
  { id: "transfer", label: "Ownership transfer" },
  { id: "anchors", label: "Anchors" },
  { id: "errors", label: "Errors" },
];

export default function Docs() {
  return (
    <>
      <PageHero
        eyebrow="Documentation"
        title={<>Build the integration in one afternoon.</>}
        intro="The Genuflow API is small on purpose. Five endpoints cover most integrations. The remainder is for advanced cases: filtered event listing, public verification, ownership transfer, and direct anchor inspection."
      />

      <section className="border-b border-white/5">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-6 py-16 md:grid-cols-12">
          <aside className="md:col-span-3">
            <div className="sticky top-24">
              <Eyebrow>On this page</Eyebrow>
              <ul className="mt-6 space-y-2.5 text-sm">
                {TOC.map((t) => (
                  <li key={t.id}>
                    <a
                      href={`#${t.id}`}
                      className="text-ink-400 transition hover:text-ink-50"
                    >
                      {t.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="space-y-20 md:col-span-9">
            <Section id="quickstart" title="Quickstart">
              <P>
                The fastest path to a working integration is three calls:
                register a product, record an event, fetch the public
                verification record. The example below uses curl. All API
                calls go to <Code>https://api.genuflow.com</Code> in
                production; replace with your local URL for development.
              </P>

              <P>
                You will need an API key. In the dashboard, go to{" "}
                <strong>API keys → Create key</strong>. Keys are scoped to a
                brand and authenticate via the <Code>X-API-Key</Code> header.
              </P>

              <CodeBlock language="bash">{`# 1. Register a product
curl -X POST https://api.genuflow.com/v1/products \\
  -H "X-API-Key: $GENUFLOW_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Cashmere Coat",
    "external_ref": "AW25-COAT-0421",
    "metadata": {
      "collection": "AW25",
      "size": "44 IT"
    }
  }'

# Response (201 Created)
# {
#   "id": "8d9c2f7b-...",
#   "brand_id": "...",
#   "name": "Cashmere Coat",
#   "external_ref": "AW25-COAT-0421",
#   "metadata": {...},
#   "created_at": "2026-05-18T10:21:33Z"
# }`}</CodeBlock>

              <CodeBlock language="bash">{`# 2. Record an event
curl -X POST https://api.genuflow.com/v1/products/8d9c2f7b-.../events \\
  -H "X-API-Key: $GENUFLOW_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event_type": "manufactured",
    "detail": {
      "workshop": "Como, IT",
      "completed_at": "2026-05-18"
    }
  }'`}</CodeBlock>

              <CodeBlock language="bash">{`# 3. Fetch the public verification record (no auth)
curl https://api.genuflow.com/verify/8d9c2f7b-...`}</CodeBlock>
            </Section>

            <Section id="concepts" title="Concepts">
              <P>
                Three primitives carry the data model.
              </P>
              <Defs>
                <Def
                  term="Product"
                  body="A physical item registered with Genuflow. Each product has a unique UUID, an optional external_ref (your internal serial), and an arbitrary metadata JSON. Products belong to a brand."
                />
                <Def
                  term="Event"
                  body="Something that happened to a product. Event types are: manufactured, inspected, shipped, sold, transferred. Each event carries an optional detail JSON payload."
                />
                <Def
                  term="Anchor batch"
                  body="A periodic on-chain commitment to a set of unanchored events. Genuflow batches events every two hours and submits a single transaction on Base mainnet."
                />
              </Defs>
            </Section>

            <Section id="auth" title="Authentication">
              <P>
                All <Code>/v1</Code> endpoints require authentication. Two
                methods are supported. Use API keys for server-to-server
                integrations; the dashboard uses session cookies internally.
              </P>

              <H3>API key</H3>
              <P>
                Send the key in the <Code>X-API-Key</Code> header. Keys are
                scoped to a single brand. Keys can be revoked from the
                dashboard at any time; revoked keys return 401 immediately.
              </P>
              <CodeBlock language="bash">{`curl https://api.genuflow.com/v1/products \\
  -H "X-API-Key: $GENUFLOW_API_KEY"`}</CodeBlock>

              <H3>Session cookie</H3>
              <P>
                Issued by <Code>POST /auth/login</Code>. The cookie is named{" "}
                <Code>gf_session</Code> and is HttpOnly, SameSite=Lax, with a
                24-hour TTL. It is intended for browser sessions in the
                dashboard.
              </P>
            </Section>

            <Section id="products" title="Products">
              <P>
                The <Code>/v1/products</Code> endpoints manage product
                registration and listing. Products are immutable once
                registered: their name, external_ref, and metadata can only
                be set at creation time. To update a product's information,
                record an event with the new data in its detail payload.
              </P>

              <Method method="POST" path="/v1/products" />
              <CodeBlock language="ts">{`type CreateProductRequest = {
  name: string;
  external_ref?: string | null;
  metadata?: Record<string, unknown> | null;
};

// Returns the created Product, 201 Created.`}</CodeBlock>

              <Method method="GET" path="/v1/products" />
              <P>
                Paginated. Query parameters: <Code>limit</Code> (1-200,
                default 50) and <Code>offset</Code>. Returns an array of
                products ordered by <Code>created_at</Code> descending.
              </P>

              <Method method="GET" path="/v1/products/:id" />
              <P>
                Returns a single product. 404 if the product does not exist
                or does not belong to the authenticated brand.
              </P>

              <Method method="GET" path="/v1/products/:id/qr" />
              <P>
                Returns a 512×512 PNG QR code that encodes the public
                verification URL for the product. The PNG is generated
                in-memory; nothing is stored on disk. The response carries{" "}
                <Code>Cache-Control: private, max-age=3600</Code>.
              </P>
            </Section>

            <Section id="events" title="Events">
              <P>
                Events are recorded against products and are immutable.
              </P>

              <Method method="POST" path="/v1/products/:id/events" />
              <CodeBlock language="ts">{`type EventType =
  | "manufactured"
  | "inspected"
  | "shipped"
  | "sold"
  | "transferred";

type RecordEventRequest = {
  event_type: EventType;
  detail?: Record<string, unknown> | null;
};

// Returns the created ProvenanceEvent, 200 OK.
// The event is unanchored on creation; it will be picked up
// by the anchor service on the next batch (within 2 hours).`}</CodeBlock>

              <Method method="GET" path="/v1/events" />
              <P>
                Paginated, brand-scoped event listing. Supports filters:
              </P>
              <Defs>
                <Def
                  term="product_id"
                  body="Filter to events for a single product."
                />
                <Def
                  term="event_type"
                  body="Filter to a single event type."
                />
                <Def
                  term="anchor_status"
                  body="anchored or unanchored."
                />
              </Defs>

              <Method method="GET" path="/v1/products/:id/events" />
              <P>
                All events for a single product, oldest first. This is the
                chronological provenance for that piece.
              </P>
            </Section>

            <Section id="verify" title="Public verification">
              <P>
                The verification endpoint is unauthenticated and serves the
                customer-facing record. It is what the QR code resolves to,
                via the verification page.
              </P>

              <Method method="GET" path="/verify/:product_id" />
              <CodeBlock language="ts">{`type VerifyResponse = {
  product: {
    id: string;
    brand_id: string;
    name: string;
    created_at: string;
  };
  brand: {
    id: string;
    name: string;
    slug: string;
    created_at: string;
  };
  events: ProvenanceEvent[];
  latest_anchor: BrandAnchorView | null;
};`}</CodeBlock>
              <P>
                The <Code>BrandAnchorView</Code> is a per-brand projection of
                the anchor record — only this brand's subhash is exposed, not
                the global batch hash. This prevents cross-tenant correlation
                via the on-chain data.
              </P>
            </Section>

            <Section id="transfer" title="Ownership transfer">
              <P>
                When a customer scans the QR of a product they have just
                purchased on the secondary market, they can register
                themselves as the new owner. This call is unauthenticated and
                public.
              </P>

              <Method method="POST" path="/verify/:product_id/transfer" />
              <CodeBlock language="ts">{`type TransferRequest = {
  new_owner_email: string;
  note?: string | null;
};

// Server invariants:
// - Product must exist (else 404).
// - Product must have at least one 'sold' event (else 400).
// - new_owner_email must contain '@' and be <= 254 chars.
// - note <= 500 chars when present.
// Returns the created 'transferred' event, 200 OK.`}</CodeBlock>
            </Section>

            <Section id="anchors" title="Anchors">
              <P>
                The anchor service runs autonomously. You do not have to
                trigger it. Events are anchored every two hours. The current
                state of anchor batches your brand has participated in is
                visible via the API.
              </P>

              <Method method="GET" path="/v1/anchors" />
              <P>
                Paginated listing of <Code>BrandAnchorView</Code> records:
                the batches your brand has had events in. Each record
                includes the brand-specific subhash, the transaction hash on
                Base, the block number, and the confirmation status.
              </P>
            </Section>

            <Section id="errors" title="Errors">
              <P>
                The API returns standard HTTP status codes. The response
                body is JSON of shape <Code>{`{ "error": string }`}</Code>.
              </P>
              <Defs>
                <Def term="400 Bad Request" body="Validation error in the request body or query parameters. The error message describes the specific problem." />
                <Def term="401 Unauthorized" body="Missing, invalid, or revoked credentials. Re-authenticate." />
                <Def term="404 Not Found" body="The requested resource does not exist or does not belong to the authenticated brand." />
                <Def term="409 Conflict" body="A uniqueness constraint was violated. Used on register-brand (slug taken) and register-account (email exists)." />
                <Def term="500 Internal Server Error" body="Unexpected server-side condition. We log every 500 with a correlation id and address them within hours." />
              </Defs>
            </Section>
          </div>
        </div>
      </section>

      <CTABand
        title={<>Want a hands-on walkthrough?</>}
        body="Book a call with our integrations team. We will pair with your developer for one session, end to end."
      />
    </>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-serif text-3xl text-ink-50 sm:text-4xl">{title}</h2>
      <div className="mt-6 space-y-5 text-base leading-relaxed text-ink-300">
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-8 font-serif text-xl text-ink-100">{children}</h3>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-ink-900 px-1.5 py-0.5 font-mono text-[0.85em] text-accent">
      {children}
    </code>
  );
}

function Method({ method, path }: { method: string; path: string }) {
  return (
    <div className="mt-2 flex items-center gap-3 rounded-md border border-white/5 bg-ink-900/40 px-4 py-2">
      <span className="rounded bg-accent/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
        {method}
      </span>
      <code className="font-mono text-sm text-ink-100">{path}</code>
    </div>
  );
}

function Defs({ children }: { children: React.ReactNode }) {
  return <dl className="mt-4 space-y-4">{children}</dl>;
}

function Def({ term, body }: { term: string; body: string }) {
  return (
    <div className="rounded-md border-l-2 border-accent/40 pl-4">
      <dt className="font-mono text-sm text-ink-50">{term}</dt>
      <dd className="mt-1 text-sm text-ink-300">{body}</dd>
    </div>
  );
}
