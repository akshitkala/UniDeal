'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useMotion } from '@/lib/motion-variants';
import { useAuth } from '@/contexts/AuthContext';

function StatBadge({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay: number;
}) {
  const { reduced, MOTION: MV } = useMotion();
  return (
    <motion.div
      initial={{ opacity: 0, scale: reduced ? 1 : 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reduced ? 0 : MV.duration.entranceFast, delay, ease: MV.ease.out }}
      className="flex flex-col items-center text-center px-2"
    >
      <span className="text-xl sm:text-2xl font-extrabold text-neutral-text font-display leading-tight">{value}</span>
      <span className="text-xs text-neutral-muted mt-0.5 leading-tight">{label}</span>
    </motion.div>
  );
}

export default function Hero() {
  const { reduced, MOTION: MV } = useMotion();
  const { user, openAuthModal } = useAuth();

  const entrance = (offsetY: number, dur: number, d = 0) => ({
    initial: { opacity: 0, y: reduced ? 0 : offsetY },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0 : dur, delay: reduced ? 0 : d, ease: MV.ease.out },
  });

  const handleSellClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      openAuthModal({ tab: 'login', returnTo: '/sell' });
    }
  };

  return (
    <section className="bg-white border-b border-border overflow-hidden py-10 md:py-14">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
          
          {/* Badge */}
          <motion.div {...entrance(16, 0.45)}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold text-primary mb-3">
              <Shield className="w-3.5 h-3.5" aria-hidden="true" />
              Email-verified accounts
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...entrance(20, 0.55, 0.05)}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-text font-display leading-[1.15]"
          >
            Buy and sell on campus
            <br />
            <span className="text-primary">without the chaos.</span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            {...entrance(14, 0.5, 0.1)}
            className="text-base sm:text-lg text-neutral-muted max-w-xl mx-auto mt-3 sm:mt-4 leading-relaxed"
          >
            No buried WhatsApp messages. A structured, searchable marketplace built for university life.
          </motion.p>

          {/* Buttons */}
          <motion.div
            {...entrance(12, 0.45, 0.16)}
            className="flex flex-col sm:flex-row gap-3 justify-center w-full sm:w-auto pt-4 sm:pt-5"
          >
            <Link
              href="/browse"
              className="py-2.5 px-6 bg-primary text-white rounded-md font-semibold text-base hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 min-h-[44px] flex items-center justify-center"
            >
              Browse Listings
            </Link>
            <Link
              href="/sell"
              onClick={handleSellClick}
              className="py-2.5 px-6 bg-white text-neutral-text border border-border rounded-md font-semibold text-base hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 min-h-[44px] flex items-center justify-center"
            >
              Sell an Item
            </Link>
          </motion.div>

          {/* Stats row directly under the buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.45, delay: reduced ? 0 : 0.22 }}
            className="flex items-center justify-center gap-4 sm:gap-8 pt-5 mt-5 border-t border-border w-full max-w-md mx-auto"
          >
            <StatBadge value="2 min" label="to list an item" delay={0.25} />
            <div className="w-px h-8 bg-border" aria-hidden="true" />
            <StatBadge value="1 tap" label="to open WhatsApp" delay={0.32} />
            <div className="w-px h-8 bg-border" aria-hidden="true" />
            <StatBadge value="₹0" label="to use" delay={0.39} />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
