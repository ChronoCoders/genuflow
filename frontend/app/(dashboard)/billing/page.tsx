import { BillingPanel } from "./panel";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { type BillingResponse, getBilling } from "@/lib/api";
import { sessionCookieHeader } from "@/lib/server-api";

export const dynamic = "force-dynamic";

async function load(): Promise<BillingResponse | { error: string }> {
  try {
    return await getBilling(sessionCookieHeader());
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to load" };
  }
}

interface PageProps {
  searchParams: { session?: string; placeholder?: string; plan?: string };
}

export default async function BillingPage({ searchParams }: PageProps) {
  const data = await load();

  if ("error" in data) {
    return (
      <>
        <PageHeader title="Billing" />
        <Card className="text-sm text-red-300">{data.error}</Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Billing"
        subtitle="Your plan, your usage, and the limit that governs new product registrations."
      />
      <BillingPanel data={data} searchParams={searchParams} />
    </>
  );
}
