import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Table, TBody, TD, TH, THead, TR } from "@/components/table";
import { type BrandAnchorView, listAnchors } from "@/lib/api";
import { sessionCookieHeader } from "@/lib/server-api";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

async function load(): Promise<BrandAnchorView[] | { error: string }> {
  try {
    return await listAnchors({ limit: PAGE_SIZE }, sessionCookieHeader());
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to load" };
  }
}

function explorerUrl(txHash: string) {
  return `https://basescan.org/tx/${txHash}`;
}

export default async function AnchorsPage() {
  const data = await load();

  if (!Array.isArray(data)) {
    return (
      <>
        <PageHeader title="Anchors" />
        <Card className="text-sm text-red-300">{data.error}</Card>
      </>
    );
  }

  if (data.length === 0) {
    return (
      <>
        <PageHeader title="Anchors" />
        <EmptyState
          title="No anchors yet"
          body="Anchors are batched and submitted to Base every 2 hours."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Anchors"
        subtitle="Each batch commits a hash of all events anchored in that run."
      />

      <Table>
        <THead>
          <TR>
            <TH>Date</TH>
            <TH>Status</TH>
            <TH>Block</TH>
            <TH>Tx hash</TH>
            <TH>Brand hash</TH>
          </TR>
        </THead>
        <TBody>
          {data.map((batch) => (
            <TR key={batch.id}>
              <TD>{new Date(batch.anchored_at).toLocaleString()}</TD>
              <TD>
                {batch.status === "confirmed" ? (
                  <span className="text-accent">confirmed</span>
                ) : (
                  <span className="text-ink-400">pending</span>
                )}
              </TD>
              <TD className="font-mono text-xs">
                {batch.block_number ?? "—"}
              </TD>
              <TD>
                {batch.tx_hash ? (
                  <a
                    href={explorerUrl(batch.tx_hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-accent hover:text-accent-hover"
                  >
                    {batch.tx_hash.slice(0, 10)}…
                  </a>
                ) : (
                  <span className="text-ink-500">—</span>
                )}
              </TD>
              <TD className="font-mono text-xs text-ink-500">
                {batch.brand_hash.slice(0, 12)}…
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </>
  );
}
