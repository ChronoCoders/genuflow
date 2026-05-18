interface EmptyStateProps {
  title: string;
  body?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-ink-800 p-12 text-center">
      <p className="font-serif text-xl text-ink-100">{title}</p>
      {body ? <p className="mt-2 text-sm text-ink-400">{body}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
