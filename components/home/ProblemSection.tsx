'use client';

import { motion } from 'framer-motion';
import { MessageSquareX, EyeOff, SearchX } from 'lucide-react';
import { useMotion, MOTION } from '@/lib/motion-variants';

const problems = [
  {
    icon: MessageSquareX,
    heading: 'Listings vanish in hours',
    body: 'A post in a WhatsApp group gets buried under 40 messages by noon. Even great deals disappear before the right buyer sees them.',
    image: '/problem-vanish.jpg'
  },
  {
    icon: EyeOff,
    heading: 'Sellers are anonymous',
    body: "There's no way to know if the poster is a real student on campus, or if the item actually exists.",
    image: '/problem-anonymous.jpg'
  },
  {
    icon: SearchX,
    heading: 'No way to search or filter',
    body: 'Looking for a ₹500 charger? Good luck scrolling through months of messages to find one.',
    image: '/problem-search.jpg'
  },
];

export default function ProblemSection() {
  const { staggerContainer, fadeUp, fadeIn, scaleIn, MOTION: M } = useMotion();

  return (
    <section className="bg-surface border-b border-border">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <motion.div
          variants={fadeUp(M.offset.md, M.duration.entrance)}
          initial="hidden"
          whileInView="show"
          viewport={MOTION.viewport}
          className="mb-12 text-center sm:text-left"
        >
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">The problem</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-text font-heading">
            WhatsApp groups weren&rsquo;t built for this.
          </h2>
        </motion.div>

        <motion.ul
          variants={staggerContainer(MOTION.stagger.loose)}
          initial="hidden"
          whileInView="show"
          viewport={MOTION.viewport}
          className="grid md:grid-cols-3 gap-8"
          aria-label="Problems with WhatsApp groups"
        >
          {problems.map(({ icon: Icon, heading, body, image }, i) => {
            const altOffset = i % 2 === 0 ? M.offset.md : -M.offset.md;
            return (
              <motion.li
                key={heading}
                variants={fadeUp(altOffset, M.duration.entrance)}
                className="flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm"
              >
                <div className="relative aspect-[4/3] w-full bg-neutral-50 overflow-hidden border-b border-border">
                  <img src={image} alt={heading} className="w-full h-full object-cover object-top" loading="lazy" />
                </div>
                <div className="flex flex-col gap-4 p-6 sm:p-8 flex-1">
                  <motion.div
                    variants={scaleIn(0.8, 1, M.duration.entrance, 0.08)}
                    className="w-12 h-12 rounded-lg bg-danger/10 text-danger flex items-center justify-center flex-shrink-0"
                    aria-hidden="true"
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-text mb-2">{heading}</h3>
                    <p className="text-sm text-neutral-muted leading-relaxed">{body}</p>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>

        {/* Bridge line */}
        <motion.p
          variants={fadeIn(M.duration.entrance, 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={MOTION.viewport}
          className="mt-8 text-sm text-neutral-muted max-w-xl"
        >
          UniDeal is the structured layer that was missing — discovery and trust on one clean page,
          deal still closes on WhatsApp.
        </motion.p>
      </div>
    </section>
  );
}
