import Link from "next/link";

export default function VerifyNotFound() {
  return (
    <main className="min-h-screen bg-ink-950">
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="text-[10px] uppercase tracking-[0.32em] text-ink-500">
          Genuflow
        </div>
        <h1 className="mt-6 font-serif text-4xl text-ink-50 sm:text-5xl">
          Item not found
        </h1>
        <p className="mt-4 max-w-md text-sm text-ink-400">
          We could not find a product matching this code. The QR may be
          damaged, or the item may not be registered with Genuflow.
        </p>
        <Link
          href="/"
          className="mt-10 inline-flex items-center text-sm text-accent hover:text-accent-hover"
        >
          Return to Genuflow
        </Link>
      </div>
    </main>
  );
}
