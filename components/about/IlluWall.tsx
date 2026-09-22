'use client';

import { motion } from 'framer-motion';
import { useMotion, MOTION as M } from '@/lib/motion-variants';

const cards = [
  { id: 'c1', y: 0,  w: 140, label: 'Selling iron — ₹300',    age: 'Just now',   opacity: 1 },
  { id: 'c2', y: 26, w: 150, label: 'Anyone have a charger?', age: '2 min ago',  opacity: 0.75 },
  { id: 'c3', y: 52, w: 130, label: 'Textbook — semester 2',  age: '8 min ago',  opacity: 0.5 },
  { id: 'c4', y: 78, w: 145, label: 'Study lamp for sale',     age: '22 min ago', opacity: 0.3 },
];

export default function IlluWall({ inView }: { inView: boolean }) {
  const { staggerContainer, fadeDown, fadeIn, MOTION: MV } = useMotion();

  return (
    <svg
      viewBox="0 0 180 120"
      className="w-full max-w-[260px] mx-auto"
      aria-hidden="true"
      role="img"
    >
      <motion.g
        variants={staggerContainer(MV.stagger.loose)}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
      >
        {cards.map(({ id, y, w, label, age, opacity }, i) => (
          <motion.g
            key={id}
            variants={fadeDown(10, MV.duration.entrance, i * MV.stagger.veryLoose)}
          >
            <rect x="20" y={y + 8} width={w} height="18" rx="3"
              fill="white" stroke="currentColor" strokeWidth="1.2"
              className="text-border"
            />
            <circle cx="32" cy={y + 17} r="4" fill="none" stroke="currentColor" strokeWidth="1" className="text-border" />
            <rect x="42" y={y + 13} width={w * 0.48} height="3" rx="1.5" fill="currentColor" className="text-neutral-muted" style={{ opacity: 0.4 }} />
            <rect x={20 + w - 28} y={y + 13} width="22" height="3" rx="1.5" fill="currentColor" className="text-neutral-muted" style={{ opacity: 0.25 }} />
          </motion.g>
        ))}
      </motion.g>

      <motion.g
        variants={fadeIn(MV.duration.entrance, 0.55)}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
      >
        <line x1="90" y1="108" x2="90" y2="116" stroke="currentColor" strokeWidth="1.5" className="text-neutral-muted" />
        <polyline points="86,112 90,117 94,112" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-muted" />
      </motion.g>
    </svg>
  );
}
