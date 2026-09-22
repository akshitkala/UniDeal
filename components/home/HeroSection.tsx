'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Tag, Search, MessageCircle, ShieldCheck } from 'lucide-react';
import { useMotion, MOTION as M } from '@/lib/motion-variants';

function IconPill({
  icon: Icon,
  label,
  delay,
  className,
}: {
  icon: React.ElementType;
  label: string;
  delay: number;
  className?: string;
}) {
  const { reduced, MOTION: MV } = useMotion();
  const dur = reduced ? 0 : MV.duration.entranceFast;

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: dur, delay, ease: MV.ease.out }}
      className={className}
    >
      <motion.div
        animate={reduced ? {} : { y: [0, -3, 0] }}
        transition={
          reduced
            ? {}
            : {
                duration: MV.duration.idle,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'mirror' as const,
                delay: delay + 0.6,
              }
        }
        className="flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-full text-xs font-medium text-neutral-text select-none"
      >
        <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" aria-hidden="true" />
        {label}
      </motion.div>
    </motion.div>
  );
}

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
      initial={{ opacity: 0, scale: reduced ? 1 : 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reduced ? 0 : MV.duration.entrance, delay, ease: MV.ease.out }}
      className="flex flex-col items-center"
    >
      <span className="text-2xl font-extrabold text-neutral-text font-display">{value}</span>
      <span className="text-xs text-neutral-muted mt-0.5">{label}</span>
    </motion.div>
  );
}

export default function HeroSection() {
  const { reduced, MOTION: MV } = useMotion();
  const entrance = (offsetY: number, dur: number, d = 0) => ({
    initial: { opacity: 0, y: reduced ? 0 : offsetY },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0 : dur, delay: reduced ? 0 : d, ease: MV.ease.out },
  });

  return (
    <section className="bg-white border-b border-border overflow-hidden">
      <div className="container mx-auto px-4 py-16 sm:py-24 max-w-5xl">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* ── Left: text + CTAs ── */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <motion.div {...entrance(24, 0.65)}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold text-primary mb-4">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                Verified students only
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-text font-display leading-tight">
                Buy and sell on campus
                <br />
                <span className="text-primary">without the chaos.</span>
              </h1>
            </motion.div>

            <motion.p {...entrance(16, 0.5, 0.1)} className="text-lg text-neutral-muted max-w-md mx-auto lg:mx-0">
              No buried WhatsApp messages. No anonymous strangers. A structured, searchable marketplace
              built for university life.
            </motion.p>

            <motion.div {...entrance(12, 0.5, 0.18)} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/browse"
                className="py-3 px-6 bg-primary text-white rounded-md font-semibold text-base hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 min-h-[44px] flex items-center justify-center"
              >
                Browse Listings
              </Link>
              <Link
                href="/sell"
                className="py-3 px-6 bg-white text-neutral-text border border-border rounded-md font-semibold text-base hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 min-h-[44px] flex items-center justify-center"
              >
                Sell an Item
              </Link>
            </motion.div>

            {/* Stat strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.3 }}
              className="flex items-center gap-6 justify-center lg:justify-start pt-4 border-t border-border"
            >
              <StatBadge value="₹0" label="Always free" delay={0.32} />
              <div className="w-px h-8 bg-border" aria-hidden="true" />
              <StatBadge value="6" label="Categories" delay={0.4} />
              <div className="w-px h-8 bg-border" aria-hidden="true" />
              <StatBadge value="1-tap" label="WhatsApp connect" delay={0.48} />
            </motion.div>
          </div>

          {/* ── Right: icon composition ── */}
          <motion.div
            {...entrance(6, 0.7, 0.15)}
            className="hidden lg:flex flex-shrink-0 w-72 h-72 relative items-center justify-center"
            aria-hidden="true"
          >
            <motion.div
              animate={reduced ? {} : { y: [0, -5, 0] }}
              transition={
                reduced
                  ? {}
                  : {
                      duration: MV.duration.idle,
                      ease: 'easeInOut',
                      repeat: Infinity,
                      repeatType: 'mirror' as const,
                      delay: 0.9,
                    }
              }
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Centre circle */}
              <motion.div
                initial={{ opacity: 0, scale: reduced ? 1 : 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: reduced ? 0 : 0.6, ease: MV.ease.out }}
                className="w-24 h-24 rounded-full border-2 border-primary/20 bg-primary/5 flex items-center justify-center"
              >
                <span className="text-3xl font-extrabold text-primary font-display">U</span>
              </motion.div>

              {/* Orbiting pills */}
              <div className="absolute inset-0">
                <IconPill icon={Tag}           label="List in 2 min"       delay={0.25} className="absolute top-4 left-1/2 -translate-x-1/2" />
                <IconPill icon={Search}        label="Search & filter"     delay={0.38} className="absolute top-1/2 right-0 -translate-y-1/2" />
                <IconPill icon={MessageCircle} label="WhatsApp connect"    delay={0.51} className="absolute bottom-4 left-1/2 -translate-x-1/2" />
                <IconPill icon={ShieldCheck}   label="Verified students"   delay={0.64} className="absolute top-1/2 left-0 -translate-y-1/2" />
              </div>

              {/* Connector ring */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduced ? 0 : 0.8, delay: 0.2 }}
                className="absolute w-48 h-48 rounded-full border border-dashed border-border"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
