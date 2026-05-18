import Link from "next/link";

interface AuthShellProps {
  title: string;
  subtitle: string;
  footer: {
    prompt: string;
    href: string;
    label: string;
  };
  children: React.ReactNode;
}

/**
 * Two-column auth layout.
 *
 * - `md+`: marketing panel on the left, form on the right, separated by a
 *   1px border. Marketing copy is identical for `/login` and `/register`.
 * - `<md`: marketing panel hidden, mobile wordmark appears above the form,
 *   single-column scroll layout.
 */
export function AuthShell({ title, subtitle, footer, children }: AuthShellProps) {
  return (
    <main className="min-h-screen md:grid md:grid-cols-2">
      <aside className="relative hidden flex-col justify-between border-r border-ink-800 bg-ink-900 p-12 md:flex">
        <Link
          href="/"
          className="relative z-10 font-serif text-3xl tracking-tight text-ink-50"
        >
          Genuflow
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="font-serif text-5xl leading-[1.05] text-ink-50">
            Provenance,
            <br />
            <span className="text-accent">anchored.</span>
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-ink-300">
            Brands integrate once. Each product gets a verifiable identity.
            Every provenance event lands on Base mainnet — no spreadsheets,
            no trust required.
          </p>

          <ul className="mt-10 space-y-3 text-sm text-ink-300">
            <li className="flex items-start gap-3">
              <span aria-hidden className="mt-1 text-accent">
                ●
              </span>
              <span>Cryptographic provenance per product</span>
            </li>
            <li className="flex items-start gap-3">
              <span aria-hidden className="mt-1 text-accent">
                ●
              </span>
              <span>On-chain anchoring every two hours</span>
            </li>
            <li className="flex items-start gap-3">
              <span aria-hidden className="mt-1 text-accent">
                ●
              </span>
              <span>Public verification, brand-private internals</span>
            </li>
          </ul>
        </div>

        <div className="relative z-10 text-xs text-ink-500">
          © Genuflow · BSL 1.1
        </div>
      </aside>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-10 block font-serif text-3xl tracking-tight text-ink-50 md:hidden"
          >
            Genuflow
          </Link>

          <h1 className="font-serif text-3xl text-ink-50">{title}</h1>
          <p className="mt-2 text-sm text-ink-400">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <p className="mt-8 text-sm text-ink-400">
            {footer.prompt}{" "}
            <Link
              href={footer.href}
              className="text-accent hover:text-accent-hover"
            >
              {footer.label}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
