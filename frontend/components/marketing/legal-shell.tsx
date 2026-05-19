import Link from "next/link";

interface LegalShellProps {
  eyebrow: string;
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
}

/**
 * Shared chrome for the four pages under /legal. Plain editorial layout
 * — no images, generous line-height, single column.
 */
export function LegalShell({
  eyebrow,
  title,
  effectiveDate,
  children,
}: LegalShellProps) {
  return (
    <article>
      <header className="border-b border-white/5">
        <div className="mx-auto w-full max-w-3xl px-6 py-20 sm:py-24">
          <div className="text-[10px] uppercase tracking-[0.32em] text-accent">
            {eyebrow}
          </div>
          <h1 className="mt-6 font-serif text-4xl leading-[1.05] text-ink-50 sm:text-5xl">
            {title}
          </h1>
          <div className="mt-6 text-xs uppercase tracking-[0.22em] text-ink-500">
            Effective {effectiveDate}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="legal-prose space-y-6 text-base leading-relaxed text-ink-200 sm:text-[17px] sm:leading-[1.75]">
          {children}
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-ink-500">
          <span>© {new Date().getFullYear()} Genuflow.</span>
          <div className="flex gap-5">
            <Link href="/legal/privacy" className="hover:text-ink-300">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:text-ink-300">
              Terms
            </Link>
            <Link href="/legal/cookies" className="hover:text-ink-300">
              Cookies
            </Link>
            <Link href="/legal/gdpr" className="hover:text-ink-300">
              GDPR
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-12 font-serif text-2xl text-ink-50 sm:text-3xl">
      {children}
    </h2>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-8 font-serif text-xl text-ink-100 sm:text-2xl">
      {children}
    </h3>
  );
}

export function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="space-y-2 pl-5 [&>li]:list-disc [&>li]:marker:text-accent">
      {children}
    </ul>
  );
}

export function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/5 bg-ink-900/40 p-5 text-sm leading-relaxed text-ink-300">
      {children}
    </div>
  );
}
