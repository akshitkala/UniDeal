'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function IlluGap({ inView }: { inView: boolean }) {
  const reduced = useReducedMotion();

  const dotVariants = {
    hidden: { opacity: 0, scale: 0.6 },
    show: { opacity: 1, scale: 1 },
  };

  return (
    <svg
      viewBox="0 0 220 100"
      className="w-full max-w-[320px] mx-auto"
      aria-hidden="true"
      role="img"
    >
      {/* Left cluster — "Has stuff" */}
      <motion.g
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
        transition={{ staggerChildren: reduced ? 0 : 0.06, delayChildren: reduced ? 0 : 0.05 }}
      >
        {/* Centre node */}
        <motion.circle variants={dotVariants} transition={{ duration: 0.35 }}
          cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
        <motion.text variants={dotVariants} transition={{ duration: 0.35 }}
          x="50" y="54" textAnchor="middle" fontSize="7" fill="currentColor" className="text-primary font-semibold">HAS</motion.text>

        {/* Satellite dots */}
        {[[28,28],[28,72],[14,50]].map(([cx,cy], i) => (
          <motion.circle key={i} variants={dotVariants} transition={{ duration: 0.3 }}
            cx={cx} cy={cy} r="5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border" />
        ))}
        {/* Connector lines */}
        {[[28,28],[28,72],[14,50]].map(([cx,cy], i) => (
          <motion.line key={`l${i}`} variants={{ hidden:{opacity:0}, show:{opacity:1} }} transition={{ duration: 0.25 }}
            x1="50" y1="50" x2={cx} y2={cy} stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" className="text-border" />
        ))}
      </motion.g>

      {/* Right cluster — "Needs stuff" */}
      <motion.g
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
        transition={{ staggerChildren: reduced ? 0 : 0.06, delayChildren: reduced ? 0 : 0.15 }}
      >
        <motion.circle variants={dotVariants} transition={{ duration: 0.35 }}
          cx="170" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-muted" />
        <motion.text variants={dotVariants} transition={{ duration: 0.35 }}
          x="170" y="54" textAnchor="middle" fontSize="6.5" fill="currentColor" className="text-neutral-muted font-semibold">NEEDS</motion.text>

        {[[192,28],[192,72],[206,50]].map(([cx,cy], i) => (
          <motion.circle key={i} variants={dotVariants} transition={{ duration: 0.3 }}
            cx={cx} cy={cy} r="5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border" />
        ))}
        {[[192,28],[192,72],[206,50]].map(([cx,cy], i) => (
          <motion.line key={`l${i}`} variants={{ hidden:{opacity:0}, show:{opacity:1} }} transition={{ duration: 0.25 }}
            x1="170" y1="50" x2={cx} y2={cy} stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" className="text-border" />
        ))}
      </motion.g>

      {/* Gap / bridge connector — draws itself last */}
      <motion.line
        x1="64" y1="50" x2="156" y2="50"
        stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"
        className="text-border"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={inView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.35, ease: 'easeInOut' }}
      />

      {/* UniDeal bridge node */}
      <motion.g
        initial={{ opacity: 0, scale: 0.5 }}
        animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
        transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 0.7 }}
        style={{ transformOrigin: '110px 50px' }}
      >
        <circle cx="110" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
        <text x="110" y="54" textAnchor="middle" fontSize="8" fill="currentColor" className="text-primary font-bold">U</text>
      </motion.g>

      {/* Labels */}
      <text x="50" y="92" textAnchor="middle" fontSize="7" fill="currentColor" className="text-neutral-muted">Seller</text>
      <text x="170" y="92" textAnchor="middle" fontSize="7" fill="currentColor" className="text-neutral-muted">Buyer</text>
      <text x="110" y="92" textAnchor="middle" fontSize="7" fill="currentColor" className="text-primary">UniDeal</text>
    </svg>
  );
}
