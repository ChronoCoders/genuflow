import { notFound } from "next/navigation";

import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import {
  ApiError,
  getProduct,
  listProductEvents,
  type Product,
  type ProvenanceEvent,
} from "@/lib/api";
import { sessionCookieHeader } from "@/lib/server-api";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

type LoadResult =
  | { ok: true; product: Product; events: ProvenanceEvent[] }
  | { ok: false; error: string; status?: number };

async function load(id: string): Promise<LoadResult> {
  const cookie = sessionCookieHeader();
  try {
    const product = await getProduct(id, cookie);
    let events: ProvenanceEvent[] = [];
    try {
      events = await listProductEvents(id, cookie);
    } catch {
      // Events listing endpoint may not exist yet; render with empty timeline.
    }
    return { ok: true, product, events };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, error: err.message, status: err.status };
    }
    return { ok: false, error: "Failed to load product" };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const result = await load(params.id);

  if (!result.ok) {
    if (result.status === 404) notFound();
    return (
      <>
        <PageHeader title="Product" />
        <Card className="text-sm text-red-300">{result.error}</Card>
      </>
    );
  }

  const { product, events } = result;
  const meta = product.metadata as Record<string, unknown> | null;

  return (
    <>
      <PageHeader
        title={product.name}
        subtitle={
          product.external_ref ? `Ref: ${product.external_ref}` : undefined
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="text-xs uppercase tracking-wider text-ink-500">
            Identity
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-ink-500">Product ID</dt>
              <dd className="mt-1 break-all font-mono text-xs text-ink-100">
                {product.id}
              </dd>
            </div>
            <div>
              <dt className="text-ink-500">Created</dt>
              <dd className="mt-1 text-ink-100">
                {new Date(product.created_at).toLocaleString()}
              </dd>
            </div>
            {meta ? (
              <div>
                <dt className="text-ink-500">Metadata</dt>
                <dd className="mt-1">
                  <pre className="overflow-x-auto rounded-md bg-ink-950 p-3 font-mono text-xs text-ink-200">
                    {JSON.stringify(meta, null, 2)}
                  </pre>
                </dd>
              </div>
            ) : null}
          </dl>
        </Card>

        <div className="lg:col-span-2">
          <h2 className="mb-4 font-serif text-xl text-ink-50">Provenance</h2>

          {events.length === 0 ? (
            <EmptyState
              title="No events recorded yet"
              body="Events are added via the /v1/products/:id/events endpoint."
            />
          ) : (
            <ol className="relative space-y-6 border-l border-ink-800 pl-6">
              {events.map((event) => (
                <li key={event.id} className="relative">
                  <span
                    className={`absolute -left-[33px] top-1 h-3 w-3 rounded-full border-2 ${
                      event.anchor_batch_id
                        ? "border-accent bg-accent"
                        : "border-ink-600 bg-ink-900"
                    }`}
                  />
                  <div className="font-medium text-ink-50">
                    {event.event_type}
                  </div>
                  <div className="mt-1 text-xs text-ink-500">
                    {new Date(event.recorded_at).toLocaleString()}{" "}
                    {event.anchor_batch_id ? (
                      <span className="ml-2 text-accent">anchored</span>
                    ) : (
                      <span className="ml-2 text-ink-500">pending</span>
                    )}
                  </div>
                  {event.detail ? (
                    <pre className="mt-2 overflow-x-auto rounded-md bg-ink-950 p-3 font-mono text-xs text-ink-300">
                      {JSON.stringify(event.detail, null, 2)}
                    </pre>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </>
  );
}
