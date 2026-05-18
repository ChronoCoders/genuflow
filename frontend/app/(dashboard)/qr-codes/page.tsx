import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { listProducts, type Product } from "@/lib/api";
import { sessionCookieHeader } from "@/lib/server-api";

export const dynamic = "force-dynamic";

async function load(): Promise<Product[] | { error: string }> {
  try {
    return await listProducts({ limit: 200 }, sessionCookieHeader());
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to load" };
  }
}

export default async function QrCodesPage() {
  const data = await load();

  if (!Array.isArray(data)) {
    return (
      <>
        <PageHeader title="QR codes" />
        <Card className="text-sm text-red-300">{data.error}</Card>
      </>
    );
  }

  if (data.length === 0) {
    return (
      <>
        <PageHeader title="QR codes" />
        <EmptyState
          title="No products yet"
          body="Register a product first; its QR code is generated automatically."
          action={<Button href="/products/new">Register product</Button>}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="QR codes"
        subtitle="Each QR encodes the public verification URL for that product."
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((p) => {
          const qrUrl = `/api/v1/products/${p.id}/qr`;
          const downloadName = `genuflow-${p.id}.png`;
          return (
            <Card key={p.id}>
              <div className="font-medium text-ink-50">{p.name}</div>
              {p.external_ref ? (
                <div className="mt-1 text-xs text-ink-500">
                  Ref: {p.external_ref}
                </div>
              ) : null}

              <div className="mt-4 flex aspect-square items-center justify-center rounded-md bg-ink-50 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrUrl}
                  alt={`QR code for ${p.name}`}
                  className="h-full w-full"
                />
              </div>

              <div className="mt-4 flex justify-end">
                <a
                  href={qrUrl}
                  download={downloadName}
                  className="inline-flex items-center justify-center rounded-md border border-ink-700 bg-ink-800 px-3 py-1.5 text-xs text-ink-200 transition hover:bg-ink-700"
                >
                  Download PNG
                </a>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
