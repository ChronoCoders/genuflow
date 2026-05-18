"use client";

import { useState } from "react";

import { Card } from "@/components/card";
import {
  type BillingResponse,
  type Plan,
  createCheckoutSession,
} from "@/lib/api";

const PLAN_LABEL: Record<Plan, string> = {
  atelier: "Atelier",
  maison: "Maison",
  couture: "Couture",
};

const PLAN_DESCRIPTION: Record<Plan, string> = {
  atelier: "Independent ateliers and emerging houses. Up to 500 products.",
  maison: "Established houses and growing brands. Up to 10,000 products.",
  couture: "Enterprise & multi-brand groups. Unlimited.",
};

const PLAN_PRICE: Record<Plan, string> = {
  atelier: "€0.40 / product",
  maison: "€0.28 / product",
  couture: "Custom",
};

interface PanelProps {
  data: BillingResponse;
  searchParams: { session?: string; placeholder?: string; plan?: string };
}

export function BillingPanel({ data, searchParams }: PanelProps) {
  const [loading, setLoading] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const limit = data.product_limit;
  const used = data.product_count;
  const pct = limit == null ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const nearLimit = limit != null && used / limit >= 0.85;

  async function upgrade(plan: Exclude<Plan, "atelier">) {
    setLoading(plan);
    setError(null);
    try {
      const { url } = await createCheckoutSession(plan);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout");
      setLoading(null);
    }
  }

  return (
    <>
      {searchParams.session === "success" ? (
        <Card className="mb-6 border-accent/40 bg-accent/5 text-sm text-accent">
          Subscription updated. Your new plan is reflected below.
        </Card>
      ) : null}
      {searchParams.session === "cancel" ? (
        <Card className="mb-6 text-sm text-ink-300">
          Checkout was cancelled. Your plan was not changed.
        </Card>
      ) : null}
      {searchParams.placeholder === "1" ? (
        <Card className="mb-6 text-sm text-ink-300">
          Stripe is not configured on this environment, so the checkout
          flow returned a placeholder URL. The plan was not actually
          changed — set <code className="font-mono text-xs">STRIPE_SECRET_KEY</code> on the API to enable
          real upgrades.
        </Card>
      ) : null}
      {!data.stripe_configured ? (
        <Card className="mb-6 border-ink-700 text-sm text-ink-400">
          Billing is in placeholder mode. Upgrades will round-trip the
          flow but no Stripe Checkout session is created until the
          server is configured.
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <div className="text-[10px] uppercase tracking-[0.24em] text-ink-500">
            Current plan
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-serif text-3xl text-ink-50">
              {PLAN_LABEL[data.plan]}
            </span>
            <StatusPill status={data.status} />
          </div>
          <p className="mt-2 text-xs text-ink-400">
            {PLAN_DESCRIPTION[data.plan]}
          </p>
        </Card>

        <Card>
          <div className="text-[10px] uppercase tracking-[0.24em] text-ink-500">
            Products
          </div>
          <div className="mt-3 font-serif text-3xl text-ink-50">
            {used.toLocaleString()}
            <span className="ml-2 text-base text-ink-500">
              / {limit == null ? "∞" : limit.toLocaleString()}
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-ink-800">
            <div
              className={`h-full transition-all ${
                nearLimit ? "bg-red-400" : "bg-accent"
              }`}
              style={{ width: `${limit == null ? 0 : pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-ink-400">
            {limit == null
              ? "Unlimited registrations on your plan."
              : `${(limit - used).toLocaleString()} registrations remaining.`}
          </p>
        </Card>

        <Card>
          <div className="text-[10px] uppercase tracking-[0.24em] text-ink-500">
            Billing period
          </div>
          <div className="mt-3 font-serif text-2xl text-ink-50">
            {data.current_period_end
              ? new Date(data.current_period_end).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })
              : "—"}
          </div>
          <p className="mt-2 text-xs text-ink-400">
            {data.current_period_end
              ? "Next renewal."
              : "No active subscription with Stripe yet."}
          </p>
        </Card>
      </div>

      {error ? (
        <Card className="mt-6 text-sm text-red-300">{error}</Card>
      ) : null}

      <div className="mt-10">
        <h2 className="font-serif text-xl text-ink-50">Plans</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {(["atelier", "maison", "couture"] as const).map((plan) => {
            const current = plan === data.plan;
            return (
              <div
                key={plan}
                className={`flex flex-col rounded-xl border p-6 ${
                  current
                    ? "border-accent/40 bg-accent/5"
                    : "border-white/5 bg-ink-900/40"
                }`}
              >
                <div className="text-[10px] uppercase tracking-[0.28em] text-ink-500">
                  {PLAN_LABEL[plan]}
                </div>
                <div className="mt-4 font-serif text-2xl text-ink-50">
                  {PLAN_PRICE[plan]}
                </div>
                <p className="mt-2 text-xs text-ink-400">
                  {PLAN_DESCRIPTION[plan]}
                </p>
                <div className="mt-auto pt-6">
                  {current ? (
                    <button
                      disabled
                      className="block w-full rounded-md border border-ink-700 px-4 py-2 text-sm text-ink-400"
                    >
                      Current plan
                    </button>
                  ) : plan === "atelier" ? (
                    <button
                      disabled
                      className="block w-full rounded-md border border-ink-700 px-4 py-2 text-sm text-ink-500"
                    >
                      Default plan
                    </button>
                  ) : (
                    <button
                      onClick={() => upgrade(plan)}
                      disabled={loading !== null}
                      className="block w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-ink-50 transition hover:bg-accent-hover disabled:opacity-60"
                    >
                      {loading === plan ? "Starting checkout…" : "Upgrade"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function StatusPill({ status }: { status: BillingResponse["status"] }) {
  const tone =
    status === "active" || status === "trialing"
      ? "border-accent/30 bg-accent/10 text-accent"
      : status === "past_due"
        ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-200"
        : "border-ink-700 bg-ink-800 text-ink-400";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${tone}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
