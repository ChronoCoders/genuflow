"use client";

import { useState } from "react";

import { ApiError, transferOwnership } from "@/lib/api";

interface TransferSectionProps {
  productId: string;
}

type Mode =
  | { kind: "idle" }
  | { kind: "open" }
  | { kind: "submitting" }
  | { kind: "success"; email: string }
  | { kind: "error"; message: string };

export function TransferSection({ productId }: TransferSectionProps) {
  const [mode, setMode] = useState<Mode>({ kind: "idle" });
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setMode({
        kind: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }
    setMode({ kind: "submitting" });
    try {
      await transferOwnership(productId, {
        new_owner_email: trimmedEmail,
        note: note.trim() || null,
      });
      setMode({ kind: "success", email: trimmedEmail });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.";
      setMode({ kind: "error", message });
    }
  }

  if (mode.kind === "success") {
    return (
      <section className="mt-12 rounded-xl border border-accent/30 bg-accent/5 px-6 py-8 text-center">
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
        <h3 className="mt-4 font-serif text-2xl text-ink-50">
          Ownership recorded
        </h3>
        <p className="mt-2 text-sm text-ink-400">
          A transfer event has been added to this item's provenance for{" "}
          <span className="text-ink-200">{mode.email}</span>. It will be
          anchored to Base on the next batch.
        </p>
      </section>
    );
  }

  if (mode.kind === "idle") {
    return (
      <section className="mt-12 rounded-xl border border-ink-800 bg-ink-900/40 p-6 text-center">
        <h3 className="font-serif text-xl text-ink-50">
          New owner?
        </h3>
        <p className="mt-2 text-sm text-ink-400">
          Register this item under your name. The transfer is recorded
          permanently on Base.
        </p>
        <button
          onClick={() => setMode({ kind: "open" })}
          className="mt-5 inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-ink-50 transition hover:bg-accent-hover"
        >
          Register ownership transfer
        </button>
      </section>
    );
  }

  const submitting = mode.kind === "submitting";
  const errorMsg = mode.kind === "error" ? mode.message : null;

  return (
    <section className="mt-12 rounded-xl border border-ink-800 bg-ink-900/40 p-6">
      <div className="flex items-baseline justify-between">
        <h3 className="font-serif text-xl text-ink-50">
          Register ownership
        </h3>
        <button
          type="button"
          onClick={() => setMode({ kind: "idle" })}
          className="text-xs text-ink-500 hover:text-ink-300"
          disabled={submitting}
        >
          Cancel
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-wider text-ink-500">
            Your email
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            className="block w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-50 placeholder:text-ink-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-wider text-ink-500">
            Note <span className="text-ink-600">(optional)</span>
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={submitting}
            maxLength={500}
            rows={3}
            className="block w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-50 placeholder:text-ink-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
            placeholder="Anything you want recorded with the transfer."
          />
        </label>

        {errorMsg ? (
          <p className="text-sm text-red-300">{errorMsg}</p>
        ) : null}

        <div className="flex items-center justify-between text-xs text-ink-500">
          <span>This will be permanently recorded on Base.</span>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-ink-50 transition hover:bg-accent-hover disabled:opacity-60"
          >
            {submitting ? "Recording…" : "Confirm transfer"}
          </button>
        </div>
      </form>
    </section>
  );
}
