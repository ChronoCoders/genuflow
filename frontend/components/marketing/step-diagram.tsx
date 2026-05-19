"use client";

import { useEffect, useRef, useState } from "react";

type IconComp = (props: { className?: string }) => React.JSX.Element;

interface Step {
  number: string;
  title: string;
  description: string;
  icon: IconComp;
}

const STEPS: Step[] = [
  {
    number: "01",
    title: "Issue identity",
    description:
      "Each product is registered through the Genuflow API and assigned a unique signed identity. We return a QR code you place inside the garment or on the hang tag.",
    icon: SeedIcon,
  },
  {
    number: "02",
    title: "Record events",
    description:
      "Manufacture, inspection, shipping, sale, transfer — every event is recorded against the product through one endpoint and accumulates into a permanent timeline.",
    icon: ListIcon,
  },
  {
    number: "03",
    title: "Anchor to Base",
    description:
      "Every two hours we batch unanchored events into a Merkle commitment and submit a single transaction to Base mainnet. We absorb the gas; brands see the tx hash.",
    icon: ChainIcon,
  },
  {
    number: "04",
    title: "Verify anywhere",
    description:
      "Customers scan the QR. They land on a public page branded for your house — the brand, the timeline, the on-chain anchor. No app, no login, no trust assumption.",
    icon: ScanIcon,
  },
];

/**
 * Four-step horizontal flow with sequential fade-and-slide entrance.
 * Uses IntersectionObserver to trigger when the diagram enters the
 * viewport; each step's `transition-delay` is staggered by index.
 */
export function StepDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Connecting line: horizontal at md+, vertical below */}
      <div
        aria-hidden
        className="absolute left-6 top-6 hidden h-px w-[calc(100%-3rem)] bg-gradient-to-r from-transparent via-white/10 to-transparent md:block"
      />
      <div
        aria-hidden
        className="absolute left-6 top-12 bottom-12 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent md:hidden"
      />

      <ol className="relative grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-6">
        {STEPS.map((step, i) => {
          const IconComp = step.icon;
          return (
            <li
              key={step.number}
              className={`relative flex gap-5 transition-all duration-700 ease-out md:block ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-ink-950 text-accent">
                <IconComp className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 md:mt-6">
                <div className="font-serif text-2xl text-accent">
                  {step.number}
                </div>
                <h3 className="mt-2 font-serif text-xl text-ink-50 sm:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-300">
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function svgProps(className?: string) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
}

function SeedIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps(className)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      <path d="m5.6 5.6 2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps(className)}>
      <path d="M5 7h14M5 12h14M5 17h9" />
      <circle cx="3.5" cy="7" r="0.6" fill="currentColor" />
      <circle cx="3.5" cy="12" r="0.6" fill="currentColor" />
      <circle cx="3.5" cy="17" r="0.6" fill="currentColor" />
    </svg>
  );
}

function ChainIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps(className)}>
      <path d="M10 14a4 4 0 0 1 0-5.7l2-2a4 4 0 0 1 5.7 5.7l-1 1" />
      <path d="M14 10a4 4 0 0 1 0 5.7l-2 2a4 4 0 0 1-5.7-5.7l1-1" />
    </svg>
  );
}

function ScanIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps(className)}>
      <path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2" />
      <path d="M8 8h3v3H8zM13 8h3v3h-3zM8 13h3v3H8zM13 13h3v3h-3z" />
    </svg>
  );
}
