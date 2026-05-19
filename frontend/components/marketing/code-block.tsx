import { codeToHtml } from "shiki";

interface CodeBlockProps {
  language?: string;
  children: string;
}

/**
 * Server-rendered code block with Shiki syntax highlighting. The
 * highlight runs at build time so the rendered page ships pre-styled
 * HTML — no client-side JavaScript is needed for tokenisation. Inline
 * styles are emitted by Shiki and complement the surrounding chrome
 * (language pill, frame). The `min-dark` theme is muted enough to sit
 * inside the marketing aesthetic without competing with the accent
 * colour.
 */
export async function CodeBlock({ language, children }: CodeBlockProps) {
  const lang = normaliseLang(language);
  const html = await codeToHtml(children, {
    lang,
    theme: "min-dark",
  });

  return (
    <div className="overflow-hidden rounded-lg border border-white/5 bg-ink-950">
      {language ? (
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-ink-500">
          <span>{language}</span>
        </div>
      ) : null}
      <div
        className="shiki-block overflow-x-auto text-xs leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

/**
 * Map the human-readable language labels used on /docs to Shiki's
 * grammar identifiers. Unknown values fall through to `text`, which
 * skips highlighting cleanly rather than throwing at build time.
 */
function normaliseLang(language?: string): string {
  if (!language) return "text";
  const lowered = language.toLowerCase();
  switch (lowered) {
    case "bash":
    case "sh":
    case "shell":
      return "bash";
    case "ts":
    case "tsx":
    case "typescript":
      return "ts";
    case "js":
    case "jsx":
    case "javascript":
      return "js";
    case "json":
      return "json";
    case "rs":
    case "rust":
      return "rust";
    case "sql":
      return "sql";
    default:
      return "text";
  }
}
