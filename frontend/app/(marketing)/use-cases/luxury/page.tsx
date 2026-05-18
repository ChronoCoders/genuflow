import { BannerImage } from "@/components/marketing/hero-image";
import { CTABand, Eyebrow, PageHero } from "@/components/marketing/section";

export const metadata = {
  title: "Luxury goods — Genuflow",
  description:
    "Cryptographic authentication for handbags, leather goods, and ready-to-wear. Replace the certificate of authenticity with a chain-of-custody on Base.",
};

export default function LuxuryUseCase() {
  return (
    <>
      <PageHero
        eyebrow="Luxury goods"
        title={<>The certificate of authenticity, rebuilt.</>}
        intro="For generations, the paper certificate has been the artefact that says a piece is real. It is also the artefact that counterfeiters reproduce most easily, that customers lose most often, and that secondary markets trust the least. Genuflow replaces it with something better."
      />

      <BannerImage
        src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1920&q=80"
        alt="Hands of a leather artisan stitching a handbag in an atelier"
      />

      <section className="border-b border-white/5">
        <div className="mx-auto w-full max-w-5xl px-6 py-24">
          <Eyebrow>The category problem</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl text-ink-50 sm:text-5xl">
            Counterfeit is no longer a back-alley problem.
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-ink-300">
            The OECD reports that counterfeit and pirated goods account for
            roughly 2.5% of world trade. For leather goods, ready-to-wear, and
            handbags, the share is higher — and rising — because the
            production tooling for fakes has caught up to the originals. The
            consequence is that no visual inspection, no microfiber inlay, no
            hidden stitch is enough on its own. Authentication has to leave
            the object.
          </p>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
            <Card title="What we record">
              <ul className="space-y-2 text-sm leading-relaxed text-ink-300">
                <li>Workshop, master craftsman, completion date</li>
                <li>Materials and provenance — leather lot, hardware origin</li>
                <li>Internal serial and any product-specific markings</li>
                <li>Inspection and shipping events</li>
                <li>First sale: boutique, region, date</li>
                <li>Subsequent transfers, services, restorations</li>
              </ul>
            </Card>
            <Card title="Where the tag lives">
              <ul className="space-y-2 text-sm leading-relaxed text-ink-300">
                <li>Inside the inner pocket on a leather patch</li>
                <li>On the dust bag, paired with the warranty card</li>
                <li>Etched on the metal plate of hardware</li>
                <li>On the original receipt and packaging insert</li>
                <li>Inside the certificate booklet (in addition to print)</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 bg-ink-900/40">
        <div className="mx-auto w-full max-w-5xl px-6 py-24">
          <Eyebrow>What it changes</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl text-ink-50 sm:text-5xl">
            Authentication, end to end.
          </h2>

          <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
            <Outcome
              title="In the boutique"
              body="A sales associate scans the tag and sees the same record the customer will see. No more lookup against an internal serial database that the resale market doesn't have access to."
            />
            <Outcome
              title="On the secondary market"
              body="Consignment platforms verify against your records, not against their own visual experts. Provenance becomes a property of the product, not of the platform that's selling it."
            />
            <Outcome
              title="In the customer's hand"
              body="A scan returns the brand, the timeline, and the anchor. Insurance claims, loss reports, and estate transfers all reference the same canonical record."
            />
          </div>
        </div>
      </section>

      <section className="border-b border-white/5">
        <div className="mx-auto w-full max-w-5xl px-6 py-24">
          <Eyebrow>What it does not change</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl text-ink-50 sm:text-5xl">
            Your house, your secrets.
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-ink-300">
            Pricing, internal serials, sourcing contracts, and customer
            identities are not anchored on chain. Only a one-way hash of the
            event sequence is. Genuflow's data model is structured so that
            each brand sees only its own subhash on Base — even Genuflow's
            other tenants cannot correlate your records against the public
            commitment.
          </p>
        </div>
      </section>

      <CTABand
        title={<>Move authentication off the paper.</>}
        body="We work directly with creative directors, ops leads, and CTOs. The first integration usually takes a single afternoon."
      />
    </>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-ink-950 p-8">
      <h3 className="font-serif text-2xl text-ink-50">{title}</h3>
      <div className="mt-6">{children}</div>
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
