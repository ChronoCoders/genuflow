import Link from "next/link";

import { CTABand, Eyebrow, PageHero } from "@/components/marketing/section";

export const metadata = {
  title: "Pricing — Genuflow",
  description:
    "Three tiers. Per-product pricing. No per-event fees. Anchoring costs are absorbed by Genuflow.",
};

const TIERS = [
  {
    name: "Atelier",
    price: "€0.40",
    unit: "per product registered",
    description:
      "For independent ateliers and emerging houses producing under five thousand pieces per year.",
    features: [
      "Up to 5,000 products / year",
      "Unlimited events per product",
      "Public verification page on a Genuflow subdomain",
      "Dashboard, QR generation, API access",
      "Email support, next-business-day",
    ],
    cta: { href: "/contact", label: "Request access" },
    featured: false,
  },
  {
    name: "Maison",
    price: "€0.28",
    unit: "per product registered",
    description:
      "For established houses and growing brands. Volume pricing kicks in above five thousand pieces per year.",
    features: [
      "5,000 — 100,000 products / year",
      "Unlimited events per product",
      "Verification page on your own domain (CNAME)",
      "PLM and ERP integrations on request",
      "Priority support, four-hour response",
      "Quarterly review with your account team",
    ],
    cta: { href: "/contact", label: "Talk to sales" },
    featured: true,
  },
  {
    name: "Couture",
    price: "Custom",
    unit: "enterprise & multi-brand groups",
    description:
      "For luxury groups, conglomerates, and brands with custom integration, on-premise, or sovereignty requirements.",
    features: [
      "Unlimited volume",
      "Custom data retention and residency",
      "Single sign-on, role-based access, audit logs",
      "Direct deployment in your cloud account, on request",
      "Dedicated solutions engineering",
      "24/7 support with a named on-call engineer",
    ],
    cta: { href: "/contact", label: "Contact sales" },
    featured: false,
  },
];

const FAQ = [
  {
    q: "Do you charge per event?",
    a: "No. Pricing is per product registered. Record as many events against each product as you need — manufacture, inspection, shipping, sale, transfer, services. The on-chain gas cost is absorbed by Genuflow.",
  },
  {
    q: "What about the public verification page?",
    a: "Included on every tier. On Atelier, it lives on a verify.genuflow.com path. On Maison and Couture, you serve it from your own domain via a CNAME so customers stay on your brand.",
  },
  {
    q: "Can we leave Genuflow without losing data?",
    a: "Yes. The full event history is exportable as a signed JSON archive at any time, and every record is anchored to Base. The on-chain commitments verify independently of our infrastructure — if we ceased to exist tomorrow, the chain of custody would still hold.",
  },
  {
    q: "How does pricing work for sample and gift runs?",
    a: "Products in your dashboard tagged as samples are excluded from the billable count. Most brands keep their lookbook, runway, and PR pieces tagged separately. Talk to us if you have unusual workflow.",
  },
  {
    q: "Do you support EU DPP compliance out of the box?",
    a: "Yes — the Maison and Couture tiers ship with a DPP-shaped data model and verification page. As the European Commission publishes delegated acts for textiles, we update the schema and the public page to match.",
  },
];

export default function Pricing() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title={<>Honest pricing. Per product, not per event.</>}
        intro="We charge for what you actually create — a registered product, signed and identifiable. Recording its full history, anchoring to Base, the public verification page: included."
      />

      <section className="border-b border-white/5">
        <div className="mx-auto w-full max-w-7xl px-6 py-24">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {TIERS.map((t) => (
              <div
                key={t.name}
                className={`flex flex-col rounded-2xl border p-10 ${
                  t.featured
                    ? "border-accent/40 bg-accent/5"
                    : "border-white/5 bg-ink-900/40"
                }`}
              >
                <div className="text-[10px] uppercase tracking-[0.32em] text-ink-500">
                  {t.name}
                </div>
                <div className="mt-6 font-serif text-5xl text-ink-50">
                  {t.price}
                </div>
                <div className="mt-2 text-sm text-ink-400">{t.unit}</div>
                <p className="mt-6 text-sm leading-relaxed text-ink-300">
                  {t.description}
                </p>

                <ul className="mt-8 space-y-3 text-sm text-ink-200">
                  {t.features.map((f) => (
                    <li key={f} className="flex gap-3">
                      <svg
                        className="mt-1 shrink-0 text-accent"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-10">
                  <Link
                    href={t.cta.href}
                    className={`block w-full rounded-md px-6 py-3 text-center text-sm font-medium transition ${
                      t.featured
                        ? "bg-accent text-ink-50 hover:bg-accent-hover"
                        : "border border-ink-700 text-ink-100 hover:border-ink-500"
                    }`}
                  >
                    {t.cta.label}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/5">
        <div className="mx-auto w-full max-w-7xl px-6 py-24">
          <Eyebrow>Compare</Eyebrow>
          <h2 className="mt-4 max-w-3xl font-serif text-4xl text-ink-50 sm:text-5xl">
            What's in each tier.
          </h2>
          <ComparisonTable />
        </div>
      </section>

      <section className="border-b border-white/5 bg-ink-900/40">
        <div className="mx-auto w-full max-w-5xl px-6 py-24">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl text-ink-50 sm:text-5xl">
            Pricing FAQ.
          </h2>

          <div className="mt-12 divide-y divide-white/5">
            {FAQ.map((item) => (
              <div key={item.q} className="grid grid-cols-1 gap-6 py-8 md:grid-cols-12">
                <div className="md:col-span-5">
                  <h3 className="font-serif text-2xl text-ink-50">{item.q}</h3>
                </div>
                <p className="text-base leading-relaxed text-ink-300 md:col-span-7">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABand
        title={<>Need a quote for a specific volume?</>}
        body="Tell us the category, the annual run, and the integration approach. We'll send pricing back within a business day."
      />
    </>
  );
}

type Cell = "check" | "dash" | string;

interface Row {
  feature: string;
  atelier: Cell;
  maison: Cell;
  couture: Cell;
}

const ROWS: Row[] = [
  {
    feature: "Product limit",
    atelier: "500",
    maison: "10,000",
    couture: "Unlimited",
  },
  {
    feature: "Provenance events",
    atelier: "Unlimited",
    maison: "Unlimited",
    couture: "Unlimited",
  },
  { feature: "Base mainnet anchoring", atelier: "check", maison: "check", couture: "check" },
  { feature: "Public verification page", atelier: "check", maison: "check", couture: "check" },
  { feature: "QR code generation", atelier: "check", maison: "check", couture: "check" },
  { feature: "Brand dashboard", atelier: "check", maison: "check", couture: "check" },
  { feature: "API access", atelier: "check", maison: "check", couture: "check" },
  { feature: "Bulk import", atelier: "check", maison: "check", couture: "check" },
  { feature: "Webhook delivery", atelier: "dash", maison: "check", couture: "check" },
  {
    feature: "Custom verification domain",
    atelier: "dash",
    maison: "dash",
    couture: "check",
  },
  {
    feature: "Team members",
    atelier: "1",
    maison: "5",
    couture: "Unlimited",
  },
  { feature: "Priority support", atelier: "dash", maison: "dash", couture: "check" },
  { feature: "SLA", atelier: "dash", maison: "dash", couture: "check" },
];

function ComparisonTable() {
  return (
    <div className="mt-12 overflow-x-auto rounded-xl border border-white/5">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-white/5 bg-ink-900/40">
            <th className="px-6 py-5 text-left text-[10px] uppercase tracking-[0.24em] text-ink-500">
              Feature
            </th>
            <TierHeader name="Atelier" price="€0.40 / product" subhead="≤ 500 products" />
            <TierHeader
              name="Maison"
              price="€0.28 / product"
              subhead="≤ 10,000 products"
              featured
            />
            <TierHeader name="Couture" price="Custom" subhead="Unlimited" />
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {ROWS.map((row) => (
            <tr key={row.feature}>
              <td className="px-6 py-4 text-ink-200">{row.feature}</td>
              <FeatureCell value={row.atelier} />
              <FeatureCell value={row.maison} featured />
              <FeatureCell value={row.couture} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TierHeader({
  name,
  price,
  subhead,
  featured = false,
}: {
  name: string;
  price: string;
  subhead: string;
  featured?: boolean;
}) {
  return (
    <th
      scope="col"
      className={`px-6 py-5 text-left ${featured ? "bg-accent/5" : ""}`}
    >
      <div className="text-[10px] uppercase tracking-[0.24em] text-ink-500">
        {name}
      </div>
      <div className="mt-1 font-serif text-lg text-ink-50">{price}</div>
      <div className="mt-0.5 text-xs text-ink-400">{subhead}</div>
    </th>
  );
}

function FeatureCell({ value, featured = false }: { value: Cell; featured?: boolean }) {
  const tone = featured ? "bg-accent/5" : "";
  if (value === "check") {
    return (
      <td className={`px-6 py-4 ${tone}`}>
        <CheckIcon />
      </td>
    );
  }
  if (value === "dash") {
    return (
      <td className={`px-6 py-4 text-ink-600 ${tone}`}>
        <span aria-label="Not included">—</span>
      </td>
    );
  }
  return (
    <td className={`px-6 py-4 text-ink-100 ${tone}`}>{value}</td>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-label="Included"
      className="text-accent"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
