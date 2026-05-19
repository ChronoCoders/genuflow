import Link from "next/link";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Table, TBody, TD, TH, THead, TR } from "@/components/table";
import { listProducts, type Product } from "@/lib/api";
import { sessionCookieHeader } from "@/lib/server-api";

import { ImportButton } from "./import-modal";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

interface SearchParams {
  page?: string;
}

async function loadProducts(
  page: number,
): Promise<{ items: Product[]; page: number } | { error: string }> {
  try {
    const items = await listProducts(
      { limit: PAGE_SIZE, offset: page * PAGE_SIZE },
      sessionCookieHeader(),
    );
    return { items, page };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to load" };
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page = Math.max(0, Number.parseInt(searchParams.page ?? "0", 10) || 0);
  const result = await loadProducts(page);

  if ("error" in result) {
    return (
      <>
        <PageHeader title="Products" />
        <Card className="text-sm text-red-300">{result.error}</Card>
      </>
    );
  }

  const action = (
    <div className="flex gap-2">
      <ImportButton />
      <Button href="/products/new">Register product</Button>
    </div>
  );

  if (result.items.length === 0 && page === 0) {
    return (
      <>
        <PageHeader title="Products" action={action} />
        <EmptyState
          title="No products yet"
          body="Register your first product to start recording provenance."
          action={
            <div className="flex justify-center gap-2">
              <ImportButton />
              <Button href="/products/new">Register product</Button>
            </div>
          }
        />
      </>
    );
  }

  const prevDisabled = page === 0;
  const nextDisabled = result.items.length < PAGE_SIZE;

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`Page ${page + 1}`}
        action={action}
      />

      <Table>
        <THead>
          <TR>
            <TH>Name</TH>
            <TH>External ref</TH>
            <TH>ID</TH>
            <TH>Created</TH>
          </TR>
        </THead>
        <TBody>
          {result.items.map((p) => (
            <TR key={p.id}>
              <TD className="font-medium text-ink-50">
                <Link
                  href={`/products/${p.id}`}
                  className="hover:text-accent"
                >
                  {p.name}
                </Link>
              </TD>
              <TD>{p.external_ref ?? "—"}</TD>
              <TD className="font-mono text-xs text-ink-500">
                {p.id.slice(0, 8)}…
              </TD>
              <TD>{new Date(p.created_at).toLocaleDateString()}</TD>
            </TR>
          ))}
        </TBody>
      </Table>

      <div className="mt-6 flex items-center justify-end gap-2">
        <Button
          variant="secondary"
          href={prevDisabled ? "/products" : `/products?page=${page - 1}`}
          className={prevDisabled ? "pointer-events-none opacity-40" : ""}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          href={nextDisabled ? "/products" : `/products?page=${page + 1}`}
          className={nextDisabled ? "pointer-events-none opacity-40" : ""}
        >
          Next
        </Button>
      </div>
    </>
  );
}
