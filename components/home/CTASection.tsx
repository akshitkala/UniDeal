'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMotion, MOTION as M } from '@/lib/motion-variants';

export default function CTASection() {
  const { fadeUp, staggerContainer } = useMotion();

  return (
    <section className="bg-white border-t border-border">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <motion.div
          variants={fadeUp(M.offset.md, M.duration.entrance)}
          initial="hidden"
          whileInView="show"
          viewport={M.viewport}
          className="rounded-xl border border-primary/20 bg-primary/5 px-8 py-12 text-center"
        >
          <motion.div
            variants={staggerContainer(M.stagger.tight)}
            initial="hidden"
            whileInView="show"
            viewport={M.viewport}
            className="space-y-5"
          >
            <motion.h2
              variants={fadeUp(10, M.duration.entrance)}
              className="text-2xl sm:text-3xl font-bold text-neutral-text font-heading"
            >
              Ready to find something — or clear out your room?
            </motion.h2>
            <motion.p
              variants={fadeUp(8, M.duration.entrance, 0.05)}
              className="text-neutral-muted max-w-md mx-auto"
            >
              Free. No ads. Built by a student for students.
            </motion.p>
            <motion.div
              variants={fadeUp(8, M.duration.entrance, 0.1)}
              className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
            >
              <Link
                href="/browse"
                className="py-2.5 px-6 bg-primary text-white rounded-md font-medium text-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 min-h-[44px] flex items-center justify-center"
              >
                Browse Listings
              </Link>
              <Link
                href="/our-story"
                className="py-2.5 px-6 bg-white text-neutral-text border border-border rounded-md font-medium text-sm hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 min-h-[44px] flex items-center justify-center"
              >
                Our Story
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
