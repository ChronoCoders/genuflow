import { redirect } from "next/navigation";

import { Sidebar } from "@/components/sidebar";
import { me } from "@/lib/api";
import { sessionCookieHeader } from "@/lib/server-api";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieHeader = sessionCookieHeader();
  if (!cookieHeader) redirect("/login");

  let user;
  try {
    user = await me(cookieHeader);
  } catch {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar brandName={user.brand_name} email={user.email} />
      <main className="flex-1 overflow-y-auto px-10 py-10">{children}</main>
    </div>
  );
}
