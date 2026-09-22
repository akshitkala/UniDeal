'use client';

import { motion } from 'framer-motion';
import { useMotion, MOTION as M } from '@/lib/motion-variants';

export default function IlluGap({ inView }: { inView: boolean }) {
  const { staggerContainer, scaleIn, fadeIn, svgDraw, MOTION: MV } = useMotion();

  const dotVariants = scaleIn(0.6, 1, MV.duration.entranceFast);

  return (
    <svg
      viewBox="0 0 220 100"
      className="w-full max-w-[320px] mx-auto"
      aria-hidden="true"
      role="img"
    >
      {/* Left cluster */}
      <motion.g
        variants={staggerContainer(MV.stagger.tight)}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
        transition={{ delayChildren: 0.05 }}
      >
        <motion.circle variants={scaleIn(0.6, 1, 0.35)}
          cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
        <motion.text variants={scaleIn(0.6, 1, 0.35)}
          x="50" y="54" textAnchor="middle" fontSize="7" fill="currentColor" className="text-primary font-semibold">HAS</motion.text>

        {[[28,28],[28,72],[14,50]].map(([cx,cy], i) => (
          <motion.circle key={i} variants={dotVariants}
            cx={cx} cy={cy} r="5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border" />
        ))}
        {[[28,28],[28,72],[14,50]].map(([cx,cy], i) => (
          <motion.line key={`l${i}`} variants={fadeIn(MV.duration.entranceFast, 0.05)}
            x1="50" y1="50" x2={cx} y2={cy} stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" className="text-border" />
        ))}
      </motion.g>

      {/* Right cluster */}
      <motion.g
        variants={staggerContainer(MV.stagger.tight)}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
        transition={{ delayChildren: 0.15 }}
      >
        <motion.circle variants={scaleIn(0.6, 1, 0.35)}
          cx="170" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-muted" />
        <motion.text variants={scaleIn(0.6, 1, 0.35)}
          x="170" y="54" textAnchor="middle" fontSize="6.5" fill="currentColor" className="text-neutral-muted font-semibold">NEEDS</motion.text>

        {[[192,28],[192,72],[206,50]].map(([cx,cy], i) => (
          <motion.circle key={i} variants={dotVariants}
            cx={cx} cy={cy} r="5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border" />
        ))}
        {[[192,28],[192,72],[206,50]].map(([cx,cy], i) => (
          <motion.line key={`l${i}`} variants={fadeIn(MV.duration.entranceFast, 0.05)}
            x1="170" y1="50" x2={cx} y2={cy} stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" className="text-border" />
        ))}
      </motion.g>

      {/* Gap / bridge connector */}
      <motion.line
        x1="64" y1="50" x2="156" y2="50"
        stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"
        className="text-border"
        variants={svgDraw(MV.duration.draw, 0.35)}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
      />

      {/* UniDeal bridge node */}
      <motion.g
        variants={scaleIn(0.5, 1, MV.duration.entrance, 0.7)}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
        style={{ transformOrigin: '110px 50px' }}
      >
        <circle cx="110" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
        <text x="110" y="54" textAnchor="middle" fontSize="8" fill="currentColor" className="text-primary font-bold">U</text>
      </motion.g>

      <text x="50" y="92" textAnchor="middle" fontSize="7" fill="currentColor" className="text-neutral-muted">Seller</text>
      <text x="170" y="92" textAnchor="middle" fontSize="7" fill="currentColor" className="text-neutral-muted">Buyer</text>
      <text x="110" y="92" textAnchor="middle" fontSize="7" fill="currentColor" className="text-primary">UniDeal</text>
    </svg>
  );
}
