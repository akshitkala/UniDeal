'use client';

import { motion, useReducedMotion } from 'framer-motion';

const features = [
  {
    label: 'Structured feed',
    sublabel: 'Search & filter',
    // Magnifying glass over a list
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
    // Shield with link icon inside
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
    // Tag / price with zero
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
  const reduced = useReducedMotion();

  return (
    <div className="w-full max-w-[360px] mx-auto grid grid-cols-3 gap-3" aria-hidden="true">
      {features.map(({ label, sublabel, icon }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: reduced ? 0 : 16 }}
          transition={{ duration: 0.4, delay: reduced ? 0 : i * 0.14, ease: 'easeOut' }}
          className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border bg-white"
        >
          <svg viewBox="0 0 48 48" className="w-12 h-12">{icon}</svg>
          <span className="text-[11px] font-semibold text-neutral-text text-center leading-tight">{label}</span>
          <span className="text-[10px] text-neutral-muted text-center leading-tight">{sublabel}</span>
        </motion.div>
      ))}
    </div>
  );
}
