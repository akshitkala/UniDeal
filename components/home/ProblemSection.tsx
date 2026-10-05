'use client';

import { motion } from 'framer-motion';
import { MessageSquareX, EyeOff, SearchX } from 'lucide-react';
import { useMotion, MOTION } from '@/lib/motion-variants';

export default function ProblemSection() {
  const { fadeUp, MOTION: M } = useMotion();

  return (
    <section className="bg-white border-b border-border py-24 sm:py-32">
      <div className="container mx-auto px-4 max-w-3xl">
        
        {/* Intro */}
        <motion.div
          variants={fadeUp(M.offset.md, M.duration.entrance)}
          initial="hidden"
          whileInView="show"
          viewport={MOTION.viewport}
        >
          <p className="text-[11px] font-bold text-neutral-muted uppercase tracking-[0.2em] mb-4">The problem</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-neutral-text font-heading leading-tight tracking-tight mb-8">
            WhatsApp groups weren&rsquo;t built for this.
          </h2>
          <p className="text-lg text-neutral-text/80 leading-relaxed mb-16">
            The listings weren&apos;t the problem. Students were trying. Every week, someone posted something in a group. But WhatsApp groups aren&apos;t marketplaces — they&apos;re conversations.
          </p>
        </motion.div>

        {/* WhatsApp Mockup */}
        <motion.div
          variants={fadeUp(M.offset.md, M.duration.entrance)}
          initial="hidden"
          whileInView="show"
          viewport={MOTION.viewport}
          className="mb-8"
        >
          <div className="bg-[#0b141a] rounded-2xl p-6 sm:p-8 shadow-xl overflow-hidden relative">
            <div className="flex flex-col gap-6 relative z-10">
              {/* Message 1 */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#8696a0] font-medium tracking-wide">RAHUL (B.TECH)</span>
                <div className="bg-[#202c33] text-[#e9edef] text-sm p-3 rounded-xl rounded-tl-none self-start max-w-[85%] leading-relaxed shadow-sm">
                  Selling my sem-3 Physics book. Brand new condition. Anyone interested?
                </div>
              </div>
              
              {/* Message 2 */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#8696a0] font-medium tracking-wide">ISHA P.</span>
                <div className="bg-[#202c33] text-[#e9edef] text-sm p-3 rounded-xl rounded-tl-none self-start max-w-[85%] leading-relaxed shadow-sm">
                  Does anyone have a Drafter for sale?
                </div>
              </div>

              {/* Message 3 */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[#8696a0] font-medium tracking-wide">AMAN DEEP</span>
                <div className="bg-[#202c33] text-[#e9edef] text-sm p-3 rounded-xl rounded-tl-none self-start max-w-[85%] leading-relaxed shadow-sm">
                  Lab coat available. Never used. ₹200.
                </div>
              </div>

              {/* Faded Message */}
              <div className="flex flex-col gap-1 opacity-40">
                <span className="text-[10px] text-[#8696a0] font-medium tracking-wide">SNEHA GUPTA</span>
                <div className="bg-[#202c33] text-[#e9edef] text-sm p-3 rounded-xl rounded-tl-none self-start max-w-[85%] leading-relaxed shadow-sm">
                  Giving away my previous year notes for free. Hostel 4.
                </div>
              </div>
            </div>
            {/* Fade out gradient at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0b141a] to-transparent z-20 pointer-events-none"></div>
          </div>
          <p className="text-center text-xs text-neutral-muted italic mt-4">
            "And then, new messages pushed them all out of view."
          </p>
        </motion.div>

        {/* Narrative continuation */}
        <motion.div
          variants={fadeUp(M.offset.md, M.duration.entrance)}
          initial="hidden"
          whileInView="show"
          viewport={MOTION.viewport}
          className="space-y-6 mt-16"
        >
          <p className="text-lg text-neutral-text/80 leading-relaxed">
            A listing lives for a few hours before 200 new messages bury it. There&apos;s no search. No filter. No way to find a book from three weeks ago. It just disappears.
          </p>
          <p className="text-lg text-neutral-text/80 leading-relaxed">
            Sellers are completely anonymous—there&apos;s no way to know if the poster is a real student on campus. The buyer gives up, the seller gives up, and perfectly good items get thrown away.
          </p>
        </motion.div>

        {/* Pull Quote */}
        <motion.div
          variants={fadeUp(M.offset.md, M.duration.entrance)}
          initial="hidden"
          whileInView="show"
          viewport={MOTION.viewport}
          className="mt-16 border-l-4 border-primary pl-6 py-2"
        >
          <p className="text-2xl font-serif italic text-neutral-text leading-snug">
            “The items existed. The demand existed. The only thing missing was a connection.”
          </p>
        </motion.div>

        {/* The Solution Transition */}
        <motion.div
          variants={fadeUp(M.offset.md, M.duration.entrance)}
          initial="hidden"
          whileInView="show"
          viewport={MOTION.viewport}
          className="mt-20 pt-10 border-t border-border"
        >
          <p className="text-[11px] font-bold text-neutral-muted uppercase tracking-[0.2em] mb-4">The gap</p>
          <h3 className="text-2xl font-bold text-neutral-text mb-4">
            OLX works for cities. Not for hostels.
          </h3>
          <p className="text-lg text-neutral-text/80 leading-relaxed mb-8">
            The existing platforms have no concept of campus. No trust signal between a buyer and a seller who live two buildings apart. No awareness that you can just walk over and check the condition yourself.
          </p>
          <div className="bg-surface border border-border rounded-xl p-6 text-neutral-text font-medium text-center">
            They're built for strangers across a city. We're neighbours. That's a fundamentally different transaction, and it deserves a fundamentally different platform.
          </div>
        </motion.div>

      </div>
    </section>
  );
}

