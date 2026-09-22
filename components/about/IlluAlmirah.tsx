'use client';

import { motion, useReducedMotion } from 'framer-motion';

const items = [
  // [x, y, width, height, label]
  { x: 18, y: 58, w: 28, h: 36, label: 'Textbook', delay: 0.1 },
  { x: 52, y: 62, w: 22, h: 32, label: 'Notes',    delay: 0.22 },
  { x: 80, y: 54, w: 14, h: 40, label: 'Flask',    delay: 0.34 },
  { x: 100, y: 66, w: 30, h: 28, label: 'Box',     delay: 0.46 },
  { x: 136, y: 58, w: 20, h: 36, label: 'Book',    delay: 0.58 },
];

export default function IlluAlmirah({ inView }: { inView: boolean }) {
  const reduced = useReducedMotion();

  return (
    <svg
      viewBox="0 0 180 110"
      className="w-full max-w-[280px] mx-auto"
      aria-hidden="true"
      role="img"
    >
      {/* Cabinet frame */}
      <rect x="8" y="8" width="164" height="94" rx="4" fill="none" stroke="currentColor" strokeWidth="2" className="text-border" />
      {/* Top shelf divider */}
      <line x1="8" y1="50" x2="172" y2="50" stroke="currentColor" strokeWidth="1.5" className="text-border" />
      {/* Bottom shelf */}
      <line x1="8" y1="94" x2="172" y2="94" stroke="currentColor" strokeWidth="1.5" className="text-border" />
      {/* Vertical divider */}
      <line x1="90" y1="50" x2="90" y2="94" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-border" />
      {/* Door handles */}
      <circle cx="82" cy="72" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-muted" />
      <circle cx="98" cy="72" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-muted" />

      {/* Items on top shelf — animate in sequentially */}
      {items.map(({ x, y, w, h, label, delay }) => (
        <motion.rect
          key={label}
          x={x} y={y} width={w} height={h} rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-primary"
          initial={{ opacity: 0, scaleY: 0, originY: 1 }}
          animate={inView ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0 }}
          transition={{ duration: reduced ? 0 : 0.35, delay: reduced ? 0 : delay, ease: 'easeOut' }}
          style={{ transformOrigin: `${x + w / 2}px ${y + h}px` }}
        />
      ))}

      {/* Dust lines — static decoration */}
      <line x1="20" y1="45" x2="35" y2="45" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" className="text-border" />
      <line x1="120" y1="45" x2="140" y2="45" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" className="text-border" />
    </svg>
  );
}
