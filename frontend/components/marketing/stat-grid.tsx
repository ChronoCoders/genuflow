import { Eyebrow } from "@/components/marketing/section";

export interface Stat {
  value: string;
  label: string;
  source?: string;
}

interface StatGridProps {
  eyebrow: string;
  title?: React.ReactNode;
  stats: Stat[];
}

/**
 * Editorial stat grid for use-case pages. Sizes itself to the number of
 * cards: 1 → single full-width hero card; 2 → 2-col; 3 → 3-col.
 */
export function StatGrid({ eyebrow, title, stats }: StatGridProps) {
  const cols =
    stats.length === 1
      ? "grid-cols-1"
      : stats.length === 2
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1 md:grid-cols-3";

  return (
    <section className="border-b border-white/5 bg-ink-900/40">
      <div className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-24">
        <Eyebrow>{eyebrow}</Eyebrow>
        {title ? (
          <h2 className="mt-4 max-w-3xl font-serif text-3xl text-ink-50 sm:text-4xl">
            {title}
          </h2>
        ) : null}

        <div className={`mt-12 grid gap-6 ${cols}`}>
          {stats.map((stat) => (
            <StatCard
              key={`${stat.value}-${stat.label}`}
              stat={stat}
              featured={stats.length === 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat, featured }: { stat: Stat; featured: boolean }) {
  return (
    <article
      className={`rounded-2xl border border-white/5 bg-ink-950 p-8 ${
        featured ? "sm:p-12" : ""
      }`}
    >
      <div
        className={`font-serif leading-none text-accent ${
          featured ? "text-6xl sm:text-7xl md:text-8xl" : "text-5xl sm:text-6xl"
        }`}
      >
        {stat.value}
      </div>
      <p
        className={`mt-6 text-ink-200 ${
          featured ? "text-lg leading-relaxed sm:text-xl" : "text-base leading-relaxed"
        }`}
      >
        {stat.label}
      </p>
      {stat.source ? (
        <p className="mt-4 text-[10px] uppercase tracking-[0.24em] text-ink-500">
          {stat.source}
        </p>
      ) : null}
    </article>
  );
}
