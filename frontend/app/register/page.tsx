"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { AuthShell } from "@/components/auth-shell";
import { FormField } from "@/components/form-field";
import { ApiError, register } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const brand_name = String(formData.get("brand_name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      await register({ brand_name, email, password });
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 409
            ? "An account with that email already exists."
            : err.message,
        );
      } else {
        setError("Network error. Please try again.");
      }
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="Create your brand"
      subtitle="Register a brand and start anchoring provenance on day one."
      footer={{
        prompt: "Already have an account?",
        href: "/login",
        label: "Sign in",
      }}
    >
      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <FormField
          label="Brand name"
          name="brand_name"
          autoComplete="organization"
          required
          placeholder="Maison Example"
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@brand.com"
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />

        {error ? (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-ink-950 transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
