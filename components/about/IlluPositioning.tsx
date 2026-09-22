'use client';

import { motion } from 'framer-motion';
import { useMotion, MOTION as M } from '@/lib/motion-variants';

export default function IlluPositioning({ inView }: { inView: boolean }) {
  const { fadeUp, fadeLeft, fadeRight, MOTION: MV } = useMotion();

  return (
    <div className="w-full max-w-[320px] mx-auto grid grid-cols-2 gap-3" aria-hidden="true">
      <motion.div
        variants={fadeRight(12, MV.duration.entrance, 0.05)}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
        className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-white"
      >
        <svg viewBox="0 0 48 48" className="w-12 h-12">
          <rect x="4"  y="22" width="8"  height="20" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border" />
          <rect x="14" y="14" width="10" height="28" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border" />
          <rect x="26" y="18" width="8"  height="24" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border" />
          <rect x="36" y="26" width="8"  height="16" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border" />
          <rect x="17" y="18" width="2" height="2" rx="0.4" fill="currentColor" className="text-border" />
          <rect x="21" y="18" width="2" height="2" rx="0.4" fill="currentColor" className="text-border" />
          <rect x="17" y="23" width="2" height="2" rx="0.4" fill="currentColor" className="text-border" />
          <line x1="2" y1="42" x2="46" y2="42" stroke="currentColor" strokeWidth="1" className="text-border" />
          <line x1="38" y1="4" x2="46" y2="12" stroke="currentColor" strokeWidth="1.5" className="text-neutral-muted" />
          <line x1="46" y1="4" x2="38" y2="12" stroke="currentColor" strokeWidth="1.5" className="text-neutral-muted" />
        </svg>
        <span className="text-[11px] font-semibold text-neutral-muted text-center leading-tight">City marketplace</span>
        <span className="text-[10px] text-neutral-muted text-center leading-tight">Strangers, no trust signal</span>
      </motion.div>

      <motion.div
        variants={fadeLeft(12, MV.duration.entrance, 0.15)}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
        className="flex flex-col items-center gap-2 p-4 rounded-lg border border-primary/20 bg-primary/5"
      >
        <svg viewBox="0 0 48 48" className="w-12 h-12">
          <rect x="10" y="20" width="28" height="22" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
          <polyline points="6,20 24,8 42,20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
          <line x1="24" y1="8" x2="24" y2="3" stroke="currentColor" strokeWidth="1.2" className="text-primary" />
          <polygon points="24,3 30,5.5 24,8" fill="currentColor" className="text-primary" />
          <rect x="20" y="32" width="8" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-primary" />
          <rect x="13" y="25" width="5" height="5" rx="0.8" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary" />
          <rect x="30" y="25" width="5" height="5" rx="0.8" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary" />
          <line x1="2" y1="42" x2="46" y2="42" stroke="currentColor" strokeWidth="1" className="text-border" />
          <circle cx="40" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
          <polyline points="37,8 39.5,10.5 43.5,5.5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
        </svg>
        <span className="text-[11px] font-semibold text-primary text-center leading-tight">Campus marketplace</span>
        <span className="text-[10px] text-neutral-muted text-center leading-tight">Verified students, proximity</span>
      </motion.div>
    </div>
  );
}
