"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Icon = (props: { className?: string }) => React.JSX.Element;

interface DropdownItem {
  href: string;
  label: string;
  description: string;
  icon: Icon;
}

type NavEntry =
  | { kind: "link"; href: string; label: string }
  | { kind: "dropdown"; key: string; label: string; items: DropdownItem[] };

const NAV: NavEntry[] = [
  { kind: "link", href: "/how-it-works", label: "How it works" },
  {
    kind: "dropdown",
    key: "use-cases",
    label: "Use cases",
    items: [
      {
        href: "/use-cases/luxury",
        label: "Luxury goods",
        description: "Handbags, leather, ready-to-wear.",
        icon: BagIcon,
      },
      {
        href: "/use-cases/fashion-textiles",
        label: "Fashion & Textiles",
        description: "Built for the EU Digital Product Passport.",
        icon: FabricIcon,
      },
      {
        href: "/use-cases/watches-jewelry",
        label: "Watches & Jewelry",
        description: "Service history that outlives the first owner.",
        icon: WatchIcon,
      },
    ],
  },
  { kind: "link", href: "/pricing", label: "Pricing" },
  {
    kind: "dropdown",
    key: "resources",
    label: "Resources",
    items: [
      {
        href: "/blog",
        label: "Journal",
        description: "Writing on authentication, regulation, and craft.",
        icon: JournalIcon,
      },
      {
        href: "/resources",
        label: "Whitepapers",
        description: "Architecture, economics, and migration guides.",
        icon: PaperIcon,
      },
      {
        href: "/resources",
        label: "Integration guides",
        description: "Operational playbooks for engineering teams.",
        icon: WrenchIcon,
      },
      {
        href: "/docs",
        label: "API docs",
        description: "Reference, quickstart, and worked examples.",
        icon: CodeIcon,
      },
      {
        href: "/resources",
        label: "Open standards",
        description: "GS1, W3C VC, ISO 3758, EU ESPR.",
        icon: StandardsIcon,
      },
    ],
  },
  {
    kind: "dropdown",
    key: "company",
    label: "Company",
    items: [
      {
        href: "/about",
        label: "About",
        description: "Story, mission, and operating principles.",
        icon: CompassIcon,
      },
      {
        href: "/contact",
        label: "Contact",
        description: "Direct lines to founders and sales.",
        icon: MailIcon,
      },
    ],
  },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/85 backdrop-blur supports-[backdrop-filter]:bg-ink-950/65">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <Link href="/" className="font-serif text-2xl tracking-tight text-ink-50">
          Genuflow
        </Link>

        <nav className="hidden gap-1 text-sm md:flex">
          {NAV.map((entry) => {
            if (entry.kind === "link") {
              const active =
                pathname === entry.href || pathname.startsWith(`${entry.href}/`);
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className={`rounded-md px-3 py-2 transition ${
                    active ? "text-ink-50" : "text-ink-400 hover:text-ink-100"
                  }`}
                >
                  {entry.label}
                </Link>
              );
            }

            const open = hoverKey === entry.key;
            const active = entry.items.some(
              (item) =>
                pathname === item.href || pathname.startsWith(`${item.href}/`),
            );

            return (
              <div
                key={entry.key}
                className="relative"
                onMouseEnter={() => setHoverKey(entry.key)}
                onMouseLeave={() => setHoverKey(null)}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  className={`flex items-center gap-1 rounded-md px-3 py-2 transition ${
                    active || open
                      ? "text-ink-50"
                      : "text-ink-400 hover:text-ink-100"
                  }`}
                >
                  {entry.label}
                  <Chevron open={open} />
                </button>

                {open ? (
                  <DropdownPanel
                    items={entry.items}
                    onItemClick={() => setHoverKey(null)}
                  />
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/login"
            className="text-sm text-ink-300 transition hover:text-ink-50"
          >
            Sign in
          </Link>
          <Link
            href="/contact"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-ink-50 transition hover:bg-accent-hover"
          >
            Request access
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-md p-2 text-ink-200 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <BurgerIcon open={mobileOpen} />
        </button>
      </div>

      {mobileOpen ? (
        <MobilePanel
          entries={NAV}
          expanded={mobileExpanded}
          onToggle={(key) =>
            setMobileExpanded((prev) => (prev === key ? null : key))
          }
          onClose={() => setMobileOpen(false)}
        />
      ) : null}
    </header>
  );
}

function DropdownPanel({
  items,
  onItemClick,
}: {
  items: DropdownItem[];
  onItemClick: () => void;
}) {
  return (
    <div className="absolute left-0 top-full z-50 pt-2">
      <div className="w-[420px] overflow-hidden rounded-xl border border-white/10 bg-ink-950 shadow-2xl ring-1 ring-black/40">
        <ul className="p-2">
          {items.map((item) => {
            const IconComp = item.icon;
            return (
              <li key={`${item.label}-${item.href}`}>
                <Link
                  href={item.href}
                  onClick={onItemClick}
                  className="group/item flex items-start gap-3 rounded-lg p-3 transition hover:bg-ink-900"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/5 bg-ink-900 text-ink-300 transition group-hover/item:border-accent/30 group-hover/item:text-accent">
                    <IconComp className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-ink-100 transition group-hover/item:text-ink-50">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-500">
                      {item.description}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function MobilePanel({
  entries,
  expanded,
  onToggle,
  onClose,
}: {
  entries: NavEntry[];
  expanded: string | null;
  onToggle: (key: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="border-t border-white/5 bg-ink-950 px-6 py-6 md:hidden">
      <nav className="flex flex-col gap-1 text-sm">
        {entries.map((entry) => {
          if (entry.kind === "link") {
            return (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={onClose}
                className="rounded-md px-3 py-2.5 text-ink-200 hover:bg-ink-900"
              >
                {entry.label}
              </Link>
            );
          }
          const open = expanded === entry.key;
          return (
            <div key={entry.key} className="overflow-hidden">
              <button
                type="button"
                onClick={() => onToggle(entry.key)}
                aria-expanded={open}
                className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-ink-200 hover:bg-ink-900"
              >
                <span>{entry.label}</span>
                <Chevron open={open} />
              </button>
              {open ? (
                <ul className="ml-3 mt-1 space-y-1 border-l border-ink-800 pl-3">
                  {entry.items.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <li key={`${item.label}-${item.href}`}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className="flex items-start gap-3 rounded-md px-2 py-2 hover:bg-ink-900"
                        >
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/5 bg-ink-900 text-ink-400">
                            <IconComp className="h-3.5 w-3.5" />
                          </span>
                          <span>
                            <span className="block text-sm text-ink-100">
                              {item.label}
                            </span>
                            <span className="mt-0.5 block text-xs text-ink-500">
                              {item.description}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          );
        })}

        <hr className="my-3 border-white/5" />

        <Link
          href="/login"
          onClick={onClose}
          className="rounded-md px-3 py-2.5 text-ink-300 hover:bg-ink-900"
        >
          Sign in
        </Link>
        <Link
          href="/contact"
          onClick={onClose}
          className="mt-1 rounded-md bg-accent px-3 py-2.5 text-center font-medium text-ink-50"
        >
          Request access
        </Link>
      </nav>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function BurgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {open ? (
        <>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </>
      ) : (
        <>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </>
      )}
    </svg>
  );
}

// --- Icons (small line-art set, consistent with rest of marketing) ---

function svgProps(className?: string) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
}

function BagIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps(className)}>
      <path d="M5 8h14l-1 12H6L5 8z" />
      <path d="M9 8V5a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

function FabricIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps(className)}>
      <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      <path d="M8 4v16M16 4v16" />
    </svg>
  );
}

function WatchIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps(className)}>
      <circle cx="12" cy="12" r="6" />
      <path d="M9 6V3h6v3M9 18v3h6v-3" />
      <path d="M12 9v3l2 2" />
    </svg>
  );
}

function JournalIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps(className)}>
      <path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4z" />
      <path d="M9 8h8M9 12h8M9 16h5" />
    </svg>
  );
}

function PaperIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps(className)}>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
      <path d="M10 13h5M10 17h5" />
    </svg>
  );
}

function WrenchIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps(className)}>
      <path d="M14.7 6.3a4 4 0 0 1 5.3 5.3l-3-1-1.5 1.5 1 3a4 4 0 0 1-5.3-5.3z" />
      <path d="M11 13 4 20l-1-1 7-7" />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps(className)}>
      <path d="m8 8-4 4 4 4" />
      <path d="m16 8 4 4-4 4" />
      <path d="m14 5-4 14" />
    </svg>
  );
}

function StandardsIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps(className)}>
      <path d="M12 3 4 7v5c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V7l-8-4z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CompassIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps(className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-2 5-5 2 2-5 5-2z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps(className)}>
      <path d="M3 6h18v12H3z" />
      <path d="m3 7 9 7 9-7" />
    </svg>
  );
}
