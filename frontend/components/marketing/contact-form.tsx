"use client";

import { useState } from "react";

const TOPICS = [
  "Request access",
  "Pricing for my brand",
  "Integration question",
  "Press inquiry",
  "Something else",
];

type Mode =
  | { kind: "idle" }
  | { kind: "submitted"; mailto: string };

export function ContactForm() {
  const [mode, setMode] = useState<Mode>({ kind: "idle" });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Brand / company: ${company}`,
      `Topic: ${topic}`,
      "",
      message,
    ].join("\n");
    const subject = `Genuflow inquiry — ${topic}`;
    const mailto = `mailto:hello@genuflow.com?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setMode({ kind: "submitted", mailto });
  }

  if (mode.kind === "submitted") {
    return (
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h3 className="mt-6 font-serif text-2xl text-ink-50">
          Your email client should open.
        </h3>
        <p className="mt-3 text-sm text-ink-300">
          If nothing happened,{" "}
          <a
            href={mode.mailto}
            className="text-accent hover:text-accent-hover"
          >
            click here to compose manually
          </a>
          , or write to{" "}
          <a
            href="mailto:hello@genuflow.com"
            className="text-accent hover:text-accent-hover"
          >
            hello@genuflow.com
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Name">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className="block w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="block w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </Field>
      </div>

      <Field label="Brand or company">
        <input
          type="text"
          required
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          autoComplete="organization"
          className="block w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </Field>

      <Field label="Topic">
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="block w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Tell us a little about what you're looking for">
        <textarea
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="block w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </Field>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-ink-500">
          We answer personally, usually within the business day.
        </p>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-medium text-ink-50 transition hover:bg-accent-hover"
        >
          Send message
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-wider text-ink-500">
        {label}
      </span>
      {children}
    </label>
  );
}
