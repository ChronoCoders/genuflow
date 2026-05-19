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
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export function ContactForm() {
  const [mode, setMode] = useState<Mode>({ kind: "idle" });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMode({ kind: "submitting" });

    const subject = company.trim()
      ? `${topic} — ${company.trim()}`
      : topic;

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject,
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        let detail = "Something went wrong. Please try again.";
        try {
          const body = (await res.json()) as { error?: string };
          if (body.error) detail = body.error;
        } catch {
          // body wasn't JSON
        }
        setMode({ kind: "error", message: detail });
        return;
      }
      setMode({ kind: "success" });
    } catch (err) {
      const detail =
        err instanceof Error ? err.message : "Network error. Please try again.";
      setMode({ kind: "error", message: detail });
    }
  }

  if (mode.kind === "success") {
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
          Message sent.
        </h3>
        <p className="mt-3 text-sm text-ink-300">
          We answer founders and creative directors personally, usually
          within the business day. A copy was sent to{" "}
          <span className="text-ink-100">{email || "your address"}</span>.
        </p>
      </div>
    );
  }

  const submitting = mode.kind === "submitting";
  const error = mode.kind === "error" ? mode.message : null;

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
            disabled={submitting}
            className="block w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={submitting}
            className="block w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
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
          disabled={submitting}
          className="block w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
        />
      </Field>

      <Field label="Topic">
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={submitting}
          className="block w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
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
          maxLength={5000}
          disabled={submitting}
          className="block w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
        />
      </Field>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-ink-500">
          We answer personally, usually within the business day.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-medium text-ink-50 transition hover:bg-accent-hover disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send message"}
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
