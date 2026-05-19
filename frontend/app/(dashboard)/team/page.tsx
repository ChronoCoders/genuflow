import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { type TeamResponse, getTeam, me } from "@/lib/api";
import { sessionCookieHeader } from "@/lib/server-api";

import { TeamPanel } from "./panel";

export const dynamic = "force-dynamic";

async function load(): Promise<
  | { team: TeamResponse; current_user_id: string }
  | { error: string }
> {
  try {
    const cookie = sessionCookieHeader();
    const [team, meResp] = await Promise.all([getTeam(cookie), me(cookie)]);
    return { team, current_user_id: meResp.user_id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to load" };
  }
}

export default async function TeamPage() {
  const data = await load();

  if ("error" in data) {
    return (
      <>
        <PageHeader title="Team" />
        <Card className="text-sm text-red-300">{data.error}</Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Team"
        subtitle="Members of your brand and pending invitations."
      />
      <TeamPanel
        initial={data.team}
        currentUserId={data.current_user_id}
      />
    </>
  );
}
