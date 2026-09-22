'use client';

import Link from 'next/link';
import { useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { PackagePlus, Search, MessageCircle, Handshake } from 'lucide-react';
import { useMotion, MOTION as M } from '@/lib/motion-variants';

const steps = [
  {
    icon: PackagePlus,
    label: 'List Your Item',
    body: 'Add photos, set your price, pick a category, and describe the condition. Takes under two minutes.',
  },
  {
    icon: Search,
    label: 'Discover & Filter',
    body: 'Browse by category, condition, and price. Search by keyword. Every listing is from a verified campus student.',
  },
  {
    icon: MessageCircle,
    label: 'Contact on WhatsApp',
    body: "Tap Contact Seller — a pre-filled WhatsApp message opens instantly. No phone number displayed, no guesswork.",
  },
  {
    icon: Handshake,
    label: 'Meet Up & Deal',
    body: 'Agree on a time, meet on campus, hand over the item. Simple, safe, done.',
  },
];

export default function HowItWorksClient() {
  const { fadeUp, scaleIn, cardHover, svgDraw, staggerContainer, reduced } = useMotion();

  const s0 = useRef<HTMLLIElement>(null);
  const s1 = useRef<HTMLLIElement>(null);
  const s2 = useRef<HTMLLIElement>(null);
  const s3 = useRef<HTMLLIElement>(null);
  const stepRefs = [s0, s1, s2, s3];

  const in0 = useInView(s0, { once: false, amount: 0.55 });
  const in1 = useInView(s1, { once: false, amount: 0.55 });
  const in2 = useInView(s2, { once: false, amount: 0.55 });
  const in3 = useInView(s3, { once: false, amount: 0.55 });
  const stepActive = [in0, in1, in2, in3];

  const seg0 = useInView(s1, { once: true, amount: 0.3 });
  const seg1 = useInView(s2, { once: true, amount: 0.3 });
  const seg2 = useInView(s3, { once: true, amount: 0.3 });
  const segActive = [seg0, seg1, seg2];

  const IconFor = useMemo(() => steps.map(s => s.icon), []);

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-14 max-w-2xl">
        <motion.div
          variants={fadeUp(M.offset.lg, M.duration.entranceSlow)}
          initial="hidden"
          animate="show"
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-neutral-text font-heading mb-3 leading-tight">
            How It Works
          </h1>
          <p className="text-neutral-muted text-lg">
            Four steps from listing to done.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical connecting thread — desktop, draws between steps */}
          <svg
            aria-hidden="true"
            className="hidden sm:block absolute left-[21px] top-8 bottom-8 w-0.5 h-[calc(100%-4rem)] pointer-events-none"
            viewBox="0 0 2 100"
            preserveAspectRatio="none"
          >
            {/* Full background thread */}
            <line
              x1="1" y1="0" x2="1" y2="100"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="text-border/60"
            />
            {[0, 1, 2].map((seg) => {
              const start = seg * 33.34;
              const end = (seg + 1) * 33.34;
              return (
                <motion.line
                  key={seg}
                  x1="1" y1={start} x2="1" y2={end}
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-primary"
                  variants={svgDraw(M.duration.draw)}
                  initial="hidden"
                  animate={segActive[seg] ? 'show' : 'hidden'}
                />
              );
            })}
          </svg>

          <motion.ol
            variants={staggerContainer(M.stagger.veryLoose)}
            initial="hidden"
            whileInView="show"
            viewport={M.viewportEarly}
            className="space-y-4 sm:pl-6"
            aria-label="How UniDeal works"
          >
            {steps.map((step, i) => {
              const Icon = IconFor[i];
              const active = stepActive[i] && !reduced;
              return (
                <motion.li
                  key={step.label}
                  ref={stepRefs[i]}
                  variants={fadeUp(M.offset.lg, M.duration.entrance)}
                  {...cardHover}
                  className={`relative flex gap-4 p-6 rounded-lg border bg-white transition-all duration-200 focus-within:ring-2 focus-within:ring-primary ${
                    active ? 'border-primary/40 bg-primary/[0.02]' : 'border-border'
                  }`}
                >
                  <motion.div
                    variants={scaleIn(0.8, 1, M.duration.entranceFast, 0.08)}
                    whileHover={reduced ? {} : { scale: 1.08 }}
                    animate={active ? { scale: 1.04 } : { scale: 1 }}
                    transition={{ duration: M.duration.hover, ease: M.ease.out }}
                    className={`flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center transition-colors duration-200 ${
                      active ? 'bg-primary/15 text-primary' : 'bg-primary/10 text-primary'
                    }`}
                    aria-hidden="true"
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>

                  <motion.div
                    variants={fadeUp(M.offset.sm, M.duration.entrance, 0.05)}
                    className="flex-1"
                  >
                    <motion.span
                      animate={active ? { color: '#15803d' } : { color: '#64748B' }}
                      transition={{ duration: M.duration.hover }}
                      className="text-xs font-semibold uppercase tracking-wide"
                    >
                      Step {i + 1}
                    </motion.span>
                    <h2 className="text-base font-semibold text-neutral-text mt-0.5 mb-1">{step.label}</h2>
                    <p className="text-sm text-neutral-muted leading-relaxed">{step.body}</p>
                  </motion.div>
                </motion.li>
              );
            })}
          </motion.ol>
        </div>

        <motion.div
          variants={fadeUp(M.offset.md, M.duration.entrance, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={M.viewport}
          className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row gap-3"
        >
          <Link
            href="/browse"
            className="py-2.5 px-5 bg-primary text-white rounded-md font-medium text-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 text-center min-h-[44px] flex items-center justify-center"
          >
            Browse Listings
          </Link>
          <Link
            href="/sell"
            className="py-2.5 px-5 bg-white text-neutral-text border border-border rounded-md font-medium text-sm hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 text-center min-h-[44px] flex items-center justify-center"
          >
            Sell an Item
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
