'use client';

import React, { useEffect, useRef, useState } from 'react';

const INITIAL_MESSAGES = [
  { sender: 'RAHUL (B.TECH)', text: 'Selling my sem-3 Physics book. Brand new condition. Anyone interested?' },
  { sender: 'ISHA P.', text: 'Does anyone have a Drafter for sale?' },
  { sender: 'AMAN DEEP', text: 'Lab coat available. Never used. ₹200.' },
  { sender: 'SNEHA GUPTA', text: 'Giving away my previous year notes for free. Hostel 4.' },
];

const FILLER_MESSAGES = [
  { sender: 'KAVITA', text: 'Good morning everyone' },
  { sender: 'ROHAN S.', text: 'Anyone has tomorrow\'s notes?' },
  { sender: 'MESS COMMITTEE', text: 'Mess timings changed for dinner' },
  { sender: 'DEV M.', text: 'Who\'s going to the fest?' },
  { sender: 'PRIYA T.', text: 'Lost room key near library' },
  { sender: 'VIKRAM', text: 'Can someone share assignment 2 link?' },
];

export default function ProblemStory() {
  const [triggered, setTriggered] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTriggered(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-white border-b border-border py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Sticky Copy on Desktop */}
          <div className="lg:sticky lg:top-24 space-y-5">
            <p className="text-xs font-semibold text-neutral-muted uppercase tracking-widest">
              The problem
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-text font-heading leading-tight">
              WhatsApp groups weren&apos;t built for this.
            </h2>
            <p className="text-base text-neutral-text/90 leading-relaxed">
              Students were trying. Every week someone posted something in a group. But a group is a conversation, not a marketplace.
            </p>
            
            {/* Pull Quote */}
            <div className="border-l-4 border-primary pl-4 py-1.5 my-4">
              <p className="text-lg sm:text-xl font-medium text-neutral-text leading-snug">
                “A listing lives for a few hours before 200 new messages bury it.”
              </p>
            </div>

            <p className="text-base text-neutral-muted leading-relaxed">
              No search. No filter. No way to find a book from three weeks ago. UniDeal gives every item its own page, searchable and still there next week.
            </p>
            <p className="text-base text-neutral-muted leading-relaxed">
              OLX is built for strangers across a city. UniDeal is built for neighbours two buildings apart.
            </p>
          </div>

          {/* Right Column: Illustrative Example Message Pile Card */}
          <div
            ref={cardRef}
            className="w-full bg-[#f8fafc] border border-border rounded-xl p-5 sm:p-6 shadow-sm overflow-hidden"
          >
            {/* Header label */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <span className="text-[11px] font-semibold text-neutral-muted uppercase tracking-wider">
                Illustrative example
              </span>
              <span className="text-[11px] text-neutral-muted">Group chat</span>
            </div>

            {/* Messages stack */}
            <div className="flex flex-col gap-3 min-h-[360px] justify-end relative">
              
              {/* Original Listings Messages (fade to opacity 0.3 when triggered) */}
              <div
                className={`flex flex-col gap-2.5 transition-opacity duration-700 ${
                  triggered ? 'opacity-30' : 'opacity-100'
                }`}
              >
                {INITIAL_MESSAGES.map((msg, i) => (
                  <div key={i} className="flex flex-col gap-0.5 max-w-[90%]">
                    <span className="text-[10px] font-semibold text-neutral-muted tracking-wide">
                      {msg.sender}
                    </span>
                    <div className="bg-[#e2e8f0] text-neutral-text text-xs sm:text-sm p-2.5 rounded-lg rounded-tl-none leading-relaxed border border-border/60">
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* 6 Filler Messages sliding in */}
              <div
                className={`flex flex-col gap-2.5 transition-all duration-700 ease-out overflow-hidden ${
                  triggered
                    ? 'max-h-[500px] opacity-100 translate-y-0 mt-2'
                    : 'max-h-0 opacity-0 translate-y-8 mt-0 pointer-events-none'
                }`}
              >
                {FILLER_MESSAGES.map((msg, i) => (
                  <div key={i} className="flex flex-col gap-0.5 max-w-[85%] self-start">
                    <span className="text-[10px] font-semibold text-neutral-muted tracking-wide">
                      {msg.sender}
                    </span>
                    <div className="bg-[#f1f5f9] text-neutral-muted text-xs sm:text-sm p-2 rounded-lg rounded-tl-none leading-relaxed border border-border/40">
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Final divider row */}
                <div className="pt-2 text-center border-t border-dashed border-border mt-1">
                  <span className="text-xs font-semibold text-neutral-muted italic">
                    ...and 200 more messages
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
