import { DeepDive } from "@/components/marketing/deep-dive";
import { CTABand, Eyebrow, PageHero } from "@/components/marketing/section";
import { StepDiagram } from "@/components/marketing/step-diagram";

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
        <div className="mx-auto w-full max-w-7xl px-6 py-24">
          <Eyebrow>The flow</Eyebrow>
          <h2 className="mt-4 max-w-3xl font-serif text-4xl text-ink-50 sm:text-5xl">
            Four steps. End to end.
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-ink-300">
            Each step takes minutes to integrate and seconds to use in
            production. The chain of custody is built once and then runs
            on its own.
          </p>

          <div className="mt-16">
            <StepDiagram />
          </div>

          <div className="mt-20">
            <Eyebrow>Deep dive</Eyebrow>
            <h3 className="mt-4 max-w-3xl font-serif text-3xl text-ink-50 sm:text-4xl">
              What each step actually does.
            </h3>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-300">
              The properties that make the system trustworthy, written
              plainly — not in jargon.
            </p>
            <div className="mt-10">
              <DeepDive />
            </div>
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
