"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { logout } from "@/lib/api";

interface NavItem {
  href: string;
  label: string;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/products", label: "Products" },
  { href: "/events", label: "Events" },
  { href: "/qr-codes", label: "QR codes" },
  { href: "/anchors", label: "Anchors" },
  { href: "/api-keys", label: "API keys" },
  { href: "/settings", label: "Settings" },
];

interface SidebarProps {
  brandName: string;
  email: string;
}

export function Sidebar({ brandName, email }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function onLogout() {
    try {
      await logout();
    } catch {
      // even if the call fails, send the user to login
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-ink-800 bg-ink-950 p-6">
      <Link href="/dashboard" className="font-serif text-2xl text-ink-50">
        Genuflow
      </Link>

      <div className="mt-1 text-xs text-ink-500">{brandName}</div>

      <nav className="mt-10 flex flex-1 flex-col gap-1 text-sm">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 transition ${
                active
                  ? "bg-ink-800 text-ink-50"
                  : "text-ink-400 hover:bg-ink-900 hover:text-ink-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-ink-800 pt-4">
        <div className="truncate text-xs text-ink-500" title={email}>
          {email}
        </div>
        <button
          onClick={onLogout}
          className="mt-3 text-xs text-ink-400 hover:text-ink-100"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
