'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { MessageSquareX, EyeOff, SearchX } from 'lucide-react';

const problems = [
  {
    icon: MessageSquareX,
    heading: 'Listings vanish in hours',
    body: 'A post in a WhatsApp group gets buried under 40 messages by noon. Even great deals disappear before the right buyer sees them.',
  },
  {
    icon: EyeOff,
    heading: 'Sellers are anonymous',
    body: "There's no way to know if the poster is a real student on campus, or if the item actually exists.",
  },
  {
    icon: SearchX,
    heading: 'No way to search or filter',
    body: 'Looking for a ₹500 charger? Good luck scrolling through months of messages to find one.',
  },
];

export default function ProblemSection() {
  const reduced = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : 0.12 } },
  };

  const item = {
    hidden: { opacity: 0, y: reduced ? 0 : 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  };

  return (
    <section className="bg-surface border-b border-border">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">The problem</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-text font-heading">
            WhatsApp groups weren&rsquo;t built for this.
          </h2>
        </motion.div>

        <motion.ul
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid sm:grid-cols-3 gap-6"
          aria-label="Problems with WhatsApp groups"
        >
          {problems.map(({ icon: Icon, heading, body }) => (
            <motion.li
              key={heading}
              variants={item}
              className="flex flex-col gap-3 p-5 rounded-lg border border-border bg-white"
            >
              <div className="w-9 h-9 rounded-md bg-danger/8 text-danger flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-text mb-1">{heading}</h3>
                <p className="text-sm text-neutral-muted leading-relaxed">{body}</p>
              </div>
            </motion.li>
          ))}
        </motion.ul>

        {/* Bridge line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 text-sm text-neutral-muted max-w-xl"
        >
          UniDeal is the structured layer that was missing — discovery and trust on one clean page,
          deal still closes on WhatsApp.
        </motion.p>
      </div>
    </section>
  );
}
