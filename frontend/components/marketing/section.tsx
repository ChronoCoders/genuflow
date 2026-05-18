import Link from "next/link";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-[0.32em] text-accent">
      {children}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="mt-4 font-serif text-4xl leading-[1.05] text-ink-50 sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-6 text-base leading-relaxed text-ink-300">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro: React.ReactNode;
}) {
  return (
    <section className="border-b border-white/5">
      <div className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-28">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-6 font-serif text-5xl leading-[1.02] text-ink-50 sm:text-6xl md:text-7xl">
          {title}
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-300">
          {intro}
        </p>
      </div>
    </section>
  );
}

export function CTABand({
  title,
  body,
  cta = { href: "/contact", label: "Request access" },
}: {
  title: React.ReactNode;
  body: React.ReactNode;
  cta?: { href: string; label: string };
}) {
  return (
    <section className="border-y border-white/5 bg-ink-900/40">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-8 px-6 py-20 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-serif text-4xl text-ink-50 sm:text-5xl">
            {title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-300">{body}</p>
        </div>
        <Link
          href={cta.href}
          className="inline-flex shrink-0 items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-medium text-ink-50 transition hover:bg-accent-hover"
        >
          {cta.label}
        </Link>
      </div>
    </section>
  );
}
