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

export function AuthShell({ title, subtitle, footer, children }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <Link
            href="/"
            className="font-serif text-3xl tracking-tight text-ink-50"
          >
            Genuflow
          </Link>
        </div>

        <h1 className="font-serif text-3xl text-ink-50">{title}</h1>
        <p className="mt-2 text-sm text-ink-400">{subtitle}</p>

        <div className="mt-8">{children}</div>

        <p className="mt-8 text-sm text-ink-400">
          {footer.prompt}{" "}
          <Link href={footer.href} className="text-accent hover:text-accent-hover">
            {footer.label}
          </Link>
        </p>
      </div>
    </main>
  );
}
