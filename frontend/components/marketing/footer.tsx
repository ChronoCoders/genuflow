import Link from "next/link";

const PRODUCT = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Documentation" },
];

const USE_CASES = [
  { href: "/use-cases/luxury", label: "Luxury goods" },
  { href: "/use-cases/fashion-textiles", label: "Fashion & textiles" },
  { href: "/use-cases/watches-jewelry", label: "Watches & jewelry" },
];

const RESOURCES = [
  { href: "/blog", label: "Journal" },
  { href: "/resources", label: "Whitepapers" },
  { href: "/docs", label: "Developers" },
];

const COMPANY = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Sign in" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/5 bg-ink-950">
      <div className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="font-serif text-3xl text-ink-50">
              Genuflow
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-400">
              Cryptographic provenance for the goods that hold their value.
              Built for fashion houses, ateliers, and the brands that take
              counterfeit seriously.
            </p>
          </div>

          <FooterColumn title="Product" links={PRODUCT} />
          <FooterColumn title="Use cases" links={USE_CASES} />
          <FooterColumn title="Resources" links={RESOURCES} />
        </div>

        <div className="mt-12 grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-2" />
          <FooterColumn title="Company" links={COMPANY} />
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/5 pt-8 text-xs text-ink-500 md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} Genuflow. All rights reserved.</div>
          <div className="flex gap-6">
            <span>Anchored to Base mainnet</span>
            <Link href="/contact" className="hover:text-ink-300">
              hello@genuflow.com
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.28em] text-ink-500">
        {title}
      </div>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-ink-300 transition hover:text-ink-50"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
