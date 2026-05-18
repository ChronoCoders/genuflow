import Link from "next/link";

import { PageHero } from "@/components/marketing/section";

export const metadata = {
  title: "Journal — Genuflow",
  description:
    "Writing on authentication, the Digital Product Passport, the counterfeit economy, and the cryptographic spine that holds them together.",
};

const POSTS = [
  {
    slug: "eu-dpp-regulation",
    title: "The EU Digital Product Passport, explained",
    excerpt:
      "What the ESPR actually says, when delegated acts arrive, and what fashion brands should be building this year to avoid a panic in 2026.",
    category: "Regulation",
    date: "May 14, 2026",
    readTime: "9 min read",
  },
  {
    slug: "counterfeit-statistics",
    title: "The counterfeit economy is bigger than you think",
    excerpt:
      "OECD data puts the global trade in counterfeit goods at hundreds of billions of dollars annually. The implications for luxury and fashion are larger still.",
    category: "Industry",
    date: "May 02, 2026",
    readTime: "7 min read",
  },
  {
    slug: "blockchain-authentication",
    title: "How blockchain authentication actually works",
    excerpt:
      "A plain-language explanation of how cryptographic anchoring turns a product's history into something verifiable by anyone, without trusting the brand or the platform.",
    category: "Technical",
    date: "Apr 18, 2026",
    readTime: "11 min read",
  },
];

export default function Blog() {
  return (
    <>
      <PageHero
        eyebrow="Journal"
        title={<>Writing on what we do.</>}
        intro="A working journal from inside the company. Regulation, industry context, technical depth — written for the people on the other side of the integration, regardless of which side that is."
      />

      <section>
        <div className="mx-auto w-full max-w-5xl px-6 py-24">
          <div className="divide-y divide-white/5">
            {POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group grid grid-cols-1 gap-6 py-10 transition md:grid-cols-12"
              >
                <div className="md:col-span-3">
                  <div className="text-[10px] uppercase tracking-[0.28em] text-accent">
                    {post.category}
                  </div>
                  <div className="mt-2 text-xs text-ink-500">
                    {post.date} · {post.readTime}
                  </div>
                </div>
                <div className="md:col-span-9">
                  <h2 className="font-serif text-3xl text-ink-50 transition group-hover:text-accent sm:text-4xl">
                    {post.title}
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-300">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 text-sm text-accent">Read article →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
