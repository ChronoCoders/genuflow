import Link from "next/link";

import { CTABand, Eyebrow, PageHero } from "@/components/marketing/section";

export const metadata = {
  title: "Resources — Genuflow",
  description:
    "Whitepapers, integration guides, and reference documents for the brands building cryptographic provenance.",
};

const WHITEPAPERS = [
  {
    title: "Architecting for the Digital Product Passport",
    summary:
      "A 28-page whitepaper covering the EU regulatory landscape, the technical requirements for DPP records, and reference architectures for fashion brands integrating with Genuflow.",
    audience: "Heads of Sustainability, Product, IT",
    href: "/contact?topic=dpp-whitepaper",
  },
  {
    title: "The economics of cryptographic authentication",
    summary:
      "An analysis of the cost structure of running an authentication programme — tag manufacturing, anchoring fees, secondary-market recovery — with worked examples for three brand archetypes.",
    audience: "CFO, COO, Commercial leadership",
    href: "/contact?topic=economics-whitepaper",
  },
  {
    title: "Migrating from QR + database to anchored provenance",
    summary:
      "A practical migration guide for brands already running an in-house authentication programme. Includes the schema mapping, an event-replay strategy, and a rollback plan.",
    audience: "CTO, VP Engineering",
    href: "/contact?topic=migration-guide",
  },
];

const GUIDES = [
  {
    title: "Integration in one afternoon",
    summary:
      "A scripted walkthrough that takes a developer from zero to a working product registration and verification flow in under four hours. Includes Postman collections and a reference repository.",
    href: "/docs",
  },
  {
    title: "Tag-placement playbook for ready-to-wear",
    summary:
      "Where to place the QR or NFC carrier on each garment archetype — coats, knitwear, evening, leather — with material constraints, durability data, and care-label integration.",
    href: "/contact?topic=tag-placement",
  },
  {
    title: "Customer communication after a transfer",
    summary:
      "Email templates, in-app copy, and verification-page customization for the moment a piece changes hands. Built with three luxury brands' communications teams.",
    href: "/contact?topic=transfer-comms",
  },
];

export default function Resources() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title={<>Documentation worth reading.</>}
        intro="We write the kind of resource we would have wanted before starting the company. Whitepapers, integration guides, regulatory briefings — written for people who have to make decisions and ship work, not for marketing departments."
      />

      <section className="border-b border-white/5">
        <div className="mx-auto w-full max-w-5xl px-6 py-24">
          <Eyebrow>Whitepapers</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl text-ink-50 sm:text-5xl">
            Reference documents.
          </h2>

          <div className="mt-12 space-y-6">
            {WHITEPAPERS.map((w) => (
              <ResourceCard key={w.title} {...w} kind="whitepaper" />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 bg-ink-900/40">
        <div className="mx-auto w-full max-w-5xl px-6 py-24">
          <Eyebrow>Guides</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl text-ink-50 sm:text-5xl">
            Operational playbooks.
          </h2>

          <div className="mt-12 space-y-6">
            {GUIDES.map((g) => (
              <ResourceCard key={g.title} {...g} kind="guide" />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/5">
        <div className="mx-auto w-full max-w-5xl px-6 py-24">
          <Eyebrow>Open standards we draw from</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl text-ink-50 sm:text-5xl">
            We don't reinvent what already works.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            <StandardCard
              title="GS1 Digital Link"
              body="The URL syntax that lets a single QR code carry product, batch, and serial identifiers in a way every retailer scanner can read. Genuflow products are addressable as Digital Links by default."
            />
            <StandardCard
              title="W3C Verifiable Credentials"
              body="The W3C standard for cryptographically signed claims. Our event payloads are designed to be expressible as VCs, so that the data is portable beyond Genuflow."
            />
            <StandardCard
              title="ISO 3758"
              body="The international care-labelling standard used in textiles. Our DPP data model encodes care information per ISO 3758 so that the on-screen presentation matches the woven label."
            />
            <StandardCard
              title="EU ESPR"
              body="The Ecodesign for Sustainable Products Regulation, which introduces the Digital Product Passport. We track the delegated acts as they are published and update the platform accordingly."
            />
          </div>
        </div>
      </section>

      <CTABand
        title={<>Looking for something specific?</>}
        body="Tell us what you're trying to build or decide. If we have a resource that fits, we'll send it. If we don't, we'll write a note that does."
      />
    </>
  );
}

function ResourceCard({
  title,
  summary,
  href,
  kind,
  audience,
}: {
  title: string;
  summary: string;
  href: string;
  kind: "whitepaper" | "guide";
  audience?: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-white/5 bg-ink-950 p-8 transition hover:border-accent/30"
    >
      <div className="flex items-baseline justify-between">
        <div className="text-[10px] uppercase tracking-[0.28em] text-accent">
          {kind === "whitepaper" ? "Whitepaper" : "Guide"}
        </div>
        <span className="text-sm text-accent">
          {kind === "whitepaper" ? "Request →" : "Read →"}
        </span>
      </div>
      <h3 className="mt-4 font-serif text-2xl text-ink-50 sm:text-3xl">
        {title}
      </h3>
      <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-300">
        {summary}
      </p>
      {audience ? (
        <div className="mt-4 text-xs uppercase tracking-wider text-ink-500">
          For: {audience}
        </div>
      ) : null}
    </Link>
  );
}

function StandardCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-ink-950 p-8">
      <h3 className="font-serif text-2xl text-ink-50">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-ink-300">{body}</p>
    </div>
  );
}
