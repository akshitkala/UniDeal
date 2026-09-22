'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { MessageSquareX, Layers, Handshake, Rocket } from 'lucide-react';

const chapters = [
  {
    icon: MessageSquareX,
    tag: 'The frustration',
    heading: 'It started with a WhatsApp group',
    body: "A charger listed at 11 AM was buried under 40 messages by noon. The seller was anonymous. The buyer had no way to tell if the item was real, or if the person was even on campus. Sound familiar?",
  },
  {
    icon: Layers,
    tag: 'The insight',
    heading: 'Students needed a structured layer',
    body: "We built UniDeal as the layer that was missing — a place where listings don't disappear, where sellers are verified students, and where finding something takes seconds, not scrolling through a year's worth of group chat history.",
  },
  {
    icon: Handshake,
    tag: 'The philosophy',
    heading: 'The deal still closes on WhatsApp',
    body: "We're not trying to replace WhatsApp — we're making sure the right two people find each other first. Discovery and trust are the problem. UniDeal is the fix for that part.",
  },
  {
    icon: Rocket,
    tag: "What's next",
    heading: 'Starting at one campus',
    body: "No VC backing, no ads in your face, no artificial urgency. Just a clean, honest tool for student-to-student commerce — and if it works here, it'll work everywhere.",
  },
];

export default function OurStoryClient() {
  const reduced = useReducedMotion();

  function fadeUp(delay = 0) {
    return {
      initial: { opacity: 0, y: reduced ? 0 : 18 },
      whileInView: { opacity: 1, y: 0 } as const,
      viewport: { once: true, amount: 0.25 as const },
      transition: { duration: 0.5, delay, ease: 'easeOut' },
    };
  }

  return (
    <main className="flex-1">
      {/* ── Header ── */}
      <section className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-14 max-w-2xl">
          <motion.div {...fadeUp(0)}>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              Our Story
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-text font-display leading-tight mb-4">
              Built out of frustration.{' '}
              <span className="text-primary">Launched with conviction.</span>
            </h1>
            <p className="text-neutral-muted text-sm">
              Founded September 2026 · Built by a student, for students
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Story chapters ── */}
      <section className="bg-surface">
        <div className="container mx-auto px-4 py-14 max-w-2xl space-y-5">
          {chapters.map(({ icon: Icon, tag, heading, body }, i) => (
            <motion.div
              key={heading}
              {...fadeUp(reduced ? 0 : i * 0.1)}
              className="flex gap-5 p-6 rounded-lg border border-border bg-white"
            >
              <div
                className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5"
                aria-hidden="true"
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-neutral-muted uppercase tracking-widest mb-1">
                  {tag}
                </p>
                <h2 className="text-base font-bold text-neutral-text font-heading mb-2">{heading}</h2>
                <p className="text-sm text-neutral-muted leading-relaxed">{body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Footer note — low CTA emphasis per design.md §7.9 ── */}
      <section className="bg-white border-t border-border">
        <motion.div
          {...fadeUp(0)}
          className="container mx-auto px-4 py-10 max-w-2xl"
        >
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
        </motion.div>
      </section>
    </main>
  );
}
