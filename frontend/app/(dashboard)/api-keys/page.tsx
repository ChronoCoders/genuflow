"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { Table, TBody, TD, TH, THead, TR } from "@/components/table";
import {
  type ApiKey,
  createApiKey,
  listApiKeys,
  revokeApiKey,
} from "@/lib/api";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [revealedKey, setRevealedKey] = useState<{
    id: string;
    plain: string;
  } | null>(null);

  async function load() {
    try {
      setKeys(await listApiKeys());
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError(null);
    setCreating(true);

    const label =
      String(new FormData(event.currentTarget).get("label") ?? "").trim() ||
      null;

    try {
      const created = await createApiKey(label);
      setRevealedKey({ id: created.id, plain: created.key });
      event.currentTarget.reset();
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setCreating(false);
    }
  }

  async function onRevoke(id: string) {
    if (!window.confirm("Revoke this API key? Apps using it will stop working.")) {
      return;
    }
    setActionError(null);
    try {
      await revokeApiKey(id);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to revoke");
    }
  }

  return (
    <>
      <PageHeader
        title="API keys"
        subtitle="Programmatic access to /v1/* endpoints. Each key is scoped to this brand."
      />

      {revealedKey ? (
        <Card className="mb-6 border-accent/40 bg-accent/5">
          <div className="text-xs uppercase tracking-wider text-accent">
            Save this key now
          </div>
          <p className="mt-2 text-sm text-ink-200">
            This is the only time the plain key will be shown. Store it
            somewhere safe — you can revoke and rotate it any time.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-md bg-ink-950 p-3 font-mono text-sm text-ink-100">
            {revealedKey.plain}
          </pre>
          <div className="mt-4 flex justify-end">
            <Button
              variant="secondary"
              onClick={() => setRevealedKey(null)}
            >
              I've saved it
            </Button>
          </div>
        </Card>
      ) : null}

      <Card className="mb-8">
        <h2 className="font-serif text-lg text-ink-50">Create new key</h2>
        <form className="mt-4 flex items-end gap-3" onSubmit={onCreate}>
          <div className="flex-1">
            <FormField label="Label (optional)" name="label" placeholder="production-server" />
          </div>
          <Button type="submit" disabled={creating}>
            {creating ? "Creating…" : "Create key"}
          </Button>
        </form>
        {actionError ? (
          <p role="alert" className="mt-3 text-sm text-red-400">
            {actionError}
          </p>
        ) : null}
      </Card>

      {loadError ? (
        <Card className="text-sm text-red-300">{loadError}</Card>
      ) : keys === null ? (
        <p className="text-sm text-ink-400">Loading…</p>
      ) : keys.length === 0 ? (
        <EmptyState
          title="No API keys yet"
          body="Create your first key above to integrate with the API."
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Label</TH>
              <TH>ID</TH>
              <TH>Created</TH>
              <TH>Status</TH>
              <TH>{""}</TH>
            </TR>
          </THead>
          <TBody>
            {keys.map((key) => (
              <TR key={key.id}>
                <TD className="font-medium text-ink-50">
                  {key.label ?? "—"}
                </TD>
                <TD className="font-mono text-xs text-ink-500">
                  {key.id.slice(0, 8)}…
                </TD>
                <TD>{new Date(key.created_at).toLocaleDateString()}</TD>
                <TD>
                  {key.revoked_at ? (
                    <span className="text-ink-500">revoked</span>
                  ) : (
                    <span className="text-accent">active</span>
                  )}
                </TD>
                <TD>
                  {!key.revoked_at ? (
                    <button
                      onClick={() => onRevoke(key.id)}
                      className="text-xs text-red-300 hover:text-red-200"
                    >
                      Revoke
                    </button>
                  ) : null}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </>
  );
}
