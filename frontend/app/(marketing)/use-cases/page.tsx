import Link from "next/link";

import { CTABand, PageHero } from "@/components/marketing/section";

export const metadata = {
  title: "Use cases — Genuflow",
  description:
    "Genuflow is built for the goods that hold their value: luxury, fashion and textiles, watches and jewelry.",
};

const CASES = [
  {
    href: "/use-cases/luxury",
    title: "Luxury goods",
    summary:
      "Handbags, leather, ready-to-wear. Replace the paper certificate of authenticity with a public chain-of-custody — and watch your secondary market consolidate around your own records.",
  },
  {
    href: "/use-cases/fashion-textiles",
    title: "Fashion & textiles",
    summary:
      "The EU Digital Product Passport arrives in stages from 2026. Genuflow handles fiber origin, mill, dye lot, and aftercare in one verifiable record — built to the ESPR data model.",
  },
  {
    href: "/use-cases/watches-jewelry",
    title: "Watches & jewelry",
    summary:
      "A piece's record outlives its first owner. Service, polishing, valuation, transfer — anchor every chapter and capture the resale narrative.",
  },
];

export default function UseCasesIndex() {
  return (
    <>
      <PageHero
        eyebrow="Use cases"
        title={<>Different categories. The same problem.</>}
        intro="A handbag, a coat, a movement, a stone — each has a story that determines its value. Genuflow gives that story a cryptographic spine. Below, the three categories we build for first."
      />

      <section className="border-b border-white/5">
        <div className="mx-auto w-full max-w-5xl px-6 py-24">
          <div className="space-y-6">
            {CASES.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="group block rounded-xl border border-white/5 bg-ink-900/40 p-10 transition hover:border-accent/30"
              >
                <div className="flex items-baseline justify-between">
                  <h2 className="font-serif text-3xl text-ink-50 sm:text-4xl">
                    {c.title}
                  </h2>
                  <span className="text-sm text-accent">Read more →</span>
                </div>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-300">
                  {c.summary}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTABand
        title={<>Don't see yours?</>}
        body="Whisky, art, leather goods, automotive parts — if it has a serial number and a secondary market, Genuflow probably fits. Tell us about your category."
      />
    </>
  );
}
