'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { PackagePlus, Search, MessageCircle } from 'lucide-react';

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
  const reduced = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : 0.14 } },
  };

  const item = {
    hidden: { opacity: 0, y: reduced ? 0 : 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <section className="bg-white border-b border-border">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">How it works</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-text font-heading">
            Three steps from listing to deal.
          </h2>
        </motion.div>

        <motion.ol
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid sm:grid-cols-3 gap-6"
          aria-label="How UniDeal works"
        >
          {steps.map(({ icon: Icon, label, body, step }) => (
            <motion.li
              key={label}
              variants={item}
              className="group relative flex flex-col gap-4 p-6 rounded-lg border border-border bg-white hover:border-primary/30 transition-colors duration-200"
            >
              {/* Step number — decorative */}
              <span
                className="absolute top-4 right-4 text-3xl font-extrabold text-neutral-text/5 font-display select-none"
                aria-hidden="true"
              >
                {step}
              </span>

              <div
                className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors duration-200"
                aria-hidden="true"
              >
                <Icon className="w-5 h-5" />
              </div>

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

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.4, delay: 0.2 }}
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
