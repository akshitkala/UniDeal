'use client';

import { motion } from 'framer-motion';
import { useMotion, MOTION as M } from '@/lib/motion-variants';

const items = [
  { x: 18, y: 58, w: 28, h: 36, label: 'Textbook', delay: 0.1 },
  { x: 52, y: 62, w: 22, h: 32, label: 'Notes',    delay: 0.22 },
  { x: 80, y: 54, w: 14, h: 40, label: 'Flask',    delay: 0.34 },
  { x: 100, y: 66, w: 30, h: 28, label: 'Box',     delay: 0.46 },
  { x: 136, y: 58, w: 20, h: 36, label: 'Book',    delay: 0.58 },
];

export default function IlluAlmirah({ inView }: { inView: boolean }) {
  const { scaleIn, reduced } = useMotion();

  return (
    <svg
      viewBox="0 0 180 110"
      className="w-full max-w-[280px] mx-auto"
      aria-hidden="true"
      role="img"
    >
      <rect x="8" y="8" width="164" height="94" rx="4" fill="none" stroke="currentColor" strokeWidth="2" className="text-border" />
      <line x1="8" y1="50" x2="172" y2="50" stroke="currentColor" strokeWidth="1.5" className="text-border" />
      <line x1="8" y1="94" x2="172" y2="94" stroke="currentColor" strokeWidth="1.5" className="text-border" />
      <line x1="90" y1="50" x2="90" y2="94" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-border" />
      <circle cx="82" cy="72" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-muted" />
      <circle cx="98" cy="72" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-muted" />

      {items.map(({ x, y, w, h, label, delay }) => (
        <motion.rect
          key={label}
          x={x} y={y} width={w} height={h} rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-primary"
          variants={scaleIn(0, 1, M.duration.entranceFast, delay)}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          style={{ transformOrigin: `${x + w / 2}px ${y + h}px` }}
        />
      ))}

      <line x1="20" y1="45" x2="35" y2="45" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" className="text-border" />
      <line x1="120" y1="45" x2="140" y2="45" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" className="text-border" />
    </svg>
  );
}
