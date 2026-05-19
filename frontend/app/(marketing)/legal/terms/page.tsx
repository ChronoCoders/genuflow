import { H2, H3, LegalShell, UL } from "@/components/marketing/legal-shell";

export const metadata = {
  title: "Terms of service — Genuflow",
  description:
    "Subscription terms, acceptable use, payment, liability, and governing law for Genuflow's authentication platform.",
};

export default function TermsOfService() {
  return (
    <LegalShell
      eyebrow="Terms"
      title="Terms of service"
      effectiveDate="May 18, 2026"
    >
      <p>
        These Terms of Service (the &ldquo;Terms&rdquo;) govern your
        access to and use of the Genuflow authentication platform,
        including our website, API, dashboard, and any related
        services (collectively, the &ldquo;Service&rdquo;). The
        Service is provided by Genuflow, a company organised under the
        laws of the State of Delaware, United States.
      </p>
      <p>
        By registering for an account or using the Service, you agree
        to be bound by these Terms. If you are entering into these
        Terms on behalf of a company or other legal entity, you
        represent that you have authority to bind that entity, and
        &ldquo;you&rdquo; refers to that entity.
      </p>

      <H2>1. The service</H2>
      <p>
        Genuflow operates a cryptographic provenance platform for
        physical goods. Brands register products through our API,
        record events against them, and have those records
        periodically anchored to Base mainnet. End customers can
        verify product provenance through public verification pages.
      </p>
      <p>
        We may modify or update the Service from time to time. We
        will not materially reduce its core functionality during a
        paid subscription term without notice and, where reasonable, a
        refund of unused fees.
      </p>

      <H2>2. Accounts and team</H2>
      <p>
        You must register an account to use the paid features of the
        Service. The first account registered for a brand is
        designated the owner; additional users may be invited at the
        admin or member role. You are responsible for maintaining the
        confidentiality of credentials and for all activity that
        occurs under your account.
      </p>
      <p>
        You must use a valid email address, accurate brand
        information, and a password of at least twelve characters. We
        reserve the right to suspend accounts where this information
        appears materially incorrect or where the account is used in
        violation of these Terms.
      </p>

      <H2>3. Subscription plans and limits</H2>
      <p>
        The Service is offered in three subscription tiers, each with
        a product-registration ceiling that determines how many
        unique products you may register per brand at any one time:
      </p>
      <UL>
        <li>
          <strong>Atelier</strong> — up to 500 products. Default tier
          on registration.
        </li>
        <li>
          <strong>Maison</strong> — up to 10,000 products.
        </li>
        <li>
          <strong>Couture</strong> — unlimited; enterprise terms
          negotiated separately.
        </li>
      </UL>
      <p>
        Attempts to register products beyond the plan ceiling are
        rejected with an HTTP 402 response until you upgrade. Provenance
        events recorded against existing products are unmetered. On-chain
        anchoring fees are absorbed by Genuflow and never billed
        through to you.
      </p>

      <H2>4. Payment terms</H2>
      <p>
        Subscription fees are billed monthly in advance through Stripe.
        Payment is due on the renewal date for each billing cycle.
        Failed payments will trigger a 14-day grace period during which
        the account remains active; if payment is not resolved within
        that period, the account is automatically downgraded to the
        Atelier tier and any products in excess of the Atelier ceiling
        are flagged as inactive (not deleted).
      </p>
      <p>
        All fees are exclusive of any sales, value-added, or similar
        taxes. Where Genuflow is required to collect such taxes, they
        will be added to the invoiced amount.
      </p>
      <p>
        Fees are non-refundable except where required by law or where
        a service interruption attributable to Genuflow exceeds 24
        hours, in which case a pro-rata credit is applied to the next
        invoice. Plan downgrades take effect at the end of the current
        billing period; no partial-period refunds are issued.
      </p>

      <H2>5. Acceptable use</H2>
      <p>
        You agree not to use the Service to:
      </p>
      <UL>
        <li>
          Register or describe products that are illegal to
          manufacture, sell, or transport in your jurisdiction or the
          recipient's jurisdiction.
        </li>
        <li>
          Knowingly misrepresent the provenance, materials, origin, or
          ownership history of a product.
        </li>
        <li>
          Infringe on the intellectual-property rights of any third
          party, including but not limited to recording provenance
          events against counterfeit goods that purport to be
          another brand's products.
        </li>
        <li>
          Attempt to circumvent plan limits, billing controls, or
          access controls, including by registering multiple brand
          accounts to evade a single brand's ceiling.
        </li>
        <li>
          Probe, scan, or test the vulnerability of the Service
          outside of our published responsible-disclosure programme.
        </li>
        <li>
          Use the Service to send unsolicited communications, store or
          transmit malicious code, or transmit content that is
          unlawful, harassing, or otherwise objectionable.
        </li>
      </UL>
      <p>
        We may suspend or terminate access where we have reasonable
        grounds to believe these terms have been violated. Where
        possible we will notify you and provide an opportunity to cure
        the violation before suspension.
      </p>

      <H2>6. Intellectual property</H2>

      <H3>6.1 Our property</H3>
      <p>
        Genuflow retains all rights, title, and interest in the
        Service, including the dashboard, API, infrastructure, brand
        marks, and underlying source code. No rights are granted to
        you except as expressly set out in these Terms.
      </p>

      <H3>6.2 Your data</H3>
      <p>
        You retain all rights to the product information, event data,
        and brand content you submit through the Service. You grant
        Genuflow a non-exclusive, worldwide licence to host, process,
        transmit, and display this content solely to provide the
        Service to you. This licence terminates when the corresponding
        data is deleted, except for on-chain anchored hashes, which
        are intrinsically permanent.
      </p>

      <H2>7. Confidentiality</H2>
      <p>
        Each party will protect the other's confidential information
        with at least the same degree of care it uses to protect its
        own, and in any event no less than reasonable care.
        Confidential information does not include information that
        was publicly known, was independently developed, or was
        rightfully received from a third party without obligation of
        confidentiality.
      </p>

      <H2>8. Disclaimers</H2>
      <p>
        The Service is provided &ldquo;as is&rdquo; and &ldquo;as
        available.&rdquo; To the maximum extent permitted by law,
        Genuflow disclaims all warranties, express or implied,
        including warranties of merchantability, fitness for a
        particular purpose, and non-infringement.
      </p>
      <p>
        Genuflow does not warrant that the Service will be
        uninterrupted, that anchor batches will be confirmed within a
        specific timeframe, or that the on-chain commitment will
        forever be readable through any specific block explorer. The
        on-chain commitment will remain readable from any node that
        retains the relevant Base history.
      </p>

      <H2>9. Limitation of liability</H2>
      <p>
        To the maximum extent permitted by law, Genuflow's total
        cumulative liability arising out of or relating to these
        Terms or the Service will not exceed the fees you paid to
        Genuflow in the twelve months immediately preceding the event
        giving rise to the claim. In no event will Genuflow be liable
        for indirect, incidental, special, consequential, or punitive
        damages, including lost profits, lost revenue, lost data, or
        business interruption.
      </p>
      <p>
        These limitations apply even if Genuflow has been advised of
        the possibility of such damages and even if any limited
        remedy fails of its essential purpose.
      </p>

      <H2>10. Indemnification</H2>
      <p>
        You agree to defend, indemnify, and hold Genuflow harmless
        against any third-party claim, demand, or action arising out
        of your use of the Service in breach of these Terms or in
        violation of applicable law, including but not limited to
        claims of intellectual-property infringement, defamation, or
        misrepresentation of provenance. Genuflow will notify you
        promptly of any such claim and cooperate reasonably in your
        defence.
      </p>

      <H2>11. Termination</H2>
      <p>
        You may terminate your subscription at any time from the
        dashboard or by contacting{" "}
        <a
          href="mailto:hello@genuflow.com"
          className="text-accent hover:text-accent-hover"
        >
          hello@genuflow.com
        </a>
        . Termination takes effect at the end of the current billing
        period. We may terminate or suspend the Service for material
        breach of these Terms with reasonable notice and an
        opportunity to cure where the breach is curable.
      </p>
      <p>
        Upon termination, your access to the dashboard and API ceases.
        Your product and event data is retained for 30 days for export
        purposes, then deleted. On-chain commitments are not deleted
        — they remain on Base mainnet by the nature of the chain.
      </p>

      <H2>12. Governing law and dispute resolution</H2>
      <p>
        These Terms are governed by the laws of the State of Delaware,
        United States, without regard to its conflict-of-laws
        provisions. The United Nations Convention on Contracts for
        the International Sale of Goods does not apply.
      </p>
      <p>
        Any dispute, claim, or controversy arising out of or relating
        to these Terms or the Service that cannot be resolved through
        good-faith negotiation within 30 days will be resolved by
        binding arbitration administered by the American Arbitration
        Association under its Commercial Arbitration Rules, seated in
        Wilmington, Delaware, in the English language. Judgment on the
        award may be entered in any court of competent jurisdiction.
      </p>
      <p>
        Notwithstanding the foregoing, either party may seek
        injunctive or equitable relief in any court of competent
        jurisdiction to protect intellectual-property rights or
        confidential information.
      </p>

      <H2>13. Changes to these terms</H2>
      <p>
        We may amend these Terms from time to time. Material changes
        will be communicated by email to active brand owners at least
        30 days before they take effect. Continued use of the Service
        after the effective date of the amended Terms constitutes
        acceptance. If you do not agree to amended Terms, your sole
        remedy is to terminate your subscription.
      </p>

      <H2>14. Miscellaneous</H2>
      <UL>
        <li>
          <strong>Entire agreement.</strong> These Terms, together
          with the Privacy Policy and any executed order forms or
          Data Processing Agreement, constitute the entire agreement
          between the parties.
        </li>
        <li>
          <strong>Severability.</strong> If any provision is held
          unenforceable, the remaining provisions remain in full
          force.
        </li>
        <li>
          <strong>No waiver.</strong> Failure to enforce any right
          does not constitute a waiver of that right.
        </li>
        <li>
          <strong>Assignment.</strong> You may not assign your rights
          under these Terms without our prior written consent.
          Genuflow may assign these Terms in connection with a
          merger, acquisition, or sale of substantially all of its
          assets.
        </li>
        <li>
          <strong>Notices.</strong> Notices to Genuflow must be sent
          to{" "}
          <a
            href="mailto:legal@genuflow.com"
            className="text-accent hover:text-accent-hover"
          >
            legal@genuflow.com
          </a>
          .
        </li>
      </UL>
    </LegalShell>
  );
}
