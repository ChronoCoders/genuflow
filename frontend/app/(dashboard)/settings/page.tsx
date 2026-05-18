import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { me } from "@/lib/api";
import { sessionCookieHeader } from "@/lib/server-api";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await me(sessionCookieHeader());

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Account and brand configuration."
      />

      <div className="grid max-w-2xl grid-cols-1 gap-6">
        <Card>
          <div className="text-xs uppercase tracking-wider text-ink-500">
            Brand
          </div>
          <div className="mt-3 font-serif text-2xl text-ink-50">
            {user.brand_name}
          </div>
          <p className="mt-2 text-xs text-ink-500">
            Brand renaming is not yet supported.
          </p>
        </Card>

        <Card>
          <div className="text-xs uppercase tracking-wider text-ink-500">
            Account
          </div>
          <div className="mt-3 text-ink-100">{user.email}</div>
          <p className="mt-2 text-xs text-ink-500">
            Password reset and team invitations are planned for a future
            release.
          </p>
        </Card>

        <Card>
          <div className="text-xs uppercase tracking-wider text-ink-500">
            Identifiers
          </div>
          <dl className="mt-3 space-y-2 text-xs">
            <div className="flex gap-3">
              <dt className="w-24 text-ink-500">User ID</dt>
              <dd className="break-all font-mono text-ink-300">{user.user_id}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-24 text-ink-500">Brand ID</dt>
              <dd className="break-all font-mono text-ink-300">{user.brand_id}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </>
  );
}
