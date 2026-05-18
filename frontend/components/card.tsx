interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-ink-800 bg-ink-900 p-6 ${className}`}
    >
      {children}
    </div>
  );
}

interface StatProps {
  label: string;
  value: string | number;
  hint?: string;
}

export function Stat({ label, value, hint }: StatProps) {
  return (
    <Card>
      <div className="text-xs uppercase tracking-wider text-ink-500">{label}</div>
      <div className="mt-2 font-serif text-3xl text-ink-50">{value}</div>
      {hint ? (
        <div className="mt-2 text-xs text-ink-400">{hint}</div>
      ) : null}
    </Card>
  );
}
