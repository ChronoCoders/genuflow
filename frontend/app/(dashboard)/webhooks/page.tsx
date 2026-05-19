import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import {
  type WebhookEndpoint,
  listWebhookEndpoints,
} from "@/lib/api";
import { sessionCookieHeader } from "@/lib/server-api";

import { WebhooksPanel } from "./panel";

export const dynamic = "force-dynamic";

async function load(): Promise<WebhookEndpoint[] | { error: string }> {
  try {
    return await listWebhookEndpoints(sessionCookieHeader());
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to load" };
  }
}

export default async function WebhooksPage() {
  const data = await load();

  if (!Array.isArray(data)) {
    return (
      <>
        <PageHeader title="Webhooks" />
        <Card className="text-sm text-red-300">{data.error}</Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Webhooks"
        subtitle="Push provenance events into your own systems as they happen. Signed with HMAC-SHA256, retried with backoff."
      />
      <WebhooksPanel initial={data} />
    </>
  );
}
