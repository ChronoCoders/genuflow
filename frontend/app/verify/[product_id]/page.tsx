import { notFound } from "next/navigation";

import { ApiError, getVerify, type VerifyResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { product_id: string };
}

async function load(productId: string): Promise<VerifyResponse | null> {
  try {
    return await getVerify(productId);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export default async function VerifyPage({ params }: PageProps) {
  const data = await load(params.product_id);
  if (!data) notFound();

  const anchor = data.latest_anchor;
  const anchored = anchor?.status === "confirmed";

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 py-10">
      <header className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-500">
          Verified by Genuflow
        </p>
        <h1 className="mt-3 font-serif text-3xl text-ink-50">
          {data.product.name}
        </h1>
        <p className="mt-2 text-sm text-ink-400">by {data.brand.name}</p>
      </header>

      <section
        className={`mb-8 rounded-lg border p-4 text-center ${
          anchored
            ? "border-accent/40 bg-accent/5"
            : "border-ink-700 bg-ink-900"
        }`}
      >
        <div className="text-xs uppercase tracking-wider text-ink-500">
          {anchored ? "Anchored on Base" : "Awaiting on-chain anchor"}
        </div>
        {anchor ? (
          <>
            <div className="mt-2 text-sm text-ink-200">
              {anchored
                ? `Block ${anchor.block_number ?? "?"}`
                : "Pending confirmation"}
            </div>
            {anchor.tx_hash ? (
              <a
                href={`https://basescan.org/tx/${anchor.tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block break-all font-mono text-xs text-accent hover:text-accent-hover"
              >
                {anchor.tx_hash}
              </a>
            ) : null}
          </>
        ) : (
          <div className="mt-2 text-sm text-ink-400">
            No anchor recorded yet.
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-serif text-xl text-ink-50">Provenance</h2>

        {data.events.length === 0 ? (
          <p className="rounded-lg border border-dashed border-ink-800 p-6 text-center text-sm text-ink-400">
            No events recorded.
          </p>
        ) : (
          <ol className="relative space-y-5 border-l border-ink-800 pl-6">
            {data.events.map((event) => (
              <li key={event.id} className="relative">
                <span
                  className={`absolute -left-[33px] top-1 h-3 w-3 rounded-full border-2 ${
                    event.anchor_batch_id
                      ? "border-accent bg-accent"
                      : "border-ink-600 bg-ink-900"
                  }`}
                />
                <div className="text-sm font-medium text-ink-50">
                  {event.event_type}
                </div>
                <div className="mt-1 text-xs text-ink-500">
                  {new Date(event.recorded_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <footer className="mt-10 text-center text-xs text-ink-600">
        Product ID
        <div className="mt-1 break-all font-mono">{data.product.id}</div>
      </footer>
    </main>
  );
}
