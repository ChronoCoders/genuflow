import { H2, H3, LegalShell, Note, UL } from "@/components/marketing/legal-shell";

export const metadata = {
  title: "Privacy policy — Genuflow",
  description:
    "How Genuflow collects, processes, and protects personal data, with GDPR rights and contact information for data subject requests.",
};

export default function PrivacyPolicy() {
  return (
    <LegalShell
      eyebrow="Privacy"
      title="Privacy policy"
      effectiveDate="May 18, 2026"
    >
      <p>
        This privacy policy explains how Genuflow (&ldquo;Genuflow,&rdquo;
        &ldquo;we,&rdquo; &ldquo;us&rdquo;), a company organised under
        the laws of the State of Delaware, United States, collects,
        uses, and protects personal data when you visit our website,
        register a brand account, or use our authentication platform.
      </p>
      <p>
        We act as a data controller in respect of personal data
        relating to the dashboard users of brands that use Genuflow,
        and as a data processor in respect of end-customer data that a
        brand records against its products through our API. This policy
        addresses both roles.
      </p>

      <H2>1. Personal data we collect</H2>

      <H3>1.1 Account data</H3>
      <p>
        When you register a brand account, we collect your email
        address, password (stored as an Argon2id hash; we never see or
        retain your plain-text password), brand name, and role within
        the brand (owner, admin, member).
      </p>

      <H3>1.2 Service usage data</H3>
      <p>
        When you use the dashboard or API, we collect the products you
        register, the provenance events you record against them, the
        API keys you create, the webhook endpoints you configure, and
        the resulting delivery records.
      </p>

      <H3>1.3 Technical data</H3>
      <p>
        We log request metadata for security and operational reasons:
        IP address, user agent, request path, response status code, and
        timestamp. These logs are retained for 90 days and are not
        cross-referenced with account data outside of an active
        investigation.
      </p>

      <H3>1.4 Billing data</H3>
      <p>
        Payment information is collected and stored by Stripe, our
        payment processor. We retain only the Stripe customer
        identifier, the subscription identifier, your plan tier, and
        the next renewal date. We do not store full card numbers,
        CVV codes, or bank account numbers on our systems.
      </p>

      <H3>1.5 End-customer data routed through the API</H3>
      <p>
        When a brand records a transferred-ownership event on the
        public verification page, the new owner's email and any note
        they provide are stored on our systems as part of the event
        payload. This data is recorded on behalf of the brand and is
        treated as that brand's data.
      </p>

      <H2>2. How we use your data</H2>

      <UL>
        <li>To provide and operate the Genuflow service for your brand.</li>
        <li>
          To bill you for usage, manage your subscription, and process
          payments through Stripe.
        </li>
        <li>
          To send service-related communications (security notices,
          billing notices, breach notifications).
        </li>
        <li>
          To detect and prevent fraud, abuse, and unauthorised access.
        </li>
        <li>
          To comply with applicable legal obligations, including
          responding to lawful regulatory or law-enforcement requests.
        </li>
      </UL>
      <p>
        We do not sell personal data. We do not use personal data for
        advertising. We do not share account or service-usage data
        with third parties except as described in this policy.
      </p>

      <H2>3. On-chain anchoring and public data</H2>
      <p>
        Genuflow anchors provenance event records to Base mainnet, a
        public blockchain that inherits security from Ethereum. The
        on-chain commitment is a cryptographic hash — it does not
        contain personal data in readable form, and the hash cannot be
        reversed into the original event content.
      </p>
      <p>
        However, on-chain data is public and permanent. Once anchored,
        a hash cannot be removed from the chain. If you are concerned
        about this property in relation to your specific use of the
        platform, please contact us before recording events that
        relate to identifiable individuals.
      </p>
      <p>
        The corresponding public verification page (
        <code className="font-mono text-sm text-ink-100">/verify/&lt;product&gt;</code>
        ) displays the brand-defined event timeline. Brands choose
        what data to surface; we display only what brands have
        explicitly recorded.
      </p>

      <H2>4. Retention periods</H2>
      <UL>
        <li>
          <strong>Account data</strong> — retained for the lifetime of
          your account and for 30 days after deletion to handle final
          billing and any disputed transactions, then erased.
        </li>
        <li>
          <strong>Product and event data</strong> — retained as long
          as your brand operates the corresponding product. Brands may
          export and delete this data through the API at any time.
        </li>
        <li>
          <strong>Anchor records (on-chain)</strong> — permanent.
          On-chain commitments cannot be erased. The off-chain
          metadata that corresponds to a given hash is subject to the
          retention rules above.
        </li>
        <li>
          <strong>Billing records</strong> — retained for seven years
          after the billing event, as required by United States tax
          and accounting regulations.
        </li>
        <li>
          <strong>Server logs</strong> — 90 days.
        </li>
        <li>
          <strong>Backup snapshots</strong> — encrypted, retained for
          30 days on a rolling basis.
        </li>
      </UL>

      <H2>5. Third-party processors</H2>
      <p>
        We use a small set of subprocessors to operate the service.
        Each is bound by contract to process personal data only on our
        instructions and to maintain confidentiality and security
        measures consistent with applicable law.
      </p>
      <UL>
        <li>
          <strong>Stripe Payments Europe, Ltd.</strong> — billing,
          payment processing, and tax handling. Subject to Stripe's
          own privacy notice.
        </li>
        <li>
          <strong>Cloudflare, Inc.</strong> — edge DNS, TLS
          termination, WAF, and DDoS protection. Cloudflare may
          process IP addresses and request metadata for security
          purposes.
        </li>
        <li>
          <strong>Amazon Web Services, Inc.</strong> — primary
          infrastructure hosting (eu-west-1 region by default,
          us-east-1 for U.S. customers on request).
        </li>
        <li>
          <strong>Base / Ethereum</strong> — the public blockchain
          substrate to which we anchor records. The chain itself is
          decentralised; Coinbase Technologies operates a primary
          sequencer for Base.
        </li>
      </UL>
      <p>
        An up-to-date list of subprocessors is available on request.
        We will notify customers of material changes with at least 30
        days' advance notice.
      </p>

      <H2>6. International transfers</H2>
      <p>
        Genuflow is established in the United States. Personal data
        you provide may be transferred to and processed in the United
        States or in other countries where our subprocessors operate.
        For transfers of personal data of European residents outside
        the European Economic Area, we rely on the European
        Commission's Standard Contractual Clauses (Module Two) and
        supplementary measures including encryption in transit and at
        rest.
      </p>
      <p>
        A copy of the relevant transfer instruments is available on
        request.
      </p>

      <H2>7. Your rights under the GDPR</H2>
      <p>
        If you are a resident of the European Economic Area, the
        United Kingdom, or Switzerland, you have the following rights
        in respect of your personal data:
      </p>
      <UL>
        <li>
          <strong>Right of access</strong> — to obtain confirmation
          that we process your personal data and a copy of that data.
        </li>
        <li>
          <strong>Right to rectification</strong> — to correct
          inaccurate personal data.
        </li>
        <li>
          <strong>Right to erasure</strong> — to have your personal
          data deleted, subject to the legal-retention exceptions
          described in section 4.
        </li>
        <li>
          <strong>Right to data portability</strong> — to receive
          your personal data in a structured, machine-readable
          format. All product and event data is already exportable
          via the API as signed JSON.
        </li>
        <li>
          <strong>Right to object</strong> — to object to processing
          based on legitimate interests.
        </li>
        <li>
          <strong>Right to restriction</strong> — to restrict
          processing in defined circumstances.
        </li>
        <li>
          <strong>Right to withdraw consent</strong> — where
          processing is based on consent, you may withdraw it at any
          time without affecting prior processing.
        </li>
        <li>
          <strong>Right to lodge a complaint</strong> — with your
          local supervisory authority. We would, however, appreciate
          the chance to address concerns first.
        </li>
      </UL>

      <Note>
        To exercise any of these rights, write to{" "}
        <a
          href="mailto:dpo@genuflow.com"
          className="text-accent hover:text-accent-hover"
        >
          dpo@genuflow.com
        </a>
        . We will respond within 30 days and may extend this period by
        up to 60 days for complex requests, in which case we will
        inform you of the extension and the reasons.
      </Note>

      <H2>8. Security</H2>
      <p>
        We maintain administrative, technical, and physical safeguards
        designed to protect personal data from unauthorised access,
        disclosure, alteration, or destruction. These include:
      </p>
      <UL>
        <li>TLS 1.2 or higher for all data in transit.</li>
        <li>Encryption at rest for primary databases and backups.</li>
        <li>
          Argon2id password hashing with per-user salts and
          conservative memory parameters.
        </li>
        <li>
          API key material stored only as SHA-256 digests; plain-text
          keys are returned to the brand exactly once at creation
          time.
        </li>
        <li>
          Tenant isolation enforced at every database query through
          per-row brand_id scoping.
        </li>
        <li>
          Least-privilege access controls for our engineering team,
          with audited break-glass procedures.
        </li>
        <li>
          Regular third-party security review and a published
          responsible-disclosure policy.
        </li>
      </UL>
      <p>
        In the event of a personal-data breach likely to result in a
        risk to your rights and freedoms, we will notify the relevant
        supervisory authority within 72 hours and notify affected
        users without undue delay where required.
      </p>

      <H2>9. Children</H2>
      <p>
        Genuflow is a business-to-business platform and is not
        directed at children under 16. We do not knowingly collect
        personal data from children. If you believe a child has
        provided personal data to us, please contact us so we can
        delete it.
      </p>

      <H2>10. Changes to this policy</H2>
      <p>
        We may update this policy from time to time. Material changes
        will be communicated by email to all active brand owners at
        least 30 days before they take effect. The effective date at
        the top of this page reflects the most recent version.
      </p>

      <H2>11. Contact</H2>
      <p>
        For privacy questions, data subject requests, or to contact
        our Data Protection Officer:
      </p>
      <UL>
        <li>
          Email:{" "}
          <a
            href="mailto:dpo@genuflow.com"
            className="text-accent hover:text-accent-hover"
          >
            dpo@genuflow.com
          </a>
        </li>
        <li>
          General:{" "}
          <a
            href="mailto:hello@genuflow.com"
            className="text-accent hover:text-accent-hover"
          >
            hello@genuflow.com
          </a>
        </li>
        <li>Postal: Genuflow, Wilmington, Delaware, United States.</li>
      </UL>
    </LegalShell>
  );
}
