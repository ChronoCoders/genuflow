"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/button";
import {
  type BulkProductItem,
  type BulkProductResponse,
  bulkImportCsv,
  bulkImportJson,
} from "@/lib/api";

type Tab = "json" | "csv";

interface ImportButtonProps {
  className?: string;
}

export function ImportButton({ className }: ImportButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setOpen(true)}
        className={className}
      >
        Import
      </Button>
      {open ? <ImportModal onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function ImportModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("json");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkProductResponse | null>(null);

  const [json, setJson] = useState<string>(EXAMPLE_JSON);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  async function submit() {
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      if (tab === "json") {
        let parsed: unknown;
        try {
          parsed = JSON.parse(json);
        } catch (e) {
          setError(
            e instanceof Error ? `Invalid JSON: ${e.message}` : "Invalid JSON",
          );
          setSubmitting(false);
          return;
        }
        if (!Array.isArray(parsed)) {
          setError("JSON must be an array of product objects.");
          setSubmitting(false);
          return;
        }
        const items = parsed as BulkProductItem[];
        const resp = await bulkImportJson(items);
        setResult(resp);
        if (resp.created > 0) router.refresh();
      } else {
        if (!csvFile) {
          setError("Choose a CSV file first.");
          setSubmitting(false);
          return;
        }
        const resp = await bulkImportCsv(csvFile);
        setResult(resp);
        if (resp.created > 0) router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/80 p-6 backdrop-blur"
      role="dialog"
      aria-modal="true"
    >
      <div className="my-12 w-full max-w-2xl rounded-xl border border-ink-800 bg-ink-900 p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-ink-50">Import products</h2>
          <button
            onClick={onClose}
            className="text-sm text-ink-400 hover:text-ink-100"
            aria-label="Close"
          >
            Close
          </button>
        </div>

        {result ? (
          <ImportResult result={result} onClose={onClose} />
        ) : (
          <>
            <div className="mb-6 flex gap-1 border-b border-ink-800">
              <TabButton
                active={tab === "json"}
                onClick={() => setTab("json")}
                label="Paste JSON"
              />
              <TabButton
                active={tab === "csv"}
                onClick={() => setTab("csv")}
                label="Upload CSV"
              />
            </div>

            {tab === "json" ? (
              <JsonPane value={json} onChange={setJson} />
            ) : (
              <CsvPane file={csvFile} onChange={setCsvFile} />
            )}

            {error ? (
              <p className="mt-4 text-sm text-red-300">{error}</p>
            ) : null}

            <div className="mt-6 flex items-center justify-between text-xs text-ink-500">
              <span>Up to 1,000 products per import.</span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button onClick={submit} disabled={submitting}>
                  {submitting ? "Importing…" : "Import"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2 text-sm transition ${
        active
          ? "border-accent text-ink-50"
          : "border-transparent text-ink-400 hover:text-ink-100"
      }`}
    >
      {label}
    </button>
  );
}

function JsonPane({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-wider text-ink-500">
          JSON array
        </span>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={14}
          spellCheck={false}
          className="block w-full rounded-md border border-ink-700 bg-ink-950 px-3 py-2 font-mono text-xs text-ink-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </label>
      <p className="mt-2 text-xs text-ink-500">
        Each item supports <code className="text-ink-300">name</code>,{" "}
        <code className="text-ink-300">external_ref</code>, and{" "}
        <code className="text-ink-300">metadata</code> (free-form JSON).
      </p>
    </div>
  );
}

function CsvPane({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  return (
    <div>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-wider text-ink-500">
          CSV file
        </span>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          className="block w-full cursor-pointer rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-200 file:mr-4 file:rounded file:border-0 file:bg-ink-800 file:px-3 file:py-1 file:text-xs file:text-ink-100"
        />
      </label>
      {file ? (
        <p className="mt-2 text-xs text-ink-400">
          Selected: <span className="text-ink-200">{file.name}</span> (
          {Math.round(file.size / 1024)} KB)
        </p>
      ) : null}
      <p className="mt-3 text-xs text-ink-500">
        Required column: <code className="text-ink-300">name</code>. Optional:{" "}
        <code className="text-ink-300">external_ref</code>,{" "}
        <code className="text-ink-300">metadata_json</code> (a JSON object as a
        string).
      </p>
      <details className="mt-3 text-xs">
        <summary className="cursor-pointer text-ink-400 hover:text-ink-200">
          Show example CSV
        </summary>
        <pre className="mt-2 overflow-x-auto rounded-md border border-ink-800 bg-ink-950 p-3 font-mono text-[11px] text-ink-300">
          {EXAMPLE_CSV}
        </pre>
      </details>
    </div>
  );
}

function ImportResult({
  result,
  onClose,
}: {
  result: BulkProductResponse;
  onClose: () => void;
}) {
  return (
    <div>
      <div className="rounded-md border border-accent/30 bg-accent/5 p-4">
        <div className="font-serif text-xl text-ink-50">
          {result.created} {result.created === 1 ? "product" : "products"}{" "}
          created
        </div>
        {result.failed.length > 0 ? (
          <p className="mt-1 text-sm text-ink-300">
            {result.failed.length}{" "}
            {result.failed.length === 1 ? "item" : "items"} skipped due to
            validation errors.
          </p>
        ) : null}
      </div>

      {result.failed.length > 0 ? (
        <div className="mt-6">
          <h3 className="font-serif text-lg text-ink-50">Failed items</h3>
          <div className="mt-3 overflow-x-auto rounded-md border border-ink-800">
            <table className="w-full text-sm">
              <thead className="bg-ink-950 text-[10px] uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-3 py-2 text-left">Index</th>
                  <th className="px-3 py-2 text-left">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800">
                {result.failed.map((f) => (
                  <tr key={f.index}>
                    <td className="px-3 py-2 font-mono text-xs text-ink-400">
                      {f.index}
                    </td>
                    <td className="px-3 py-2 text-ink-200">{f.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex justify-end">
        <Button onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}

const EXAMPLE_JSON = `[
  {
    "name": "Cashmere Coat",
    "external_ref": "AW25-COAT-0001",
    "metadata": { "size": "44 IT", "collection": "AW25" }
  },
  {
    "name": "Cashmere Coat",
    "external_ref": "AW25-COAT-0002"
  }
]`;

const EXAMPLE_CSV = `name,external_ref,metadata_json
Cashmere Coat,AW25-COAT-0001,"{""size"":""44 IT"",""collection"":""AW25""}"
Cashmere Coat,AW25-COAT-0002,
Leather Belt,AW25-BELT-0007,"{""color"":""tan""}"
`;
