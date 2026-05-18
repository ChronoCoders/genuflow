"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS: { href: string; label: string }[] = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/use-cases", label: "Use cases" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Journal" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/85 backdrop-blur supports-[backdrop-filter]:bg-ink-950/65">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <Link href="/" className="font-serif text-2xl tracking-tight text-ink-50">
          Genuflow
        </Link>

        <nav className="hidden gap-8 text-sm md:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`transition ${
                  active ? "text-ink-50" : "text-ink-400 hover:text-ink-100"
                }`}
              >
                {l.label}
              </Link>
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
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-ink-200 md:hidden"
          aria-label="Toggle menu"
        >
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
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/5 bg-ink-950 px-6 py-6 md:hidden">
          <nav className="flex flex-col gap-4 text-sm">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-ink-200"
              >
                {l.label}
              </Link>
            ))}
            <hr className="my-2 border-white/5" />
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-ink-300"
            >
              Sign in
            </Link>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="rounded-md bg-accent px-4 py-2 text-center font-medium text-ink-50"
            >
              Request access
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
