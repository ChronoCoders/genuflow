"use client";

import { useState } from "react";

interface DeepDiveItem {
  number: string;
  title: string;
  body: string;
}

const ITEMS: DeepDiveItem[] = [
  {
    number: "01",
    title: "Issue identity",
    body: "Every product gets a unique signed identifier the moment it enters your system. It cannot be duplicated or retroactively altered. The QR code you print is a permanent pointer to this record.",
  },
  {
    number: "02",
    title: "Record events",
    body: "Every event — manufacture, inspection, shipment, sale, transfer — is written to an append-only log. Nothing can be deleted or edited after the fact. The timeline your customer sees is the same one your team wrote.",
  },
  {
    number: "03",
    title: "Anchor to Base",
    body: "Every two hours, all recorded events are compressed into a single cryptographic signature and written to Base blockchain. No one — including Genuflow — can alter a record once it is anchored. The transaction is publicly verifiable on any block explorer.",
  },
  {
    number: "04",
    title: "Verify anywhere",
    body: "The verification page requires no app, no account, no trust in Genuflow. A customer with the QR code can confirm authenticity independently, even if Genuflow ceased to operate tomorrow.",
  },
];

/**
 * Collapsible deep-dive panel. Single-select — opening one closes the
 * others, which keeps the section visually quiet. The height animation
 * uses the CSS grid-template-rows 0fr→1fr trick so each item animates
 * to its own intrinsic height without manual measurement.
 */
export function DeepDive() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-xl border border-white/5 divide-y divide-white/5">
      {ITEMS.map((item) => {
        const isOpen = open === item.number;
        return (
          <div key={item.number}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.number)}
              aria-expanded={isOpen}
              className={`flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-ink-900/40 ${
                isOpen ? "bg-ink-900/40" : ""
              }`}
            >
              <span className="flex items-baseline gap-4">
                <span className="font-serif text-sm text-accent">
                  {item.number}
                </span>
                <span className="font-serif text-lg text-ink-50 sm:text-xl">
                  {item.title}
                </span>
              </span>
              <Chevron open={isOpen} />
            </button>

            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="px-6 pb-6 pl-[3.75rem] text-base leading-relaxed text-ink-300">
                  {item.body}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 text-accent transition-transform duration-300 ${
        open ? "rotate-180" : ""
      }`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
