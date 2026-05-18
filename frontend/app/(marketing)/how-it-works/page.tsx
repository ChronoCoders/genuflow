import Link from "next/link";

import { CTABand, Eyebrow, PageHero } from "@/components/marketing/section";

export const metadata = {
  title: "How it works — Genuflow",
  description:
    "From product registration to on-chain anchor: an end-to-end walkthrough of the Genuflow authentication platform.",
};

export default function HowItWorks() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title={<>From workshop to wallet, in one record.</>}
        intro="Genuflow is a thin, opinionated layer on top of your existing systems. You keep your ERP, your inventory, your retail platform. We add the cryptographic spine — a verifiable identity for every product, and an immutable record of everything that happens to it."
      />

      <section className="border-b border-white/5">
        <div className="mx-auto w-full max-w-5xl px-6 py-24">
          <div className="space-y-24">
            <Step
              n="01"
              title="Issue identity at the moment of creation"
              body={
                <>
                  <p>
                    When a product is finished — leather cut, garment stitched,
                    watch cased — your team triggers a registration call to
                    Genuflow. Through the API, through our integration with
                    your PLM, or through the admin dashboard.
                  </p>
                  <p>
                    We mint a unique product identity, sign it with your
                    brand's key, and return a QR code. You print it on a hang
                    tag, etch it on a leather patch, or laser it under the
                    bezel. From this moment, the product has a public address
                    and a private history that only you can write to.
                  </p>
                </>
              }
            />

            <Step
              n="02"
              title="Record every meaningful event"
              body={
                <>
                  <p>
                    A product has a life. It is inspected. It is shipped from
                    the workshop to the boutique. It is sold. Sometimes it is
                    transferred, repaired, restored. Each event matters — to
                    your customer, to your insurer, to the secondary market.
                  </p>
                  <p>
                    Through a single endpoint, you push events as they happen.
                    Manufacture, inspection, shipping, sale, transfer, and
                    custom event types we register on your behalf. Each event
                    carries a structured payload — a location, a serial, a
                    technician's signature.
                  </p>
                </>
              }
            />

            <Step
              n="03"
              title="Anchor every two hours, automatically"
              body={
                <>
                  <p>
                    Events queue up in our infrastructure for a maximum of two
                    hours. We hash all unanchored events into a single Merkle
                    root and submit it to Base mainnet in one transaction.
                  </p>
                  <p>
                    We absorb the gas cost. You see the transaction in your
                    dashboard. Customers see the transaction hash on the
                    public verification page. Anyone with a Basescan tab can
                    audit it themselves.
                  </p>
                  <p>
                    Each brand sees only their own per-brand subhash — Genuflow
                    is multi-tenant by design, and one brand's records cannot
                    be correlated against another brand's records using the
                    on-chain data.
                  </p>
                </>
              }
            />

            <Step
              n="04"
              title="Verify, by anyone, anywhere"
              body={
                <>
                  <p>
                    The end customer scans the QR. They land on a public page
                    branded for your house — your name, your typography, the
                    product they hold in their hands, and its complete
                    chronological history.
                  </p>
                  <p>
                    No app to download. No account to create. No trust
                    assumption beyond the math. The page links to the
                    Basescan transaction so the customer — or a regulator, or
                    a secondary-market buyer — can verify the record outside
                    of Genuflow entirely.
                  </p>
                </>
              }
            />

            <Step
              n="05"
              title="Transfer ownership across the resale market"
              body={
                <>
                  <p>
                    When a piece changes hands — whether through your own
                    consignment programme or on the secondary market — the new
                    owner scans the QR and registers themselves directly from
                    the verification page.
                  </p>
                  <p>
                    The transfer becomes the next event on the timeline.
                    Anchored to Base on the next batch. Visible to the next
                    buyer. Your brand stays in the conversation, even on
                    pieces you sold a decade ago.
                  </p>
                </>
              }
            />
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 bg-ink-900/40">
        <div className="mx-auto w-full max-w-5xl px-6 py-24">
          <Eyebrow>Architecture</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl text-ink-50 sm:text-5xl">
            What sits where.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            <Arch
              title="On Genuflow"
              points={[
                "REST API for product registration and event recording",
                "PostgreSQL system of record",
                "Anchor service: batches events to Base every two hours",
                "Per-brand subhash projection — no cross-tenant correlation",
                "Brand dashboard for products, events, QR codes, and API keys",
              ]}
            />
            <Arch
              title="On Base"
              points={[
                "One transaction per batch, posted from a Genuflow-controlled wallet",
                "Calldata: a domain-separated SHA-256 commitment to the batch",
                "Three confirmations required before a batch is marked confirmed",
                "Anyone can re-derive and verify the commitment without Genuflow",
                "All records remain readable for the lifetime of the chain",
              ]}
            />
          </div>
        </div>
      </section>

      <CTABand
        title={<>Want the developer walkthrough?</>}
        body="Our integration guide covers the API, the data model, the event lifecycle, and the verification page in detail."
        cta={{ href: "/docs", label: "Read the docs" }}
      />
    </>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
      <div className="md:col-span-3">
        <div className="font-serif text-5xl text-accent">{n}</div>
      </div>
      <div className="md:col-span-9">
        <h2 className="font-serif text-3xl text-ink-50 sm:text-4xl">{title}</h2>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-300">
          {body}
        </div>
      </div>
    </div>
  );
}

function Arch({ title, points }: { title: string; points: string[] }) {
  return (
    <div className="rounded-xl border border-white/5 bg-ink-950 p-8">
      <h3 className="font-serif text-2xl text-ink-50">{title}</h3>
      <ul className="mt-6 space-y-3 text-sm leading-relaxed text-ink-300">
        {points.map((p) => (
          <li key={p} className="flex gap-3">
            <span className="mt-2 block h-1 w-1 shrink-0 rounded-full bg-accent" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
