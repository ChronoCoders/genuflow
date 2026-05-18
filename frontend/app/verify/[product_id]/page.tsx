import Link from "next/link";
import { notFound } from "next/navigation";

import { TransferSection } from "@/components/transfer-section";
import {
  ApiError,
  type EventType,
  type ProvenanceEvent,
  type VerifyResponse,
  getVerify,
} from "@/lib/api";

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
  const events = [...data.events].sort(
    (a, b) =>
      new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
  );
  const hasSold = events.some((e) => e.event_type === "sold");

  return (
    <main className="min-h-screen bg-ink-950">
      <div className="mx-auto w-full max-w-xl px-6 pb-20 pt-12 sm:pt-16">
        <header className="flex items-center justify-between text-[10px] uppercase tracking-[0.32em] text-ink-500">
          <span>Authenticated</span>
          <span>Genuflow</span>
        </header>

        <section className="mt-14 text-center">
          <AuthenticationSeal anchored={anchored} />
          <p className="mt-8 text-xs uppercase tracking-[0.28em] text-ink-500">
            {data.brand.name}
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-ink-50 sm:text-5xl">
            {data.product.name}
          </h1>
          <p className="mt-4 text-sm text-ink-400">
            {anchored
              ? "This item's provenance has been cryptographically recorded on Base."
              : "Provenance recorded. Awaiting on-chain confirmation."}
          </p>
        </section>

        <section className="mt-12 overflow-hidden rounded-xl border border-ink-800 bg-ink-900/60">
          <div className="flex items-center justify-between border-b border-ink-800 px-5 py-3">
            <span className="text-[10px] uppercase tracking-[0.28em] text-ink-500">
              On-chain anchor
            </span>
            <StatusPill anchored={anchored} pending={!!anchor && !anchored} />
          </div>
          <dl className="divide-y divide-ink-800 text-sm">
            <Row label="Network">
              <span className="text-ink-200">Base mainnet</span>
            </Row>
            {anchor?.block_number !== undefined &&
            anchor?.block_number !== null ? (
              <Row label="Block">
                <span className="font-mono text-ink-200">
                  {anchor.block_number.toLocaleString()}
                </span>
              </Row>
            ) : null}
            {anchor?.anchored_at ? (
              <Row label="Anchored">
                <span className="text-ink-200">
                  {new Date(anchor.anchored_at).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </Row>
            ) : null}
            {anchor?.tx_hash ? (
              <Row label="Transaction">
                <a
                  href={`https://basescan.org/tx/${anchor.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-accent hover:text-accent-hover"
                >
                  <span>{truncateHash(anchor.tx_hash)}</span>
                  <ExternalLinkIcon />
                </a>
              </Row>
            ) : (
              <Row label="Transaction">
                <span className="text-ink-500">—</span>
              </Row>
            )}
          </dl>
        </section>

        <section className="mt-12">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-serif text-2xl text-ink-50">Provenance</h2>
            <span className="text-[10px] uppercase tracking-[0.28em] text-ink-500">
              {events.length} {events.length === 1 ? "event" : "events"}
            </span>
          </div>

          {events.length === 0 ? (
            <p className="rounded-lg border border-dashed border-ink-800 p-8 text-center text-sm text-ink-400">
              No events recorded yet.
            </p>
          ) : (
            <ol className="space-y-0">
              {events.map((event, i) => (
                <TimelineEntry
                  key={event.id}
                  event={event}
                  last={i === events.length - 1}
                />
              ))}
            </ol>
          )}
        </section>

        {hasSold ? <TransferSection productId={data.product.id} /> : null}

        <footer className="mt-20 border-t border-ink-800 pt-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="text-[10px] uppercase tracking-[0.32em] text-ink-500">
              Powered by
            </div>
            <Link
              href="/"
              className="font-serif text-2xl text-ink-100 transition hover:text-ink-50"
            >
              Genuflow
            </Link>
            <p className="max-w-xs text-xs leading-relaxed text-ink-500">
              Cryptographic provenance for luxury goods. Anchored to Base.
            </p>
            <div className="mt-3 font-mono text-[10px] text-ink-600">
              {data.product.id}
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <dt className="text-xs uppercase tracking-wider text-ink-500">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

function StatusPill({
  anchored,
  pending,
}: {
  anchored: boolean;
  pending: boolean;
}) {
  if (anchored) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-accent">
        <span className="block h-1.5 w-1.5 rounded-full bg-accent" />
        Confirmed
      </span>
    );
  }
  if (pending) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-800 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-ink-300">
        <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-ink-400" />
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-800 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-ink-400">
      Not yet anchored
    </span>
  );
}

function AuthenticationSeal({ anchored }: { anchored: boolean }) {
  return (
    <div className="relative mx-auto h-20 w-20">
      <div
        className={`absolute inset-0 rounded-full ${
          anchored ? "bg-accent/10" : "bg-ink-800"
        }`}
      />
      <div
        className={`absolute inset-2 rounded-full border ${
          anchored ? "border-accent/40" : "border-ink-700"
        }`}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className={anchored ? "text-accent" : "text-ink-500"}
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>
    </div>
  );
}

function TimelineEntry({
  event,
  last,
}: {
  event: ProvenanceEvent;
  last: boolean;
}) {
  const anchored = !!event.anchor_batch_id;
  const detail = event.detail as Record<string, unknown> | null;
  const location = typeof detail?.location === "string" ? detail.location : null;
  const notes = typeof detail?.notes === "string" ? detail.notes : null;
  const newOwner =
    typeof detail?.new_owner_email === "string" ? detail.new_owner_email : null;

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!last && (
        <span
          aria-hidden
          className="absolute left-[19px] top-10 h-[calc(100%-2rem)] w-px bg-ink-800"
        />
      )}
      <div
        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
          anchored
            ? "border-accent/40 bg-ink-900 text-accent"
            : "border-ink-700 bg-ink-900 text-ink-400"
        }`}
      >
        <EventIcon type={event.event_type} />
      </div>
      <div className="min-w-0 flex-1 pt-1">
        <div className="flex items-center gap-2">
          <div className="font-medium capitalize text-ink-50">
            {event.event_type}
          </div>
          {anchored ? (
            <span className="text-[10px] uppercase tracking-wider text-accent">
              anchored
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-wider text-ink-500">
              pending
            </span>
          )}
        </div>
        <div className="mt-1 text-xs text-ink-400">
          {new Date(event.recorded_at).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </div>
        {location || notes || newOwner ? (
          <div className="mt-3 space-y-1 rounded-md border border-ink-800 bg-ink-900/40 px-3 py-2 text-xs text-ink-300">
            {location && (
              <div>
                <span className="text-ink-500">Location: </span>
                {location}
              </div>
            )}
            {newOwner && (
              <div>
                <span className="text-ink-500">New owner: </span>
                {newOwner}
              </div>
            )}
            {notes && (
              <div>
                <span className="text-ink-500">Notes: </span>
                {notes}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </li>
  );
}

function EventIcon({ type }: { type: EventType }) {
  const props = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (type) {
    case "manufactured":
      return (
        <svg {...props}>
          <path d="M3 21h18" />
          <path d="M5 21V10l5 3V10l5 3V8l4-2v15" />
        </svg>
      );
    case "inspected":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="6" />
          <path d="m21 21-5.2-5.2" />
        </svg>
      );
    case "shipped":
      return (
        <svg {...props}>
          <path d="M3 7h11v9H3z" />
          <path d="M14 10h4l3 3v3h-7" />
          <circle cx="7" cy="18" r="1.6" />
          <circle cx="17.5" cy="18" r="1.6" />
        </svg>
      );
    case "sold":
      return (
        <svg {...props}>
          <path d="M20.6 13.4 12 22l-9-9V4h9z" />
          <circle cx="7.5" cy="7.5" r="1.2" />
        </svg>
      );
    case "transferred":
      return (
        <svg {...props}>
          <path d="M4 8h13" />
          <path d="m13 4 4 4-4 4" />
          <path d="M20 16H7" />
          <path d="m11 20-4-4 4-4" />
        </svg>
      );
  }
}

function ExternalLinkIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

function truncateHash(hash: string): string {
  if (hash.length <= 18) return hash;
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`;
}
