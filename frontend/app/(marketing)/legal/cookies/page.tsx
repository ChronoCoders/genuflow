import { H2, LegalShell, Note, UL } from "@/components/marketing/legal-shell";

export const metadata = {
  title: "Cookie policy — Genuflow",
  description:
    "Which cookies Genuflow uses, what they do, and how to disable them.",
};

export default function CookiePolicy() {
  return (
    <LegalShell
      eyebrow="Cookies"
      title="Cookie policy"
      effectiveDate="May 18, 2026"
    >
      <p>
        This page explains the cookies and similar storage mechanisms
        used on the Genuflow website (genuflow.com), the dashboard,
        and public verification pages. We try to keep this list short
        on purpose — every cookie listed here exists because
        something concrete on the platform requires it.
      </p>

      <H2>1. What is a cookie</H2>
      <p>
        A cookie is a small text file that a website asks your
        browser to store. The browser sends the cookie back on every
        subsequent request to the same origin. Cookies allow a site
        to recognise a returning visitor without storing that
        information on the server side of the connection.
      </p>
      <p>
        For the purpose of this policy, &ldquo;cookies&rdquo; also
        covers analogous storage mechanisms such as
        <code className="font-mono text-sm text-ink-100"> localStorage</code>{" "}
        and{" "}
        <code className="font-mono text-sm text-ink-100">sessionStorage</code>,
        where used.
      </p>

      <H2>2. Cookies we use</H2>

      <Note>
        Genuflow does not use marketing cookies, behavioural
        advertising cookies, or third-party tracking pixels. We do not
        sell or share cookie data with third parties.
      </Note>

      <div className="mt-6 overflow-x-auto rounded-lg border border-white/5">
        <table className="w-full text-sm">
          <thead className="bg-ink-950 text-[10px] uppercase tracking-wider text-ink-500">
            <tr>
              <th className="px-4 py-3 text-left">Cookie</th>
              <th className="px-4 py-3 text-left">Purpose</th>
              <th className="px-4 py-3 text-left">Lifetime</th>
              <th className="px-4 py-3 text-left">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-ink-200">
            <tr>
              <td className="px-4 py-3 font-mono text-xs text-ink-100">
                gf_session
              </td>
              <td className="px-4 py-3">
                Holds your dashboard sign-in session as an HttpOnly
                JWT. Without it, the dashboard cannot tell who you
                are.
              </td>
              <td className="px-4 py-3">24 hours</td>
              <td className="px-4 py-3">Strictly necessary</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs text-ink-100">
                __cf_bm
              </td>
              <td className="px-4 py-3">
                Cloudflare bot-management cookie used by our edge
                provider to distinguish humans from automated traffic
                at the network layer.
              </td>
              <td className="px-4 py-3">30 minutes</td>
              <td className="px-4 py-3">Strictly necessary</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs text-ink-100">
                cf_clearance
              </td>
              <td className="px-4 py-3">
                Cloudflare challenge clearance — only set when a
                visitor has solved a security challenge.
              </td>
              <td className="px-4 py-3">30 minutes to 1 year</td>
              <td className="px-4 py-3">Strictly necessary</td>
            </tr>
          </tbody>
        </table>
      </div>

      <H2>3. What we do not use</H2>
      <UL>
        <li>
          <strong>Analytics cookies.</strong> We do not currently
          operate a website-analytics platform. Operational
          information about API usage is collected from our own
          server-side logs, not from cookies in your browser.
        </li>
        <li>
          <strong>Advertising cookies.</strong> We do not run
          behavioural advertising. We do not retarget visitors.
        </li>
        <li>
          <strong>Third-party tracking pixels.</strong> The marketing
          site has no Facebook pixel, no LinkedIn Insight Tag, no
          Google Tag Manager, no TikTok pixel, and no equivalent.
        </li>
      </UL>
      <p>
        If we add an analytics cookie in the future, we will update
        this policy and obtain consent where required by your
        jurisdiction. We currently believe server-side measurement is
        sufficient for our operational needs.
      </p>

      <H2>4. How to disable cookies</H2>
      <p>
        You can refuse or disable cookies at any time using your
        browser's settings. Note that disabling the strictly
        necessary cookies listed above will prevent the Genuflow
        dashboard from functioning — you will be unable to sign in.
        The public marketing site and verification pages remain
        readable without cookies.
      </p>
      <UL>
        <li>
          <a
            href="https://support.google.com/chrome/answer/95647"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover"
          >
            Chrome cookie controls
          </a>
        </li>
        <li>
          <a
            href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover"
          >
            Firefox cookie controls
          </a>
        </li>
        <li>
          <a
            href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover"
          >
            Safari cookie controls
          </a>
        </li>
        <li>
          <a
            href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover"
          >
            Edge cookie controls
          </a>
        </li>
      </UL>

      <H2>5. Do Not Track</H2>
      <p>
        Genuflow does not currently respond to the Do Not Track
        (&ldquo;DNT&rdquo;) header — but only because, in our current
        configuration, there is nothing meaningful for DNT to
        suppress. We do not set tracking cookies, regardless of
        whether DNT is present.
      </p>

      <H2>6. Changes to this policy</H2>
      <p>
        We will update this policy if the cookies we set change.
        Material changes will be reflected in the effective date at
        the top of this page. For consent-required cookies introduced
        in the future, we will obtain affirmative opt-in before
        setting them.
      </p>

      <H2>7. Contact</H2>
      <p>
        Questions about this policy can be sent to{" "}
        <a
          href="mailto:dpo@genuflow.com"
          className="text-accent hover:text-accent-hover"
        >
          dpo@genuflow.com
        </a>
        .
      </p>
    </LegalShell>
  );
}
