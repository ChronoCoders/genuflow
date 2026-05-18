import {
  ArticleLayout,
  H2,
  H3,
  P,
  Pullquote,
  UL,
} from "@/components/marketing/article";

export const metadata = {
  title: "The EU Digital Product Passport, explained — Genuflow",
  description:
    "What the ESPR actually says, when delegated acts arrive, and what fashion brands should be building this year.",
};

export default function Article() {
  return (
    <ArticleLayout
      eyebrow="Regulation"
      title="The EU Digital Product Passport, explained"
      date="May 14, 2026"
      readTime="9 min read"
      image={{
        src: "https://images.unsplash.com/photo-1608817576203-3c27ed168bd2?w=1920&q=80",
        alt: "European Union flag — the regulatory context for the Digital Product Passport",
      }}
    >
      <P>
        If you are sitting inside a fashion brand or a textile supplier and
        you have heard about the European Digital Product Passport without
        quite knowing what it is or when it begins, this is the article you
        wanted. The short version: a regulation has passed, the operational
        rules will arrive product category by product category, and the
        textile sector is first in line.
      </P>

      <P>
        The longer version requires understanding two things. First, what the
        underlying regulation — the Ecodesign for Sustainable Products
        Regulation, or ESPR — actually does. Second, how the European
        Commission intends to roll the DPP requirements out in practice, and
        what brands can start building now without waiting for the final
        delegated acts.
      </P>

      <H2>What the ESPR is, and what it isn't</H2>

      <P>
        The ESPR is a framework regulation. It was adopted in 2024 and
        entered into force the same year. It is the successor to the original
        Ecodesign Directive, but it does two things the old directive did
        not: it covers nearly every product placed on the EU market, not
        just energy-using ones, and it introduces the Digital Product
        Passport as a horizontal instrument.
      </P>

      <P>
        It is important to understand that the ESPR itself does not say
        &ldquo;every garment must carry a QR code by date X.&rdquo; What it
        says is that the European Commission has the authority to adopt
        delegated acts — secondary legislation, written without going back
        through the full co-decision process — that impose specific design,
        information, and DPP requirements for individual product groups.
        Textiles is named as one of the first priority groups.
      </P>

      <P>
        The practical consequence is that the textile DPP rules will land in
        the form of one or more delegated acts published in the years
        following the ESPR's entry into force, with a transition period
        before they bite. Brands that wait for the final text to be
        published will have something like twelve to eighteen months to
        comply. Brands that begin the work now will have several years.
      </P>

      <H2>What the DPP record actually contains</H2>

      <P>
        The Commission has published a working specification of what the
        textile DPP will contain. Final wording will shift, but the broad
        shape is settled. Each record is keyed to a unique product identity
        and must be accessible via a data carrier — typically a QR code or
        NFC tag — printed on or attached to the product itself.
      </P>

      <UL>
        <li>
          Fiber composition, broken down by mass, with origin claims for
          each fiber.
        </li>
        <li>
          Country of last substantial transformation, plus information on
          the spinning mill, weaving or knitting mill, and dyehouse.
        </li>
        <li>
          Restricted-substance declarations covering SVHC (substances of very
          high concern) and CMR (carcinogenic, mutagenic, reprotoxic)
          substances.
        </li>
        <li>
          Aftercare information — washing, drying, and ironing instructions
          per ISO 3758, plus recommended repair routes.
        </li>
        <li>
          Recycled-content claims with documentary references, where the
          brand chooses to make them.
        </li>
        <li>
          Expected useful life, recovery and recycling routes, and any
          take-back programme references.
        </li>
      </UL>

      <H2>The three non-negotiable properties of a DPP record</H2>

      <P>
        The Commission has been explicit about three properties the record
        must have, regardless of which technology a brand uses to deliver
        it. Each is more important than the next when you start designing.
      </P>

      <H3>Persistence</H3>

      <P>
        The DPP must remain accessible for at least the lifetime of the
        product, and that lifetime can be measured in decades for textiles
        that are designed to last. A brand cannot simply host the record on
        its own marketing website and hope that the website still exists in
        2045. The record needs a substrate independent of any single
        company's continued operation.
      </P>

      <H3>Openness</H3>

      <P>
        The DPP must be readable without proprietary software. A consumer
        with a phone, a regulator with a browser, and a resale platform with
        an HTTP client all need to be able to fetch and interpret the
        record. This is the property that rules out closed mobile apps,
        membership-walled web platforms, and any technology that depends on
        a particular vendor's continued involvement.
      </P>

      <H3>Tamper-evidence</H3>

      <P>
        A brand cannot quietly edit history. If the dyehouse changes between
        production runs, that fact must be recorded — not overwritten. If a
        recycled-content claim is later discovered to be wrong, the
        correction must be visible as a correction, not as a silent rewrite
        of the past.
      </P>

      <Pullquote>
        The DPP is not a database row. It is an evolving record whose
        history must be auditable end-to-end, by anyone, without trusting
        the brand or the platform.
      </Pullquote>

      <H2>Why we anchor to a public chain</H2>

      <P>
        The regulation does not mandate blockchain. It mandates persistence,
        openness, and tamper-evidence. Anchoring to a public chain like Base
        happens to be the cleanest way to deliver all three at once.
      </P>

      <P>
        A public chain provides a substrate that does not depend on any
        single company's continued operation — including ours. The data
        carrier on the garment resolves to a Genuflow-hosted page, but the
        cryptographic commitment behind it lives on Base, where anyone with
        an Ethereum client can verify it. If Genuflow disappeared tomorrow,
        a determined brand could rebuild the public verification page from
        the on-chain commitments and the brand's own off-chain exports.
      </P>

      <P>
        It also gives us a clean answer to the openness requirement. The
        chain is permissionless. The verification logic is mathematics, not
        terms of service. A regulator does not need an account with us to
        audit a brand's record.
      </P>

      <H2>What to build this year</H2>

      <P>
        The work that brands should do before the textile delegated act lands
        is not technical. It is operational. The hardest part of DPP
        compliance is not generating the QR code; it is having the data to
        put behind it. That data lives in different systems today — the PLM
        for composition, the ERP for sourcing, the QA system for inspection,
        the customer service platform for repair history.
      </P>

      <P>
        We recommend three things. First, pick a single product line and
        attempt to construct a complete DPP record for it manually. The
        exercise reveals which data lives where, and which data does not
        live anywhere yet. Second, integrate Genuflow against that product
        line and run it in shadow mode — recording every event without
        printing the QR code on the garment yet. Third, when the delegated
        act lands, you flip the switch and you are done.
      </P>

      <P>
        The brands that lose money to the DPP rollout will be the ones that
        panic in the last twelve months. The brands that benefit from it
        will be the ones that started in 2026.
      </P>
    </ArticleLayout>
  );
}
