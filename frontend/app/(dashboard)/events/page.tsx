"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Table, TBody, TD, TH, THead, TR } from "@/components/table";
import {
  type AnchorStatusFilter,
  type EventType,
  type Product,
  type ProvenanceEvent,
  listEvents,
  listProducts,
} from "@/lib/api";

const PAGE_SIZE = 50;

const EVENT_TYPES: EventType[] = [
  "manufactured",
  "inspected",
  "shipped",
  "sold",
  "transferred",
];

const ANCHOR_OPTIONS: { value: AnchorStatusFilter; label: string }[] = [
  { value: "anchored", label: "Anchored" },
  { value: "unanchored", label: "Pending" },
];

export default function EventsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<ProvenanceEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const [productId, setProductId] = useState<string>("");
  const [eventType, setEventType] = useState<string>("");
  const [anchorStatus, setAnchorStatus] = useState<string>("");

  // Products list once, for the filter dropdown.
  useEffect(() => {
    listProducts({ limit: 200 })
      .then(setProducts)
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load products");
      });
  }, []);

  // Re-fetch events whenever filters or page change.
  useEffect(() => {
    setEvents(null);
    setError(null);
    listEvents({
      product_id: productId || undefined,
      event_type: (eventType as EventType) || undefined,
      anchor_status: (anchorStatus as AnchorStatusFilter) || undefined,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    })
      .then(setEvents)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load events"),
      );
  }, [productId, eventType, anchorStatus, page]);

  function reset() {
    setProductId("");
    setEventType("");
    setAnchorStatus("");
    setPage(0);
  }

  const productById = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  const prevDisabled = page === 0;
  const nextDisabled = !events || events.length < PAGE_SIZE;

  return (
    <>
      <PageHeader
        title="Events"
        subtitle="Provenance events across all of your products."
      />

      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-wider text-ink-500">
              Product
            </span>
            <select
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                setPage(0);
              }}
              className="block w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">All products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-wider text-ink-500">
              Type
            </span>
            <select
              value={eventType}
              onChange={(e) => {
                setEventType(e.target.value);
                setPage(0);
              }}
              className="block w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">All types</option>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-wider text-ink-500">
              Anchor
            </span>
            <select
              value={anchorStatus}
              onChange={(e) => {
                setAnchorStatus(e.target.value);
                setPage(0);
              }}
              className="block w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Any status</option>
              {ANCHOR_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <Button variant="secondary" onClick={reset}>
              Reset filters
            </Button>
          </div>
        </div>
      </Card>

      {error ? (
        <Card className="text-sm text-red-300">{error}</Card>
      ) : events === null ? (
        <p className="text-sm text-ink-400">Loading…</p>
      ) : events.length === 0 ? (
        <EmptyState
          title="No events match"
          body="Try clearing or relaxing the filters above."
        />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Type</TH>
                <TH>Product</TH>
                <TH>Anchor</TH>
                <TH>When</TH>
              </TR>
            </THead>
            <TBody>
              {events.map((event) => {
                const product = productById.get(event.product_id);
                return (
                  <TR key={event.id}>
                    <TD className="font-medium text-ink-50">
                      {event.event_type}
                    </TD>
                    <TD>
                      <Link
                        href={`/products/${event.product_id}`}
                        className="text-accent hover:text-accent-hover"
                      >
                        {product?.name ?? `${event.product_id.slice(0, 8)}…`}
                      </Link>
                    </TD>
                    <TD>
                      {event.anchor_batch_id ? (
                        <span className="text-accent">anchored</span>
                      ) : (
                        <span className="text-ink-500">pending</span>
                      )}
                    </TD>
                    <TD>{new Date(event.recorded_at).toLocaleString()}</TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>

          <div className="mt-6 flex items-center justify-between text-xs text-ink-500">
            <span>
              Page {page + 1}
              {nextDisabled ? " · last" : ""}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={prevDisabled}
                className={prevDisabled ? "pointer-events-none opacity-40" : ""}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPage((p) => p + 1)}
                disabled={nextDisabled}
                className={nextDisabled ? "pointer-events-none opacity-40" : ""}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
