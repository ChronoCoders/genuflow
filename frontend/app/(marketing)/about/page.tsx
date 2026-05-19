import { BannerImage } from "@/components/marketing/hero-image";
import { CTABand, Eyebrow, PageHero } from "@/components/marketing/section";

export const metadata = {
  title: "About — Genuflow",
  description:
    "Genuflow exists for the goods that hold their value. Our story, our mission, and the principles we operate by.",
};

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={<>For the goods that hold their value.</>}
        intro="Genuflow is the cryptographic spine for luxury and fashion. We started the company because authentication had become the friction layer between brands and their customers — and because the standards that fix it were already here, waiting to be plugged in."
      />

      <BannerImage
        src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1920&q=80"
        alt="Sewing machine and fabric in a fashion atelier"
      />

      <section className="border-b border-white/5">
        <div className="mx-auto w-full max-w-4xl px-6 py-24">
          <Eyebrow>Mission</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl text-ink-50 sm:text-5xl">
            Make authentication a property of the object, not the platform.
          </h2>
          <div className="mt-10 space-y-6 text-base leading-relaxed text-ink-300">
            <p>
              For decades, the question &ldquo;is this real?&rdquo; has been
              answered by a third party — an expert, a marketplace, a
              certificate, a hologram. Each has the same problem: the trust
              moves to the verifier, and the brand loses the conversation.
            </p>
            <p>
              We believe authentication should be intrinsic to the product. A
              chain-of-custody you can prove without us, without the
              boutique, without the marketplace — without any single party
              you have to trust. Cryptography lets us do this. Genuflow is
              the operational layer that makes it routine.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 bg-ink-900/40">
        <div className="mx-auto w-full max-w-4xl px-6 py-24">
          <Eyebrow>Vision</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl text-ink-50 sm:text-5xl">
            A decade from now, every piece worth keeping has a record.
          </h2>
          <div className="mt-10 space-y-6 text-base leading-relaxed text-ink-300">
            <p>
              The pieces that survive their first owner already live in a
              kind of provenance economy — service books, auction catalogues,
              dealer attestations. Genuflow's vision is to give that economy
              the digital substrate it has been waiting for.
            </p>
            <p>
              We want the secondary market to feel like the primary one. We
              want a customer who buys a vintage coat on a resale platform
              to know it as well as the boutique manager did. We want a
              regulator to verify a Digital Product Passport with the same
              ease as a customer scanning a tag.
            </p>
            <p>
              The end state isn't novel. It is what the words &ldquo;chain of
              custody&rdquo; have always meant. We are simply giving brands
              the tools to honour it.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/5">
        <div className="mx-auto w-full max-w-5xl px-6 py-24">
          <Eyebrow>Founder</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl text-ink-50 sm:text-5xl">
            Built around a single premise.
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-12 md:items-start">
            <div className="md:col-span-4">
              <div className="aspect-square w-full overflow-hidden rounded-lg border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/altug-tatlisu.jpg"
                  alt="Altug Tatlisu, founder of Genuflow"
                  className="block h-full w-full object-cover"
                  style={{ objectPosition: "center top" }}
                />
              </div>
              <div className="mt-6 font-serif text-xl text-ink-50">
                Altug Tatlisu
              </div>
              <div className="mt-1 text-xs uppercase tracking-[0.24em] text-ink-500">
                Founder
              </div>
              <a
                href="https://www.linkedin.com/in/altug-tatlisu/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover"
              >
                <span>LinkedIn</span>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M7 17 17 7" />
                  <path d="M8 7h9v9" />
                </svg>
              </a>
            </div>

            <div className="space-y-5 text-base leading-relaxed text-ink-300 md:col-span-8">
              <p>
                A distributed systems engineer who spent years building
                infrastructure at the intersection of finance,
                cryptography, and supply chain. Before founding Genuflow,
                he led engineering teams working on settlement
                infrastructure and blockchain-native financial systems.
              </p>
              <p>
                Genuflow started from a simple observation: the luxury
                industry's authentication problem is fundamentally an
                infrastructure problem. Paper certificates are easy to
                forge; centralised databases can be altered; only
                cryptographic commitments anchored to a public chain are
                structurally tamper-resistant. Genuflow is the company
                built around that premise.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/5 bg-ink-900/40">
        <div className="mx-auto w-full max-w-5xl px-6 py-24">
          <Eyebrow>Principles</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl text-ink-50 sm:text-5xl">
            How we operate.
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2">
            <Principle
              title="Brands own the relationship."
              body="The verification page lives on your domain. The data model is yours. The customer never has to know we exist — and if they ask, the answer is technical, not commercial."
            />
            <Principle
              title="The protocol outlives the company."
              body="If Genuflow disappeared, the on-chain commitments would still verify. We design every part of the stack so that brands can leave with their data and customers can audit independently."
            />
            <Principle
              title="No proprietary lock-in by default."
              body="Open data formats. Standard cryptography. Public chain. Brands export their full event history at any time, with no friction and no exit clause."
            />
            <Principle
              title="Multi-tenant means private."
              body="One brand's records cannot be correlated against another brand's records using the on-chain data. We engineer for tenant privacy as a baseline, not a feature."
            />
          </div>
        </div>
      </section>

      <section className="border-b border-white/5">
        <div className="mx-auto w-full max-w-4xl px-6 py-24">
          <Eyebrow>The team</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl text-ink-50 sm:text-5xl">
            Built by operators, engineers, and people who buy the things we
            protect.
          </h2>
          <p className="mt-8 text-base leading-relaxed text-ink-300">
            Genuflow is a small team headquartered between Istanbul and
            London, with collaborators in Como, Geneva, and New York. We have
            built infrastructure inside fashion houses, fintechs, and
            protocol companies. Most of us own at least one thing we wish
            had a Genuflow record on it.
          </p>
        </div>
      </section>

      <CTABand
        title={<>Want to know more?</>}
        body="Send us a note. We answer founders and creative directors personally — usually within the day."
      />
    </>
  );
}

function Principle({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="font-serif text-2xl text-ink-50">{title}</h3>
      <p className="mt-3 text-base leading-relaxed text-ink-300">{body}</p>
    </div>
  );
}
