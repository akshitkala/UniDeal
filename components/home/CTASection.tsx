'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

export default function CTASection() {
  const reduced = useReducedMotion();

  return (
    <section className="bg-white border-t border-border">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="rounded-xl border border-primary/20 bg-primary/5 px-8 py-12 text-center space-y-5"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-text font-heading">
            Ready to find something — or clear out your room?
          </h2>
          <p className="text-neutral-muted max-w-md mx-auto">
            Free. No ads. Built by a student for students.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
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
          </div>
        </motion.div>
      </div>
    </section>
  );
}
