interface CodeBlockProps {
  language?: string;
  children: string;
}

export function CodeBlock({ language, children }: CodeBlockProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/5 bg-ink-950">
      {language ? (
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-ink-500">
          <span>{language}</span>
        </div>
      ) : null}
      <pre className="overflow-x-auto px-4 py-4 text-xs leading-relaxed text-ink-200">
        <code>{children}</code>
      </pre>
    </div>
  );
}
