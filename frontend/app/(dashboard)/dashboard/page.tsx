import Link from "next/link";

import { Card, Stat } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Table, TBody, TD, TH, THead, TR } from "@/components/table";
import {
  type DashboardMetrics,
  getDashboard,
} from "@/lib/api";
import { sessionCookieHeader } from "@/lib/server-api";

export const dynamic = "force-dynamic";

async function loadMetrics(): Promise<DashboardMetrics | { error: string }> {
  try {
    return await getDashboard(sessionCookieHeader());
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to load" };
  }
}

export default async function DashboardPage() {
  const data = await loadMetrics();

  if ("error" in data) {
    return (
      <>
        <PageHeader title="Overview" />
        <Card className="text-sm text-red-300">{data.error}</Card>
      </>
    );
  }

  const lastAnchorHint = data.last_anchor
    ? data.last_anchor.status === "confirmed"
      ? `block ${data.last_anchor.block_number ?? "?"}`
      : "pending confirmation"
    : "no anchors yet";

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="A live view of products, events, and on-chain anchoring."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Products" value={data.product_count} />
        <Stat label="Events" value={data.event_count} />
        <Stat
          label="Last anchor"
          value={
            data.last_anchor
              ? new Date(data.last_anchor.anchored_at).toLocaleDateString()
              : "—"
          }
          hint={lastAnchorHint}
        />
      </div>

      <div className="mt-10">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-serif text-xl text-ink-50">Recent events</h2>
          <Link
            href="/products"
            className="text-xs text-ink-400 hover:text-ink-100"
          >
            View all products →
          </Link>
        </div>

        {data.recent_events.length === 0 ? (
          <EmptyState
            title="No events yet"
            body="Record your first provenance event from a product page."
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Event</TH>
                <TH>Product</TH>
                <TH>Anchor</TH>
                <TH>When</TH>
              </TR>
            </THead>
            <TBody>
              {data.recent_events.map((event) => (
                <TR key={event.id}>
                  <TD className="font-medium text-ink-50">{event.event_type}</TD>
                  <TD>
                    <Link
                      href={`/products/${event.product_id}`}
                      className="text-accent hover:text-accent-hover"
                    >
                      {event.product_id.slice(0, 8)}…
                    </Link>
                  </TD>
                  <TD>
                    {event.anchor_batch_id ? (
                      <span className="text-ink-200">anchored</span>
                    ) : (
                      <span className="text-ink-500">pending</span>
                    )}
                  </TD>
                  <TD>{new Date(event.recorded_at).toLocaleString()}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </>
  );
}
