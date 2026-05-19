"use client";

import { useState } from "react";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { ApiError, setCustomDomain } from "@/lib/api";

const CNAME_TARGET = "verify.genuflow.com";

interface DomainSectionProps {
  initialDomain: string | null;
}

export function DomainSection({ initialDomain }: DomainSectionProps) {
  const [current, setCurrent] = useState<string | null>(initialDomain);
  const [draft, setDraft] = useState<string>(initialDomain ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function save() {
    setError(null);
    setSubmitting(true);
    try {
      const next = draft.trim() || null;
      const brand = await setCustomDomain(next);
      setCurrent(brand.custom_domain);
      setDraft(brand.custom_domain ?? "");
      setSavedAt(Date.now());
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Failed to save domain",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function clear() {
    if (
      !confirm(
        "Remove the custom verification domain? Verification will revert to the default Genuflow URL.",
      )
    ) {
      return;
    }
    setDraft("");
    setError(null);
    setSubmitting(true);
    try {
      await setCustomDomain(null);
      setCurrent(null);
      setSavedAt(Date.now());
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Failed to clear domain",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const dirty = draft.trim() !== (current ?? "");

  return (
    <Card>
      <div className="text-xs uppercase tracking-wider text-ink-500">
        Custom verification domain
      </div>
      <p className="mt-3 text-sm text-ink-300">
        Serve <code className="font-mono text-xs text-ink-100">/verify/...</code>{" "}
        pages from your own host instead of the default Genuflow URL. Your
        QR codes are unchanged — they continue to resolve, and the page
        responds with your brand chrome under either origin.
      </p>

      {current ? (
        <div className="mt-5 rounded-md border border-accent/30 bg-accent/5 p-4">
          <div className="text-[10px] uppercase tracking-wider text-accent">
            Active
          </div>
          <div className="mt-1 font-mono text-sm text-ink-100">{current}</div>
        </div>
      ) : null}

      <div className="mt-5">
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-wider text-ink-500">
            Domain
          </span>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="verify.yourbrand.com"
            spellCheck={false}
            autoCapitalize="off"
            className="block w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 font-mono text-sm text-ink-50 placeholder:text-ink-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </label>
        <p className="mt-2 text-xs text-ink-500">
          Hostname only — no <code>https://</code>, no path, no port.
        </p>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-red-300">{error}</p>
      ) : savedAt ? (
        <p className="mt-3 text-sm text-accent">Saved.</p>
      ) : null}

      <div className="mt-5 flex justify-end gap-2">
        {current ? (
          <Button variant="secondary" onClick={clear} disabled={submitting}>
            Remove
          </Button>
        ) : null}
        <Button
          onClick={save}
          disabled={submitting || !dirty}
          className={!dirty ? "opacity-60" : ""}
        >
          {submitting ? "Saving…" : "Save"}
        </Button>
      </div>

      <div className="mt-8 border-t border-ink-800 pt-6">
        <div className="text-[10px] uppercase tracking-[0.24em] text-ink-500">
          DNS setup
        </div>
        <ol className="mt-4 space-y-3 text-sm text-ink-300">
          <li>
            <span className="text-ink-100">1. Add a CNAME</span> at your DNS
            provider, pointing your chosen hostname (e.g.{" "}
            <code className="font-mono text-xs text-ink-100">
              verify.yourbrand.com
            </code>
            ) to:
            <div className="mt-2 rounded-md border border-ink-700 bg-ink-950 p-3 font-mono text-xs text-accent">
              {CNAME_TARGET}
            </div>
          </li>
          <li>
            <span className="text-ink-100">
              2. Set the domain above and Save.
            </span>{" "}
            Our edge resolves the host header to your brand once DNS
            propagates.
          </li>
          <li>
            <span className="text-ink-100">3. TLS is automatic.</span>{" "}
            Cloudflare provisions a certificate at the edge as soon as the
            CNAME is observed. No certificate ever leaves your DNS
            provider.
          </li>
        </ol>
        <p className="mt-4 text-xs text-ink-500">
          Propagation is usually under five minutes after the CNAME is
          live. If verification still fails after fifteen minutes, write
          to{" "}
          <a
            href="mailto:hello@genuflow.com"
            className="text-accent hover:text-accent-hover"
          >
            hello@genuflow.com
          </a>
          .
        </p>
      </div>
    </Card>
  );
}
