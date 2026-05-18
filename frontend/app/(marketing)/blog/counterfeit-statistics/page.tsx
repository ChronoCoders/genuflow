import {
  ArticleLayout,
  H2,
  P,
  Pullquote,
  UL,
} from "@/components/marketing/article";

export const metadata = {
  title: "The counterfeit economy is bigger than you think — Genuflow",
  description:
    "OECD data, EUIPO seizure statistics, and the strategic implications for luxury and fashion brands.",
};

export default function Article() {
  return (
    <ArticleLayout
      eyebrow="Industry"
      title="The counterfeit economy is bigger than you think"
      date="May 02, 2026"
      readTime="7 min read"
      image={{
        src: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1920&q=80",
        alt: "Designer leather handbag — the kind of object counterfeit markets target",
      }}
    >
      <P>
        Every few years, the OECD and EUIPO publish a joint report on the
        global trade in counterfeit and pirated goods. The numbers in each
        report are larger than the numbers in the previous one. The numbers
        in the next report will be larger still. For the categories Genuflow
        serves — luxury, fashion and textiles, watches and jewelry — the
        problem has crossed from a recurring nuisance into a strategic one.
      </P>

      <H2>The headline figures</H2>

      <P>
        The most recent OECD-EUIPO joint study estimated that international
        trade in counterfeit and pirated products amounted to roughly
        2.5&thinsp;% of all world trade. That figure includes only
        cross-border goods detected at the customs frontier. It does not
        include domestic counterfeit production, online sales delivered by
        post in small parcels, or services. The true figure is widely
        accepted to be substantially higher.
      </P>

      <UL>
        <li>
          Footwear, apparel, leather goods, and watches consistently rank in
          the top categories by share of customs seizures in the EU.
        </li>
        <li>
          The share of seized counterfeit goods arriving in small parcels —
          typically by post or express courier — has grown sharply over the
          past decade, driven by direct-to-consumer e-commerce.
        </li>
        <li>
          The split between counterfeit goods sold to unwitting consumers
          versus those sold to willing ones has shifted. The second category
          is no longer the rarer of the two.
        </li>
      </UL>

      <H2>Why the visual cues stopped working</H2>

      <P>
        For most of the modern history of luxury, the answer to
        &ldquo;is it real?&rdquo; has been visual. A seasoned associate, an
        in-house expert, a third-party authenticator examined the stitching,
        the metal, the leather grain, the font on the hot-stamp. The premise
        was that producing a convincing fake required production tooling that
        only the original house had.
      </P>

      <P>
        That premise no longer holds. The tooling for fakes has caught up.
        Counterfeit handbags now use the same kind of vegetable-tanned
        leather, the same hardware finishes, and increasingly the same
        stitching machines as the originals. Watches are reproduced down to
        the movement architecture for entry-tier mechanicals. The visible
        gap has closed — and where the gap is closed, visual inspection
        cannot decide the question.
      </P>

      <Pullquote>
        Authentication that depends on examining the object alone has
        already lost. The only authentication that scales is the one that
        leaves the object.
      </Pullquote>

      <H2>The secondary market multiplier</H2>

      <P>
        For luxury and watches in particular, counterfeit damage is not
        bounded by lost first-sale revenue. Each fake that enters the
        secondary market poisons the resale economics of the whole category.
        Consignment platforms have to spend more on authentication.
        Premiums on verified pieces inflate. The variance between a verified
        and an unverified piece of the same reference widens.
      </P>

      <P>
        In other words: counterfeits make the resale market more expensive,
        slower, and less liquid — for the legitimate participants. This is
        the part that does not show up in the OECD seizure statistics, and
        it is the part that matters most for the long-term economics of a
        luxury house.
      </P>

      <H2>What works against it</H2>

      <P>
        The legal regimes — customs enforcement, takedown requests on
        marketplaces, civil litigation — are necessary but slow. They do not
        scale to the volume of counterfeit produced today, and they do not
        address the fundamental problem, which is that authentication is
        still anchored to the object itself.
      </P>

      <P>
        The interventions that actually move the needle are the ones that
        change where authentication lives. NFC tags, secure serialization,
        digital certificates — all of these are attempts to attach an
        identity to the object that a counterfeiter cannot reproduce by
        reproducing the object. The hard part is making the identity
        verifiable by the people who need to verify it, when they need to
        verify it, without trusting a single platform to remain in business.
      </P>

      <H2>What we are doing about it</H2>

      <P>
        Genuflow is a small contribution to a structural problem. We give
        brands a way to issue cryptographic identities for their products,
        record the chain of custody as it happens, and anchor the result on
        a public chain that anyone can audit. None of this prevents
        counterfeit from being made. What it does is make counterfeit
        instantly recognizable wherever the genuine version's record is
        consulted — boutique, customer's home, customs hall, resale
        platform, courtroom.
      </P>

      <P>
        The brands that build this in over the next five years will spend
        the decade after that on offence rather than defence. The brands
        that don't will spend it explaining why they didn't.
      </P>
    </ArticleLayout>
  );
}
