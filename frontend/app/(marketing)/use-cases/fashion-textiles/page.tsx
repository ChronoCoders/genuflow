import { BannerImage } from "@/components/marketing/hero-image";
import { CTABand, Eyebrow, PageHero } from "@/components/marketing/section";

export const metadata = {
  title: "Fashion & textiles — Genuflow",
  description:
    "Built for the EU Digital Product Passport. Fiber origin, mill, dye lot, aftercare — one verifiable record per garment, anchored to Base.",
};

export default function FashionTextilesUseCase() {
  return (
    <>
      <PageHero
        eyebrow="Fashion & textiles"
        title={
          <>
            Built for the
            <br />
            Digital Product Passport.
          </>
        }
        intro="The EU Ecodesign for Sustainable Products Regulation (ESPR) introduces a Digital Product Passport for textile products. From the mid-decade onwards, every garment placed on the EU market will carry a data record that follows it from fiber to disposal. Genuflow is the system of record."
      />

      <BannerImage
        src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80"
        alt="Macro detail of woven textile fabric"
      />

      <section className="border-b border-white/5">
        <div className="mx-auto w-full max-w-5xl px-6 py-24">
          <Eyebrow>The regulation, in brief</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl text-ink-50 sm:text-5xl">
            Textiles are the first priority category.
          </h2>
          <div className="mt-8 space-y-5 text-base leading-relaxed text-ink-300">
            <p>
              The ESPR was adopted in 2024 and entered into force the same
              year. It empowers the European Commission to set product-specific
              ecodesign and information requirements through delegated acts,
              with textiles named explicitly as a priority category.
            </p>
            <p>
              Under the DPP, each product must carry a data carrier — typically
              a QR code or NFC tag — that links to a structured record. That
              record covers fiber composition, country of manufacture,
              repair and aftercare information, recycled-content claims, and
              any environmental and durability information the Commission
              specifies in the delegated act.
            </p>
            <p>
              The data record must be persistent, accessible without
              proprietary software, and durable for at least the lifetime of
              the product. It must be tamper-evident — a brand cannot simply
              edit history.
            </p>
          </div>

          <div className="mt-16 rounded-xl border border-accent/30 bg-accent/5 p-8">
            <Eyebrow>Why Genuflow</Eyebrow>
            <p className="mt-3 text-base leading-relaxed text-ink-200">
              The DPP regulation does not mandate blockchain — it mandates
              persistence, openness, and tamper-evidence. Anchoring records to
              Base mainnet is the cleanest way to deliver all three in a way
              that does not depend on Genuflow's continued operation. If we
              disappeared tomorrow, the on-chain commitments would still
              verify.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 bg-ink-900/40">
        <div className="mx-auto w-full max-w-5xl px-6 py-24">
          <Eyebrow>The data model</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl text-ink-50 sm:text-5xl">
            One garment, one record.
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card
              title="Composition"
              items={[
                "Fiber breakdown by mass — wool, cotton, recycled polyester",
                "Origin country and certification for each fiber",
                "Recycled-content claims with documentary references",
                "Restricted-substance declarations (SVHC, CMR)",
              ]}
            />
            <Card
              title="Manufacture"
              items={[
                "Spinning mill, weaving or knitting mill, dyehouse",
                "Country of last substantial transformation",
                "Dye lot, finishing chemistry, water-use claims",
                "Audit and certification references (GOTS, OEKO-TEX, etc.)",
              ]}
            />
            <Card
              title="Use & care"
              items={[
                "Care labelling per ISO 3758",
                "Repair instructions and recommended service centres",
                "Expected useful life under specified conditions",
                "Compatible-spare-parts references for repairable items",
              ]}
            />
            <Card
              title="End of life"
              items={[
                "Recycling and recovery routes",
                "Take-back programme references",
                "Disposal instructions per fiber",
                "Residual-value claims for resale platforms",
              ]}
            />
          </div>
        </div>
      </section>

      <section className="border-b border-white/5">
        <div className="mx-auto w-full max-w-5xl px-6 py-24">
          <Eyebrow>What you ship</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl text-ink-50 sm:text-5xl">
            A care label, a QR code, a public record.
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-3">
            <Outcome
              title="On the garment"
              body="A woven or printed label carries the data-carrier (QR or NFC). The link resolves to a public page hosted by Genuflow under your domain, presenting the DPP record in the language of the scanner."
            />
            <Outcome
              title="In your systems"
              body="You push the data once, at production, through the Genuflow API or a direct integration with your PLM. Subsequent events — repairs, take-back, resale transfers — append to the record."
            />
            <Outcome
              title="To the regulator"
              body="When asked to demonstrate compliance, you point the auditor at the on-chain anchor and the public DPP page. The audit is the verification."
            />
          </div>
        </div>
      </section>

      <CTABand
        title={<>Start preparing now.</>}
        body="The DPP is rolling out by product category. The brands that integrate early will have years of operational data — and customer trust — before competitors begin."
      />
    </>
  );
}

function Card({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-white/5 bg-ink-950 p-8">
      <h3 className="font-serif text-2xl text-ink-50">{title}</h3>
      <ul className="mt-6 space-y-2.5 text-sm leading-relaxed text-ink-300">
        {items.map((i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-2 block h-1 w-1 shrink-0 rounded-full bg-accent" />
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Outcome({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="font-serif text-2xl text-ink-50">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-ink-300">{body}</p>
    </div>
  );
}
