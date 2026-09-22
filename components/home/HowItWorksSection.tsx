'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PackagePlus, Search, MessageCircle } from 'lucide-react';
import { useMotion, MOTION as M } from '@/lib/motion-variants';

const steps = [
  {
    icon: PackagePlus,
    label: 'List your item',
    body: 'Photos, price, condition — done in two minutes.',
    step: '01',
  },
  {
    icon: Search,
    label: 'Buyer finds it',
    body: 'Search, filter by category or condition, sorted by newest or price.',
    step: '02',
  },
  {
    icon: MessageCircle,
    label: 'Connect on WhatsApp',
    body: 'One tap opens a pre-filled chat. Deal closes off-platform.',
    step: '03',
  },
];

export default function HowItWorksSection() {
  const { staggerContainer, fadeUp, scaleIn, fadeIn, svgDraw, cardHover, reduced } = useMotion();

  return (
    <section className="bg-white border-b border-border">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <motion.div
          variants={fadeUp(M.offset.md, M.duration.entrance)}
          initial="hidden"
          whileInView="show"
          viewport={M.viewport}
          className="mb-10"
        >
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">How it works</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-text font-heading">
            Three steps from listing to deal.
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connecting path — desktop only, draws between step icons */}
          <svg
            aria-hidden="true"
            className="hidden sm:block absolute top-14 left-[16.6%] right-[16.6%] w-[66.8%] h-0.5 pointer-events-none"
            viewBox="0 0 100 2"
            preserveAspectRatio="none"
          >
            <motion.line
              x1="0" y1="1" x2="100" y2="1"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="text-border"
              variants={svgDraw(M.duration.draw, 0.1)}
              initial="hidden"
              whileInView="show"
              viewport={M.viewportEarly}
            />
          </svg>

          <motion.ol
            variants={staggerContainer(M.stagger.loose)}
            initial="hidden"
            whileInView="show"
            viewport={M.viewportEarly}
            className="grid sm:grid-cols-3 gap-6 relative z-10"
            aria-label="How UniDeal works"
          >
            {steps.map(({ icon: Icon, label, body, step }) => (
              <motion.li
                key={label}
                variants={fadeUp(M.offset.md, M.duration.entrance)}
                {...cardHover}
                className="group relative flex flex-col gap-4 p-6 rounded-lg border border-border bg-white hover:border-primary/40 hover:bg-primary/[0.02] transition-colors duration-200 focus-within:ring-2 focus-within:ring-primary"
              >
                <span
                  className="absolute top-4 right-4 text-3xl font-extrabold text-neutral-text/5 font-display select-none"
                  aria-hidden="true"
                >
                  {step}
                </span>

                <motion.div
                  variants={scaleIn(0.8, 1, M.duration.entranceFast, 0.1)}
                  whileHover={reduced ? {} : { scale: 1.06 }}
                  transition={{ duration: M.duration.hover, ease: M.ease.out }}
                  className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors duration-200"
                  aria-hidden="true"
                >
                  <Icon className="w-5 h-5" />
                </motion.div>

                <div>
                  <p className="text-[11px] font-semibold text-neutral-muted uppercase tracking-wide mb-1">
                    Step {step}
                  </p>
                  <h3 className="text-base font-semibold text-neutral-text mb-1.5">{label}</h3>
                  <p className="text-sm text-neutral-muted leading-relaxed">{body}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </div>

        <motion.div
          variants={fadeIn(M.duration.entrance, 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={M.viewport}
          className="mt-8"
        >
          <Link
            href="/how-it-works"
            className="text-sm text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
          >
            Full walkthrough →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
