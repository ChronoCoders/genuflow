import Link from "next/link";

import { HeroImage } from "@/components/marketing/hero-image";
import { CTABand, Eyebrow, SectionTitle } from "@/components/marketing/section";

export const metadata = {
  title: "Genuflow — Provenance, anchored.",
  description:
    "Cryptographic provenance for luxury and fashion. Every product gets a verifiable identity, every event lands on Base.",
};

export default function MarketingHome() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-16 px-6 py-24 md:grid-cols-12 md:py-32">
          <div className="md:col-span-7">
            <Eyebrow>For the houses that make things worth keeping</Eyebrow>
            <h1 className="mt-6 font-serif text-5xl leading-[1.02] text-ink-50 sm:text-6xl md:text-7xl lg:text-8xl">
              Provenance,
              <br />
              <span className="text-accent">anchored.</span>
            </h1>
            <p className="mt-10 max-w-xl text-lg leading-relaxed text-ink-300">
              Genuflow gives every product a cryptographic identity and records
              its history on Base. Brands integrate once. Customers scan a
              tag. Authentication becomes a fact, not a question.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-medium text-ink-50 transition hover:bg-accent-hover"
              >
                Request access
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center rounded-md border border-ink-700 px-6 py-3 text-sm text-ink-200 transition hover:border-ink-500 hover:text-ink-50"
              >
                How it works
              </Link>
            </div>
          </div>

          <div className="hidden md:col-span-5 md:block">
            <HeroImage
              src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1920&q=80"
              alt="Luxury leather goods on display in an atelier"
              caption="Verified · A.M. Atelier"
              aspect="aspect-[4/5] md:aspect-auto md:h-full md:min-h-[520px]"
              priority
            />
          </div>
        </div>
      </section>

      <section className="border-b border-white/5">
        <div className="mx-auto w-full max-w-7xl px-6 py-24">
          <SectionTitle
            eyebrow="The principle"
            title={
              <>
                A single source of truth
                <br />
                between you and your customer.
              </>
            }
            description="Authentication is broken because it depends on paper, on memory, on a fragile chain of trust. Genuflow replaces that chain with a cryptographic one — issued by you, recorded on Base, readable by anyone with a phone."
          />
        </div>
      </section>

      <section className="border-b border-white/5 bg-ink-900/40">
        <div className="mx-auto w-full max-w-7xl px-6 py-24">
          <Eyebrow>How it works</Eyebrow>
          <div className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-3">
            <Step
              n="01"
              title="Issue identity"
              body="Each product is registered through the Genuflow API. We mint a unique, signed identity and return a QR code you place inside the garment, on the certificate, or under the dust bag."
            />
            <Step
              n="02"
              title="Record events"
              body="Manufacture, inspection, shipping, sale, transfer — every event is recorded against the product. Brands push events; we batch and anchor them to Base every two hours."
            />
            <Step
              n="03"
              title="Verify anywhere"
              body="The end customer scans the QR. They see the brand, the timeline, and the on-chain anchor. No login. No app. No trust assumption — only mathematics."
            />
          </div>
          <div className="mt-12">
            <Link
              href="/how-it-works"
              className="text-sm text-accent hover:text-accent-hover"
            >
              Read the full walkthrough →
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-white/5">
        <div className="mx-auto w-full max-w-7xl px-6 py-24">
          <div className="flex items-end justify-between gap-8">
            <SectionTitle
              eyebrow="Use cases"
              title={<>Built for the brands that take counterfeit seriously.</>}
            />
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <UseCaseCard
              href="/use-cases/luxury"
              title="Luxury goods"
              body="Handbags, leather, ready-to-wear. Pair Genuflow with your existing serial system and replace the certificate of authenticity with a public chain-of-custody."
            />
            <UseCaseCard
              href="/use-cases/fashion-textiles"
              title="Fashion & textiles"
              body="Prepare for the EU Digital Product Passport. Record fiber origin, mill, dye lot, and aftercare in one place — and let regulators, retailers, and customers see what they're owed."
            />
            <UseCaseCard
              href="/use-cases/watches-jewelry"
              title="Watches & jewelry"
              body="Service history is the secondary market. Anchor servicing, polishing, and ownership transfers — so a piece's record outlives its first owner."
            />
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 bg-ink-900/40">
        <div className="mx-auto w-full max-w-7xl px-6 py-24">
          <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
            <div className="md:col-span-5">
              <SectionTitle
                eyebrow="Pricing"
                title="One platform. Three tiers."
                description="Pay per product registered. No per-event fees. Anchoring costs are absorbed by us."
              />
              <div className="mt-10">
                <Link
                  href="/pricing"
                  className="text-sm text-accent hover:text-accent-hover"
                >
                  See full pricing →
                </Link>
              </div>
            </div>
            <div className="md:col-span-7">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <PricePreview tier="Atelier" price="€0.40" unit="per product" />
                <PricePreview tier="Maison" price="€0.28" unit="per product" featured />
                <PricePreview tier="Couture" price="Custom" unit="enterprise" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTABand
        title={<>Begin where authentication ends.</>}
        body="Request access for your brand. Onboarding takes one call and one afternoon."
      />
    </>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div>
      <div className="font-serif text-3xl text-accent">{n}</div>
      <h3 className="mt-3 font-serif text-2xl text-ink-50">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-ink-300">{body}</p>
    </div>
  );
}

function UseCaseCard({
  href,
  title,
  body,
}: {
  href: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group relative block rounded-xl border border-white/5 bg-ink-900/40 p-8 transition hover:border-accent/30"
    >
      <h3 className="font-serif text-2xl text-ink-50">{title}</h3>
      <p className="mt-4 text-sm leading-relaxed text-ink-300">{body}</p>
      <div className="mt-6 text-sm text-accent">Read more →</div>
    </Link>
  );
}

function PricePreview({
  tier,
  price,
  unit,
  featured = false,
}: {
  tier: string;
  price: string;
  unit: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-6 ${
        featured
          ? "border-accent/40 bg-accent/5"
          : "border-white/5 bg-ink-900/40"
      }`}
    >
      <div className="text-[10px] uppercase tracking-[0.28em] text-ink-500">
        {tier}
      </div>
      <div className="mt-4 font-serif text-3xl text-ink-50">{price}</div>
      <div className="mt-1 text-xs text-ink-400">{unit}</div>
    </div>
  );
}

