import { AcceptInviteForm } from "./form";

interface PageProps {
  params: { token: string };
}

export const metadata = {
  title: "Accept invite — Genuflow",
};

export default function AcceptInvitePage({ params }: PageProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <div className="text-[10px] uppercase tracking-[0.32em] text-ink-500">
        Genuflow
      </div>
      <h1 className="mt-6 font-serif text-4xl text-ink-50">
        Accept your invite
      </h1>
      <p className="mt-3 text-sm text-ink-400">
        Choose a password to finish creating your account. You will be
        signed in immediately.
      </p>
      <div className="mt-8">
        <AcceptInviteForm token={params.token} />
      </div>
    </main>
  );
}
