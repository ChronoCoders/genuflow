"use client";

import { useState } from "react";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { Table, TBody, TD, TH, THead, TR } from "@/components/table";
import {
  WEBHOOK_EVENT_TYPES,
  type CreateWebhookResponse,
  type WebhookDelivery,
  type WebhookEndpoint,
  type WebhookEventType,
  createWebhookEndpoint,
  deactivateWebhookEndpoint,
  listWebhookDeliveries,
  listWebhookEndpoints,
} from "@/lib/api";

const EVENT_LABEL: Record<WebhookEventType, string> = {
  "product.registered": "Product registered",
  "event.recorded": "Provenance event recorded",
  "anchor.confirmed": "Anchor confirmed on Base",
};

interface PanelProps {
  initial: WebhookEndpoint[];
}

export function WebhooksPanel({ initial }: PanelProps) {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>(initial);
  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<CreateWebhookResponse | null>(null);

  async function refresh() {
    try {
      setEndpoints(await listWebhookEndpoints());
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to refresh endpoints",
      );
    }
  }

  async function onCreate(url: string, events: WebhookEventType[]) {
    setActionError(null);
    try {
      const resp = await createWebhookEndpoint(url, events);
      setRevealed(resp);
      setCreating(false);
      await refresh();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to create endpoint",
      );
    }
  }

  async function onDeactivate(id: string) {
    if (
      !confirm(
        "Deactivate this endpoint? Past deliveries are retained, but no new events will be sent.",
      )
    ) {
      return;
    }
    setActionError(null);
    try {
      await deactivateWebhookEndpoint(id);
      await refresh();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to deactivate",
      );
    }
  }

  return (
    <>
      {revealed ? (
        <RevealedSecret data={revealed} onClose={() => setRevealed(null)} />
      ) : null}

      {actionError ? (
        <Card className="mb-6 text-sm text-red-300">{actionError}</Card>
      ) : null}

      {creating ? (
        <CreateForm onCancel={() => setCreating(false)} onSubmit={onCreate} />
      ) : (
        <div className="mb-6 flex justify-end">
          <Button onClick={() => setCreating(true)}>Register endpoint</Button>
        </div>
      )}

      {endpoints.length === 0 ? (
        <EmptyState
          title="No webhook endpoints"
          body="Register an endpoint to receive HMAC-signed event payloads as they happen."
        />
      ) : (
        <div className="space-y-6">
          {endpoints.map((endpoint) => (
            <EndpointRow
              key={endpoint.id}
              endpoint={endpoint}
              onDeactivate={() => onDeactivate(endpoint.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function RevealedSecret({
  data,
  onClose,
}: {
  data: CreateWebhookResponse;
  onClose: () => void;
}) {
  return (
    <Card className="mb-6 border-accent/40 bg-accent/5">
      <h3 className="font-serif text-xl text-ink-50">
        Endpoint registered
      </h3>
      <p className="mt-2 text-sm text-ink-300">
        Save the signing secret now. It is shown once and cannot be
        retrieved later.
      </p>
      <div className="mt-4 rounded-md border border-ink-700 bg-ink-950 p-4">
        <div className="text-[10px] uppercase tracking-wider text-ink-500">
          Secret
        </div>
        <code className="mt-2 block break-all font-mono text-sm text-accent">
          {data.secret}
        </code>
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="secondary" onClick={onClose}>
          I&apos;ve saved it
        </Button>
      </div>
    </Card>
  );
}

function CreateForm({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (url: string, events: WebhookEventType[]) => void | Promise<void>;
}) {
  const [url, setUrl] = useState("");
  const [selected, setSelected] = useState<Set<WebhookEventType>>(
    new Set(["product.registered", "event.recorded"]),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(event: WebhookEventType) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(event)) next.delete(event);
      else next.add(event);
      return next;
    });
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setError("URL must start with http:// or https://");
      return;
    }
    if (selected.size === 0) {
      setError("Select at least one event type.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(url, Array.from(selected));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="mb-6">
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-wider text-ink-500">
            Endpoint URL
          </span>
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-app.example.com/genuflow/events"
            className="block w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-50 placeholder:text-ink-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </label>

        <fieldset>
          <legend className="mb-2 block text-xs uppercase tracking-wider text-ink-500">
            Subscribed events
          </legend>
          <div className="space-y-2">
            {WEBHOOK_EVENT_TYPES.map((event) => (
              <label
                key={event}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-ink-800 bg-ink-900/50 px-3 py-2 text-sm text-ink-200 hover:border-ink-700"
              >
                <input
                  type="checkbox"
                  checked={selected.has(event)}
                  onChange={() => toggle(event)}
                  className="mt-0.5 h-4 w-4 rounded border-ink-700 bg-ink-900 text-accent focus:ring-accent"
                />
                <span>
                  <span className="block text-ink-100">
                    {EVENT_LABEL[event]}
                  </span>
                  <span className="block font-mono text-xs text-ink-500">
                    {event}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Registering…" : "Register endpoint"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function EndpointRow({
  endpoint,
  onDeactivate,
}: {
  endpoint: WebhookEndpoint;
  onDeactivate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (!open && deliveries === null) {
      try {
        setDeliveries(await listWebhookDeliveries(endpoint.id));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load deliveries",
        );
      }
    }
    setOpen((v) => !v);
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <code className="break-all font-mono text-sm text-ink-100">
              {endpoint.url}
            </code>
            {endpoint.active ? (
              <span className="inline-flex shrink-0 items-center rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent">
                Active
              </span>
            ) : (
              <span className="inline-flex shrink-0 items-center rounded-full border border-ink-700 bg-ink-800 px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink-400">
                Inactive
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {endpoint.events.map((event) => (
              <span
                key={event}
                className="rounded-md border border-ink-800 bg-ink-900 px-2 py-0.5 font-mono text-[10px] text-ink-300"
              >
                {event}
              </span>
            ))}
          </div>
          <div className="mt-2 text-xs text-ink-500">
            Created {new Date(endpoint.created_at).toLocaleString()}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" onClick={toggle}>
            {open ? "Hide deliveries" : "View deliveries"}
          </Button>
          {endpoint.active ? (
            <Button variant="secondary" onClick={onDeactivate}>
              Deactivate
            </Button>
          ) : null}
        </div>
      </div>

      {open ? (
        <div className="mt-6 border-t border-ink-800 pt-6">
          {error ? (
            <p className="text-sm text-red-300">{error}</p>
          ) : deliveries === null ? (
            <p className="text-sm text-ink-400">Loading deliveries…</p>
          ) : deliveries.length === 0 ? (
            <p className="text-sm text-ink-400">
              No deliveries yet. Trigger one by registering a product or
              recording an event.
            </p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Event</TH>
                  <TH>Status</TH>
                  <TH>Attempts</TH>
                  <TH>Last attempt</TH>
                </TR>
              </THead>
              <TBody>
                {deliveries.map((d) => (
                  <TR key={d.id}>
                    <TD className="font-mono text-xs">{d.event_type}</TD>
                    <TD>
                      <DeliveryStatusPill status={d.status} />
                    </TD>
                    <TD>{d.attempts}</TD>
                    <TD>
                      {d.last_attempted_at
                        ? new Date(d.last_attempted_at).toLocaleString()
                        : "—"}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </div>
      ) : null}
    </Card>
  );
}

function DeliveryStatusPill({
  status,
}: {
  status: WebhookDelivery["status"];
}) {
  const tone =
    status === "delivered"
      ? "border-accent/30 bg-accent/10 text-accent"
      : status === "pending"
        ? "border-ink-700 bg-ink-800 text-ink-300"
        : "border-red-400/30 bg-red-400/10 text-red-300";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${tone}`}
    >
      {status}
    </span>
  );
}
