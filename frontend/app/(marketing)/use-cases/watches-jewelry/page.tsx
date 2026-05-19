import { BannerImage } from "@/components/marketing/hero-image";
import { CTABand, Eyebrow, PageHero } from "@/components/marketing/section";
import { StatGrid } from "@/components/marketing/stat-grid";

export const metadata = {
  title: "Watches & jewelry — Genuflow",
  description:
    "Service history is the secondary market. Genuflow anchors servicing, polishing, valuation, and ownership transfer so a piece's record outlives its first owner.",
};

export default function WatchesJewelryUseCase() {
  return (
    <>
      <PageHero
        eyebrow="Watches & jewelry"
        title={<>A record that outlives the original owner.</>}
        intro="In watches and jewelry, the secondary market is not an afterthought — it is the market. A piece is sold once by the maker and a dozen times after. The service book, the appraisal, the original receipt: each is a fragment of the same story, and the customer who pieces them together is the one paying the premium. Genuflow makes the whole story one record."
      />

      <BannerImage
        src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1920&q=80"
        alt="Mechanical watch movement under loupe in a watchmaker's workshop"
      />

      <StatGrid
        eyebrow="The numbers"
        title={<>The secondary market has become the market.</>}
        stats={[
          {
            value: "+30%",
            label:
              "growth in the global secondary market for luxury watches over the past three years — faster than primary sales, and the gap is widening. A piece's record outlives its first owner; today that record is fragmented across paper and screenshots.",
            source: "Industry market reports",
          },
        ]}
      />

      <section className="border-b border-white/5">
        <div className="mx-auto w-full max-w-5xl px-6 py-24">
          <Eyebrow>The category problem</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl text-ink-50 sm:text-5xl">
            The service book is the product.
          </h2>
          <div className="mt-8 space-y-5 text-base leading-relaxed text-ink-300">
            <p>
              For a fine mechanical watch or a piece of high jewelry, value is
              accumulated, not assigned. A complete service history, an
              authenticated movement, a documented re-stoning — each of these
              moves the secondary-market price by an order of magnitude.
            </p>
            <p>
              And yet the artefacts that record them are still mostly
              physical. A service book stamped by the manufacture. A
              hand-typed appraisal from an in-house gemologist. A leather
              wallet with two halves of a receipt. These are easily lost,
              easily forged, and easily disputed.
            </p>
            <p>
              Genuflow records each of these events as it happens, against the
              piece's permanent identity. The customer who eventually sells it
              hands over a verifiable timeline — not a folder.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 bg-ink-900/40">
        <div className="mx-auto w-full max-w-5xl px-6 py-24">
          <Eyebrow>What we record</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl text-ink-50 sm:text-5xl">
            Every chapter, anchored.
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card
              title="Watches"
              items={[
                "Reference, serial, movement, case material",
                "First sale: boutique, retailer, date",
                "Complete service history with watchmaker signature",
                "Component swaps — crown, crystal, bracelet links",
                "Restorations and authentic-parts replacement events",
                "Resale transfers between owners",
              ]}
            />
            <Card
              title="Jewelry"
              items={[
                "Stone certification — GIA, AGS, SSEF, Gübelin references",
                "Mounting, metal, hallmarking",
                "Re-sizing, re-tipping, re-stoning events",
                "Independent appraisal and insurance valuations",
                "Heirloom transfers and probate documentation",
                "Restoration after damage or loss",
              ]}
            />
          </div>
        </div>
      </section>

      <section className="border-b border-white/5">
        <div className="mx-auto w-full max-w-5xl px-6 py-24">
          <Eyebrow>What it does for you</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl text-ink-50 sm:text-5xl">
            Stay in the conversation, for the life of the piece.
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-3">
            <Outcome
              title="Customer retention"
              body="When a piece is sold on, the new owner registers themselves on your verification page. You see who currently owns each piece you've ever made. You see when they should be servicing it. You can reach them."
            />
            <Outcome
              title="Service-centre integration"
              body="Authorized service partners log into your branded Genuflow workspace, scan the piece, and record the work. The customer's record updates in real time."
            />
            <Outcome
              title="Insurance & estate"
              body="The piece's record is portable. Insurers reference it directly. Estate solicitors verify provenance against it. Probate becomes a scan, not a search."
            />
          </div>
        </div>
      </section>

      <CTABand
        title={<>Own the second sale, the third, and the tenth.</>}
        body="Genuflow's transfer flow lets new owners self-register their pieces — and brings them back into your customer relationship the moment they do."
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
