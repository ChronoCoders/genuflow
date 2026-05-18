import Link from "next/link";

import { ArticleHeaderImage } from "@/components/marketing/hero-image";

interface ArticleLayoutProps {
  eyebrow: string;
  title: string;
  date: string;
  readTime: string;
  image?: { src: string; alt: string };
  children: React.ReactNode;
}

export function ArticleLayout({
  eyebrow,
  title,
  date,
  readTime,
  image,
  children,
}: ArticleLayoutProps) {
  return (
    <article>
      <header className="border-b border-white/5">
        <div className="mx-auto w-full max-w-3xl px-6 py-20 sm:py-24">
          <Link
            href="/blog"
            className="text-xs uppercase tracking-[0.28em] text-ink-500 hover:text-ink-300"
          >
            ← Journal
          </Link>
          <div className="mt-10 text-[10px] uppercase tracking-[0.32em] text-accent">
            {eyebrow}
          </div>
          <h1 className="mt-6 font-serif text-4xl leading-[1.05] text-ink-50 sm:text-5xl md:text-6xl">
            {title}
          </h1>
          <div className="mt-8 text-xs uppercase tracking-[0.22em] text-ink-500">
            {date} · {readTime}
          </div>
        </div>
      </header>

      {image ? (
        <ArticleHeaderImage src={image.src} alt={image.alt} />
      ) : null}

      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <Prose>{children}</Prose>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-12">
          <Link
            href="/blog"
            className="text-sm text-accent hover:text-accent-hover"
          >
            ← Back to journal
          </Link>
          <Link
            href="/contact"
            className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-ink-50 hover:bg-accent-hover"
          >
            Talk to us
          </Link>
        </div>
      </div>
    </article>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return <div className="article-prose space-y-6">{children}</div>;
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-base leading-relaxed text-ink-200 sm:text-lg sm:leading-[1.75]">
      {children}
    </p>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-14 font-serif text-3xl text-ink-50 sm:text-4xl">
      {children}
    </h2>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-10 font-serif text-2xl text-ink-50 sm:text-3xl">
      {children}
    </h3>
  );
}

export function Pullquote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-10 border-l-2 border-accent pl-6 font-serif text-2xl leading-snug text-ink-100 sm:text-3xl">
      {children}
    </blockquote>
  );
}

export function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="space-y-2 pl-5 text-base text-ink-200 sm:text-lg [&>li]:list-disc [&>li]:marker:text-accent">
      {children}
    </ul>
  );
}
