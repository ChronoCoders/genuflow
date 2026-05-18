interface TableProps {
  children: React.ReactNode;
}

export function Table({ children }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-ink-800 bg-ink-900">
      <table className="min-w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-ink-800 text-xs uppercase tracking-wider text-ink-500">
      {children}
    </thead>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-ink-800">{children}</tbody>;
}

export function TR({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const cls = onClick
    ? "cursor-pointer transition hover:bg-ink-800"
    : "";
  return (
    <tr className={cls} onClick={onClick}>
      {children}
    </tr>
  );
}

export function TH({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}

export function TD({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 text-ink-200 ${className}`}>{children}</td>;
}
