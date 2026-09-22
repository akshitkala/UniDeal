'use client';

import { motion } from 'framer-motion';
import { useMotion, MOTION as M } from '@/lib/motion-variants';

const features = [
  {
    label: 'Structured feed',
    sublabel: 'Search & filter',
    icon: (
      <g>
        <rect x="8" y="14" width="32" height="4" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
        <rect x="8" y="22" width="24" height="4" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border" />
        <rect x="8" y="30" width="28" height="4" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border" />
        <circle cx="36" cy="30" r="7" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-primary" />
        <line x1="41" y1="35" x2="45" y2="39" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary" />
      </g>
    ),
  },
  {
    label: 'Protected contact',
    sublabel: 'WhatsApp via server',
    icon: (
      <g>
        <path d="M24 6 L38 11 L38 24 C38 32 24 38 24 38 C24 38 10 32 10 24 L10 11 Z"
          fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="text-primary" />
        <circle cx="24" cy="22" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
        <line x1="24" y1="27" x2="24" y2="32" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
      </g>
    ),
  },
  {
    label: 'Free to use',
    sublabel: 'Always, no ads',
    icon: (
      <g>
        <path d="M10 10 L28 10 L38 20 L28 30 L10 30 Z"
          fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="text-primary" />
        <circle cx="16" cy="20" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
        <text x="24" y="23" fontSize="8" fontWeight="700" fill="currentColor" className="text-primary">₹0</text>
        <line x1="32" y1="34" x2="36" y2="38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-border" />
      </g>
    ),
  },
];

export default function IlluBuilt({ inView }: { inView: boolean }) {
  const { staggerContainer, fadeUp, scaleIn, MOTION: MV } = useMotion();

  return (
    <motion.div
      variants={staggerContainer(MV.stagger.loose)}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className="w-full max-w-[360px] mx-auto grid grid-cols-3 gap-3"
      aria-hidden="true"
    >
      {features.map(({ label, sublabel, icon }, i) => (
        <motion.div
          key={label}
          variants={fadeUp(MV.offset.md, MV.duration.entrance, i * MV.stagger.veryLoose)}
          className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border bg-white"
        >
          <motion.div
            variants={scaleIn(0.8, 1, MV.duration.entranceFast, 0.12 + i * MV.stagger.normal)}
          >
            <svg viewBox="0 0 48 48" className="w-12 h-12">{icon}</svg>
          </motion.div>
          <span className="text-[11px] font-semibold text-neutral-text text-center leading-tight">{label}</span>
          <span className="text-[10px] text-neutral-muted text-center leading-tight">{sublabel}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}
