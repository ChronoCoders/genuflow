"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/table";
import {
  type CreateInviteResponse,
  type TeamMember,
  type TeamResponse,
  type UserRole,
  changeRole,
  getTeam,
  inviteMember,
  removeMember,
  revokeInvite,
} from "@/lib/api";

const ROLE_LABEL: Record<UserRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

interface PanelProps {
  initial: TeamResponse;
  currentUserId: string;
}

export function TeamPanel({ initial, currentUserId }: PanelProps) {
  const [team, setTeam] = useState<TeamResponse>(initial);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<CreateInviteResponse | null>(null);

  const me = useMemo(
    () => team.members.find((m) => m.id === currentUserId),
    [team.members, currentUserId],
  );
  const isOwner = me?.role === "owner";
  const isAdminOrOwner = isOwner || me?.role === "admin";

  async function refresh() {
    try {
      setTeam(await getTeam());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh");
    }
  }

  async function onInvite(email: string, role: "admin" | "member") {
    setError(null);
    try {
      const resp = await inviteMember(email, role);
      setRevealed(resp);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite");
    }
  }

  async function onRevokeInvite(id: string) {
    if (!confirm("Revoke this invite?")) return;
    setError(null);
    try {
      await revokeInvite(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke");
    }
  }

  async function onRemoveMember(member: TeamMember) {
    if (
      !confirm(
        `Remove ${member.email} from the brand? They will lose access immediately.`,
      )
    ) {
      return;
    }
    setError(null);
    try {
      await removeMember(member.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member");
    }
  }

  async function onChangeRole(member: TeamMember, role: UserRole) {
    setError(null);
    try {
      await changeRole(member.id, role);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change role");
    }
  }

  return (
    <>
      {revealed ? (
        <RevealedInvite data={revealed} onClose={() => setRevealed(null)} />
      ) : null}

      {error ? (
        <Card className="mb-6 text-sm text-red-300">{error}</Card>
      ) : null}

      {isAdminOrOwner ? (
        <InviteForm onSubmit={onInvite} />
      ) : (
        <Card className="mb-6 text-sm text-ink-400">
          Only owners and admins can invite new members.
        </Card>
      )}

      <h2 className="mt-10 font-serif text-xl text-ink-50">Members</h2>
      <div className="mt-4">
        <Table>
          <THead>
            <TR>
              <TH>Email</TH>
              <TH>Role</TH>
              <TH>Joined</TH>
              <TH><span className="sr-only">Actions</span></TH>
            </TR>
          </THead>
          <TBody>
            {team.members.map((m) => (
              <TR key={m.id}>
                <TD className="font-medium text-ink-50">
                  {m.email}
                  {m.id === currentUserId ? (
                    <span className="ml-2 text-xs text-ink-500">(you)</span>
                  ) : null}
                </TD>
                <TD>
                  {isOwner && m.id !== currentUserId ? (
                    <select
                      value={m.role}
                      onChange={(e) =>
                        onChangeRole(m, e.target.value as UserRole)
                      }
                      className="rounded-md border border-ink-700 bg-ink-900 px-2 py-1 text-xs text-ink-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                    </select>
                  ) : (
                    <RolePill role={m.role} />
                  )}
                </TD>
                <TD>{new Date(m.created_at).toLocaleDateString()}</TD>
                <TD className="text-right">
                  {isOwner && m.id !== currentUserId ? (
                    <button
                      onClick={() => onRemoveMember(m)}
                      className="text-xs text-red-300 hover:text-red-200"
                    >
                      Remove
                    </button>
                  ) : null}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>

      {team.invites.length > 0 ? (
        <>
          <h2 className="mt-10 font-serif text-xl text-ink-50">
            Pending invites
          </h2>
          <div className="mt-4">
            <Table>
              <THead>
                <TR>
                  <TH>Email</TH>
                  <TH>Role</TH>
                  <TH>Expires</TH>
                  <TH><span className="sr-only">Actions</span></TH>
                </TR>
              </THead>
              <TBody>
                {team.invites.map((inv) => (
                  <TR key={inv.id}>
                    <TD className="font-medium text-ink-50">{inv.email}</TD>
                    <TD>
                      <RolePill role={inv.role} />
                    </TD>
                    <TD>{new Date(inv.expires_at).toLocaleString()}</TD>
                    <TD className="text-right">
                      {isAdminOrOwner ? (
                        <button
                          onClick={() => onRevokeInvite(inv.id)}
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
          </div>
        </>
      ) : null}
    </>
  );
}

function RolePill({ role }: { role: UserRole }) {
  const tone =
    role === "owner"
      ? "border-accent/40 bg-accent/10 text-accent"
      : role === "admin"
        ? "border-ink-600 bg-ink-800 text-ink-200"
        : "border-ink-700 bg-ink-900 text-ink-400";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${tone}`}
    >
      {ROLE_LABEL[role]}
    </span>
  );
}

function InviteForm({
  onSubmit,
}: {
  onSubmit: (
    email: string,
    role: "admin" | "member",
  ) => void | Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(email.trim(), role);
      setEmail("");
      setRole("member");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <form
        onSubmit={submit}
        className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_180px_auto]"
      >
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-wider text-ink-500">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@yourbrand.com"
            className="block w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-50 placeholder:text-ink-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-wider text-ink-500">
            Role
          </span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "member")}
            className="block w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <div className="flex items-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Inviting…" : "Send invite"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function RevealedInvite({
  data,
  onClose,
}: {
  data: CreateInviteResponse;
  onClose: () => void;
}) {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/accept-invite/${data.token}`
      : `/accept-invite/${data.token}`;

  return (
    <Card className="mb-6 border-accent/40 bg-accent/5">
      <h3 className="font-serif text-xl text-ink-50">Invite created</h3>
      <p className="mt-2 text-sm text-ink-300">
        Send this link to <span className="text-ink-100">{data.email}</span>.
        It expires {new Date(data.expires_at).toLocaleString()}. The token is
        shown once.
      </p>
      <div className="mt-4 rounded-md border border-ink-700 bg-ink-950 p-4">
        <code className="block break-all font-mono text-sm text-accent">
          {url}
        </code>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button
          variant="secondary"
          onClick={() => navigator.clipboard.writeText(url).catch(() => {})}
        >
          Copy link
        </Button>
        <Button onClick={onClose}>Done</Button>
      </div>
    </Card>
  );
}
