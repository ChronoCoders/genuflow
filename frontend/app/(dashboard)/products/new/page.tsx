"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { ApiError, createProduct } from "@/lib/api";

export default function NewProductPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const fd = new FormData(event.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const external_ref = String(fd.get("external_ref") ?? "").trim() || null;
    const metadataRaw = String(fd.get("metadata") ?? "").trim();

    let metadata: unknown = null;
    if (metadataRaw) {
      try {
        metadata = JSON.parse(metadataRaw);
      } catch {
        setError("Metadata must be valid JSON.");
        setPending(false);
        return;
      }
    }

    try {
      const product = await createProduct({ name, external_ref, metadata });
      router.push(`/products/${product.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Network error. Please try again.",
      );
      setPending(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Register product"
        subtitle="Create a new product identity. You can record events against it once it exists."
      />

      <Card className="max-w-xl">
        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          <FormField
            label="Name"
            name="name"
            required
            placeholder="Mécanique nº 042"
          />
          <FormField
            label="External reference"
            name="external_ref"
            placeholder="SKU-2026-042"
          />
          <label className="block">
            <span className="mb-2 block text-sm text-ink-300">
              Metadata (JSON)
            </span>
            <textarea
              name="metadata"
              rows={6}
              placeholder='{"materials": ["18k gold"], "weight_g": 86}'
              className="block w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 font-mono text-xs text-ink-50 placeholder:text-ink-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <p className="mt-1 text-xs text-ink-500">
              Brand-private. Not shown on the public verification page.
            </p>
          </label>

          {error ? (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button href="/products" variant="secondary">
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create product"}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
