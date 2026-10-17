'use client';

import { motion } from 'framer-motion';
import { MessageSquareX, EyeOff, SearchX } from 'lucide-react';
import { useMotion, MOTION } from '@/lib/motion-variants';

export default function ProblemSection() {
  const { fadeUp, MOTION: M } = useMotion();

  return (
    <section className="bg-white border-b border-border py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        
        {/* Intro */}
        <motion.div
          variants={fadeUp(M.offset.md, M.duration.entrance)}
          initial="hidden"
          whileInView="show"
          viewport={MOTION.viewport}
        >
          <p className="text-xs font-bold text-neutral-muted uppercase tracking-[0.2em] mb-4">The problem</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-neutral-text font-heading leading-tight tracking-tight mb-8">
            WhatsApp groups weren&rsquo;t built for this.
          </h2>
          <p className="text-lg text-neutral-text/80 leading-relaxed mb-16">
            The listings weren&apos;t the problem. Students were trying. Every week, someone posted something in a group. But WhatsApp groups aren&apos;t marketplaces — they&apos;re conversations.
          </p>
        </motion.div>

        {/* Problem Breakdown Grid */}
        <motion.div
          variants={fadeUp(M.offset.md, M.duration.entrance)}
          initial="hidden"
          whileInView="show"
          viewport={MOTION.viewport}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-danger/10 text-danger flex items-center justify-center mb-4">
                  <MessageSquareX className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-neutral-text font-heading mb-2">
                  Buried in Chat Streams
                </h3>
                <p className="text-sm text-neutral-muted leading-relaxed">
                  Every week, listings get posted in batch groups and flooded by 200 new messages within hours. What isn&apos;t seen immediately vanishes forever.
                </p>
              </div>
              <span className="text-xs font-semibold text-neutral-muted uppercase tracking-wider mt-6">
                Zero Longevity
              </span>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4">
                  <SearchX className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-neutral-text font-heading mb-2">
                  Zero Search or Filtering
                </h3>
                <p className="text-sm text-neutral-muted leading-relaxed">
                  Need a specific sem-3 drafter or physics text? Good luck scrolling through weeks of unstructured group chatter with no way to filter or sort.
                </p>
              </div>
              <span className="text-xs font-semibold text-neutral-muted uppercase tracking-wider mt-6">
                Zero Discoverability
              </span>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-contact/10 text-contact flex items-center justify-center mb-4">
                  <EyeOff className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-neutral-text font-heading mb-2">
                  No Campus Context
                </h3>
                <p className="text-sm text-neutral-muted leading-relaxed">
                  Sellers and buyers live two hostel blocks away, yet transactions stall because there is no trusted directory or structured contact path.
                </p>
              </div>
              <span className="text-xs font-semibold text-neutral-muted uppercase tracking-wider mt-6">
                Broken Connection
              </span>
            </div>
          </div>
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
          <p className="text-xs font-bold text-neutral-muted uppercase tracking-[0.2em] mb-4">The gap</p>
          <h3 className="text-2xl font-bold text-neutral-text mb-4">
            OLX works for cities. Not for hostels.
          </h3>
          <p className="text-lg text-neutral-text/80 leading-relaxed mb-8">
            The existing platforms have no concept of campus. No trust signal between a buyer and a seller who live two buildings apart. No awareness that you can just walk over and check the condition yourself.
          </p>
          <div className="bg-surface border border-border rounded-xl p-6 text-neutral-text font-medium text-center">
            {"They're built for strangers across a city. We're neighbours. That's a fundamentally different transaction, and it deserves a fundamentally different platform."}
          </div>
        </motion.div>

      </div>
    </section>
  );
}

