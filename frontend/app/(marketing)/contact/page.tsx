import { ContactForm } from "@/components/marketing/contact-form";
import { Eyebrow, PageHero } from "@/components/marketing/section";

export const metadata = {
  title: "Contact — Genuflow",
  description:
    "Speak with the team. We answer founders and creative directors personally, usually within the day.",
};

export default function Contact() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={<>Let's talk.</>}
        intro="Whether you're a creative director, a CTO, a sustainability lead, or a curious operator — we'd like to hear from you. Tell us what you're building or what you're trying to solve."
      />

      <section className="border-b border-white/5">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-16 px-6 py-24 md:grid-cols-12">
          <aside className="md:col-span-4">
            <Eyebrow>Direct lines</Eyebrow>
            <div className="mt-6 space-y-8 text-sm">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-ink-500">
                  General
                </div>
                <a
                  href="mailto:hello@genuflow.com"
                  className="mt-2 block text-base text-ink-100 hover:text-accent"
                >
                  hello@genuflow.com
                </a>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-ink-500">
                  Sales
                </div>
                <a
                  href="mailto:sales@genuflow.com"
                  className="mt-2 block text-base text-ink-100 hover:text-accent"
                >
                  sales@genuflow.com
                </a>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-ink-500">
                  Press
                </div>
                <a
                  href="mailto:press@genuflow.com"
                  className="mt-2 block text-base text-ink-100 hover:text-accent"
                >
                  press@genuflow.com
                </a>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-ink-500">
                  Offices
                </div>
                <p className="mt-2 text-base leading-relaxed text-ink-300">
                  Istanbul · London
                  <br />
                  Collaborators in Como, Geneva, New York.
                </p>
              </div>
            </div>
          </aside>

          <div className="md:col-span-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
