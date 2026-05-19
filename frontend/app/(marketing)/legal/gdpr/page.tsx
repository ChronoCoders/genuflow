import { H2, H3, LegalShell, Note, UL } from "@/components/marketing/legal-shell";

export const metadata = {
  title: "GDPR compliance — Genuflow",
  description:
    "Genuflow's compliance statement under the EU General Data Protection Regulation, including lawful basis, transfer mechanism, and data subject rights.",
};

export default function GDPRCompliance() {
  return (
    <LegalShell
      eyebrow="GDPR"
      title="GDPR compliance"
      effectiveDate="May 18, 2026"
    >
      <p>
        This page sets out how Genuflow complies with Regulation (EU)
        2016/679 (the &ldquo;General Data Protection Regulation&rdquo;
        or &ldquo;GDPR&rdquo;), as well as the equivalent regimes in
        the United Kingdom (UK GDPR), Switzerland (revFADP), and the
        European Economic Area more broadly. It is intended to be
        read alongside the{" "}
        <a
          href="/legal/privacy"
          className="text-accent hover:text-accent-hover"
        >
          Privacy Policy
        </a>
        , which covers most operational detail.
      </p>

      <H2>1. Data controller identity</H2>
      <p>
        For personal data of Genuflow account users (the people who
        register and operate a brand on our platform), Genuflow is
        the data controller as defined in Article 4(7) of the GDPR.
      </p>
      <p>
        For end-customer personal data submitted to the Service by a
        brand (for example, a new owner's email recorded against an
        ownership transfer event), the brand is the data controller
        and Genuflow is the data processor. The terms of that
        processor relationship are set out in our Data Processing
        Agreement (see section 6 below).
      </p>

      <H2>2. Lawful basis for processing</H2>
      <p>
        Article 6 of the GDPR requires every processing activity to
        rest on a specified lawful basis. We rely on the following:
      </p>
      <UL>
        <li>
          <strong>Performance of a contract</strong> (Art. 6(1)(b)) —
          for processing necessary to provide the Service to you
          under our Terms of Service. This covers your account data,
          product and event data, billing, and dashboard operation.
        </li>
        <li>
          <strong>Legitimate interests</strong> (Art. 6(1)(f)) — for
          processing that supports the operation, security, and
          improvement of the Service in a way that does not override
          your fundamental rights. This covers our server logs (90
          days), abuse detection, and platform-security telemetry.
          You have the right to object to processing based on
          legitimate interests; see section 4 below.
        </li>
        <li>
          <strong>Legal obligation</strong> (Art. 6(1)(c)) — for
          processing necessary to comply with United States tax,
          accounting, and anti-money-laundering laws (in particular,
          retention of billing records for seven years).
        </li>
        <li>
          <strong>Consent</strong> (Art. 6(1)(a)) — where applicable
          for any future processing that does not fit the bases
          above. We currently do not run any consent-based processing
          activities.
        </li>
      </UL>

      <H2>3. International data transfers</H2>
      <p>
        Genuflow is established in the United States. By using the
        Service, you understand that personal data may be transferred
        to and processed in the United States and, where our
        subprocessors operate, in other jurisdictions outside the
        European Economic Area.
      </p>
      <p>
        For transfers of EEA-resident personal data outside the EEA,
        we rely on the European Commission's{" "}
        <strong>Standard Contractual Clauses</strong> (Commission
        Implementing Decision (EU) 2021/914, Module Two for
        controller-to-processor transfers and Module Three for
        processor-to-subprocessor transfers, as appropriate). We
        supplement the SCCs with the following measures:
      </p>
      <UL>
        <li>
          Transport encryption (TLS 1.2 or higher) for all data in
          transit, with HSTS enforced at the edge.
        </li>
        <li>
          At-rest encryption for primary databases, backups, and
          object storage.
        </li>
        <li>
          Public-cloud regional preferences: EU customers' primary
          data resides in our EU-West region by default, with the
          option to migrate at no cost.
        </li>
        <li>
          A documented internal process for handling government data
          requests, including a commitment to challenge facially
          overbroad requests and to notify customers where lawfully
          permitted.
        </li>
      </UL>
      <p>
        A copy of the relevant Standard Contractual Clauses and any
        Transfer Impact Assessment is available on written request.
      </p>

      <H2>4. Your rights as a data subject</H2>
      <p>
        Articles 15 through 22 of the GDPR grant you specific rights
        in respect of your personal data. Genuflow honours all of
        them.
      </p>

      <H3>4.1 Access (Art. 15)</H3>
      <p>
        You may request a copy of the personal data we hold about
        you, together with information about how it is processed,
        the recipients with whom it is shared, the retention period
        applied, and the safeguards in place for any international
        transfers.
      </p>

      <H3>4.2 Rectification (Art. 16)</H3>
      <p>
        You may request that we correct inaccurate personal data we
        hold about you, or that we complete data that is incomplete
        for the purposes of the processing.
      </p>

      <H3>4.3 Erasure (Art. 17)</H3>
      <p>
        You may request that we delete personal data we hold about
        you. We will comply unless we are required to retain the data
        for compliance with a legal obligation (e.g. seven-year
        retention of billing records) or for the establishment,
        exercise, or defence of legal claims. On-chain anchored
        hashes cannot be deleted by the nature of the blockchain — see
        the Privacy Policy for the full explanation.
      </p>

      <H3>4.4 Restriction (Art. 18)</H3>
      <p>
        You may request that we restrict the processing of your
        personal data in defined circumstances, including while we
        verify the accuracy of contested data or while we evaluate an
        objection under Art. 21.
      </p>

      <H3>4.5 Data portability (Art. 20)</H3>
      <p>
        You may request your personal data in a structured,
        commonly-used, machine-readable format, and have it
        transmitted to another controller. Genuflow's product and
        event data is already exportable on demand through the API
        as signed JSON; we will provide additional data in CSV or
        JSON format on request.
      </p>

      <H3>4.6 Objection (Art. 21)</H3>
      <p>
        You may object at any time to processing of your personal
        data based on legitimate interests. We will cease the
        processing unless we can demonstrate compelling legitimate
        grounds that override your rights, or where the processing is
        necessary for the establishment, exercise, or defence of
        legal claims.
      </p>

      <H3>4.7 Automated decision-making (Art. 22)</H3>
      <p>
        Genuflow does not currently make decisions based solely on
        automated processing that produces legal effects concerning
        you or similarly significantly affects you. If we ever
        introduce such processing, we will inform you and obtain the
        appropriate basis in advance.
      </p>

      <Note>
        To exercise any of these rights, write to{" "}
        <a
          href="mailto:dpo@genuflow.com"
          className="text-accent hover:text-accent-hover"
        >
          dpo@genuflow.com
        </a>
        . We will respond within one month and may extend this period
        by up to two further months for complex requests, in which
        case we will inform you within the first month and explain
        the reasons for the extension.
      </Note>

      <H2>5. Right to lodge a complaint</H2>
      <p>
        Without prejudice to any other administrative or judicial
        remedy, you have the right to lodge a complaint with a
        supervisory authority — in particular in the Member State of
        your habitual residence, place of work, or place of the
        alleged infringement.
      </p>
      <p>
        We would, however, appreciate the chance to address your
        concerns directly first. A list of EEA supervisory
        authorities is available at{" "}
        <a
          href="https://edpb.europa.eu/about-edpb/about-edpb/members_en"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-accent-hover"
        >
          edpb.europa.eu
        </a>
        .
      </p>

      <H2>6. Data processing agreement</H2>
      <p>
        For brands that act as data controller in respect of
        end-customer data processed through the Service, Genuflow
        offers a standard{" "}
        <strong>Data Processing Agreement</strong> (DPA)
        incorporating the SCCs and a current subprocessor list. The
        DPA is available on request and is incorporated by reference
        into the Terms of Service when executed.
      </p>
      <p>
        For multi-brand groups, multi-tenant audit clauses, and
        custom subprocessor restrictions, please contact{" "}
        <a
          href="mailto:legal@genuflow.com"
          className="text-accent hover:text-accent-hover"
        >
          legal@genuflow.com
        </a>
        .
      </p>

      <H2>7. Data Protection Officer</H2>
      <p>
        Genuflow has appointed a Data Protection Officer responsible
        for monitoring our compliance with the GDPR and serving as
        the contact point for data subjects and supervisory
        authorities.
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
          Postal: Genuflow, Data Protection Officer, Wilmington,
          Delaware, United States.
        </li>
      </UL>

      <H2>8. Records of processing</H2>
      <p>
        We maintain internal records of processing activities under
        Article 30 of the GDPR, covering the categories of personal
        data processed, the purposes of processing, the categories of
        recipients, transfer mechanisms, retention periods, and the
        security measures applied. These records are available to
        supervisory authorities on request.
      </p>

      <H2>9. Security and breach notification</H2>
      <p>
        Our technical and organisational measures are described in
        section 8 of the Privacy Policy. In the event of a personal
        data breach likely to result in a risk to the rights and
        freedoms of natural persons, we will notify the relevant
        supervisory authority within 72 hours of becoming aware of
        the breach (Art. 33) and will notify affected data subjects
        without undue delay where the breach is likely to result in a
        high risk (Art. 34).
      </p>

      <H2>10. Changes to this statement</H2>
      <p>
        We will keep this statement up to date as the Service evolves
        and as guidance from the European Data Protection Board
        develops. Material changes will be reflected in the effective
        date at the top of this page and, where they affect data
        subject rights, communicated by email to active brand
        owners.
      </p>
    </LegalShell>
  );
}
