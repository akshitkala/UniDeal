'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import IlluAlmirah from '@/components/about/IlluAlmirah';
import IlluWall from '@/components/about/IlluWall';
import IlluGap from '@/components/about/IlluGap';
import IlluPositioning from '@/components/about/IlluPositioning';
import IlluBuilt from '@/components/about/IlluBuilt';

// ─── Shared animation helpers ────────────────────────────────────────────────

function useSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  return { ref, inView };
}

function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: reduced ? 0 : delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-3">
      {children}
    </p>
  );
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <FadeUp delay={0.15}>
      <blockquote className="border-l-4 border-primary pl-4 py-1 my-4">
        <p className="text-lg sm:text-xl font-semibold text-neutral-text font-heading leading-snug">
          {children}
        </p>
      </blockquote>
    </FadeUp>
  );
}

// ─── Beat layout: alternates illustration left/right on desktop ──────────────

function Beat({
  label,
  heading,
  pullQuote,
  body,
  illustration,
  flip = false,
  children,
}: {
  label: string;
  heading: string;
  pullQuote?: React.ReactNode;
  body: string;
  illustration: React.ReactNode;
  flip?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section className="border-b border-border last:border-0">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div
          className={`flex flex-col ${flip ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-10 lg:gap-16 items-center`}
        >
          {/* Illustration side */}
          <FadeUp delay={0.05} className="w-full lg:w-2/5 flex-shrink-0">
            {illustration}
          </FadeUp>

          {/* Text side */}
          <div className="flex-1 space-y-4">
            <FadeUp delay={0}>
              <SectionLabel>{label}</SectionLabel>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-text font-heading leading-tight">
                {heading}
              </h2>
            </FadeUp>
            {pullQuote && <PullQuote>{pullQuote}</PullQuote>}
            <FadeUp delay={0.2}>
              <p className="text-neutral-muted leading-relaxed">{body}</p>
            </FadeUp>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function OurStoryClient() {
  const almirahSection = useSection();
  const wallSection    = useSection();
  const gapSection     = useSection();
  const posSection     = useSection();
  const builtSection   = useSection();

  return (
    <main className="flex-1 bg-white">

      {/* ── Hero header ───────────────────────────────────────── */}
      <section className="border-b border-border bg-white">
        <div className="container mx-auto px-4 py-14 max-w-5xl">
          <FadeUp>
            <SectionLabel>Our Story</SectionLabel>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-text font-display leading-tight max-w-2xl">
              Built out of frustration.{' '}
              <span className="text-primary">Launched with conviction.</span>
            </h1>
            <p className="text-neutral-muted text-sm mt-4">
              Founded September 2026 · One campus · Zero budget · Built by a student
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── Beat 1: The Almirah ───────────────────────────────── */}
      <div ref={almirahSection.ref} className="bg-surface">
        <Beat
          label="01 — The Almirah"
          heading="Every student has a cupboard full of things they no longer need."
          pullQuote="Textbooks from last semester. An iron. A guitar gathering dust."
          body="After exams, hostel rooms fill up with things that served their purpose and now just sit there — too good to throw away, too inconvenient to sell. The next batch of students is about to need exactly these things. They just can't find each other."
          illustration={<IlluAlmirah inView={almirahSection.inView} />}
        />
      </div>

      {/* ── Beat 2: The Wall ──────────────────────────────────── */}
      <div ref={wallSection.ref} className="bg-white">
        <Beat
          label="02 — The Wall"
          heading="The WhatsApp group was supposed to fix this. It didn't."
          pullQuote="Posted at 11 AM. Buried by noon."
          body="No search. No filter. No way to know if an item was still available. A listing posted in the morning disappeared under 40 messages before a single interested buyer could respond. The group became noise — and sellers gave up posting."
          illustration={<IlluWall inView={wallSection.inView} />}
          flip
        />
      </div>

      {/* ── Beat 3: The Gap ───────────────────────────────────── */}
      <div ref={gapSection.ref} className="bg-surface">
        <Beat
          label="03 — The Gap"
          heading="Supply and demand existed. The connection didn't."
          pullQuote="The right two people were both on campus — they just couldn't find each other."
          body="This wasn't a niche problem. Every semester, across every hostel block: sellers with good stuff, buyers who needed exactly that stuff, and no reliable way to bridge them. The gap wasn't a lack of items — it was a lack of infrastructure."
          illustration={<IlluGap inView={gapSection.inView} />}
        />
      </div>

      {/* ── Beat 4: Positioning ───────────────────────────────── */}
      <div ref={posSection.ref} className="bg-white">
        <Beat
          label="04 — Why Not OLX?"
          heading="City marketplaces weren't built for campus trust."
          body="OLX and similar platforms work at city scale — where you meet strangers. Campus is different. Proximity and shared context are the trust signal. A verified student two blocks away is a fundamentally different seller than an anonymous city listing. No existing platform understood that distinction."
          illustration={<IlluPositioning inView={posSection.inView} />}
          flip
        >
          <FadeUp delay={0.25}>
            <div className="mt-2 p-4 rounded-lg border border-border bg-surface text-sm text-neutral-muted leading-relaxed">
              UniDeal isn&rsquo;t competing with OLX. It&rsquo;s solving a problem OLX doesn&rsquo;t have — intra-campus trust at walking distance.
            </div>
          </FadeUp>
        </Beat>
      </div>

      {/* ── Beat 5: What Was Built ────────────────────────────── */}
      <div ref={builtSection.ref} className="bg-surface">
        <Beat
          label="05 — What We Built"
          heading="Three things. Nothing more."
          body="A structured, searchable feed where listings don't disappear. A protected contact reveal — your phone number never shown, only a WhatsApp link built server-side. And it's free, always. No promoted listings, no ads, no premium tier."
          illustration={<IlluBuilt inView={builtSection.inView} />}
        />
      </div>

      {/* ── Beat 6: Who Built It — modest, deliberately plain ─── */}
      <section className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <FadeUp>
            <SectionLabel>06 — Who Built It</SectionLabel>
          </FadeUp>
          <div className="mt-6 max-w-xl">
            <FadeUp delay={0.1}>
              {/* Intentionally minimal founder card */}
              <div className="flex items-start gap-4 p-5 rounded-lg border border-border bg-surface">
                <div className="w-10 h-10 rounded-full border-2 border-border bg-white flex items-center justify-center flex-shrink-0 text-sm font-bold text-neutral-text font-heading">
                  A
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-text">Akshit Kala</p>
                  <p className="text-xs text-neutral-muted mt-0.5">Student · Solo builder · Built this because it annoyed him</p>
                  <p className="text-sm text-neutral-muted mt-3 leading-relaxed">
                    No team. No funding. Built entirely from personal frustration during a semester
                    where every attempt to sell or find something on campus ended the same way —
                    a WhatsApp scroll that went nowhere.
                  </p>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Footer — low CTA emphasis per design.md §7.9 ─────── */}
      <section className="bg-white">
        <FadeUp className="container mx-auto px-4 py-10 max-w-5xl">
          <p className="text-sm text-neutral-muted">
            Questions or ideas?{' '}
            <Link
              href="/contact"
              className="text-primary underline underline-offset-2 hover:text-primary-hover focus:outline-none focus:ring-2 focus:ring-primary rounded"
            >
              Reach out
            </Link>
            . We read everything.
          </p>
        </FadeUp>
      </section>

    </main>
  );
}
