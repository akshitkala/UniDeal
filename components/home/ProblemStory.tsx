import React from 'react';
import { MessageSquareX, SearchX, ShieldAlert } from 'lucide-react';

export default function ProblemStory() {
  return (
    <section className="bg-white border-b border-border py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Eyebrow & Single Heading */}
        <div className="max-w-3xl mb-10 md:mb-12">
          <p className="text-xs font-semibold text-neutral-muted uppercase tracking-widest mb-3">
            The problem
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-text font-heading leading-tight tracking-tight mb-4">
            WhatsApp groups weren&apos;t built for this.
          </h2>
          <p className="text-base sm:text-lg text-neutral-text/80 leading-relaxed">
            Students were trying. Every week someone posted something in a group. But a group is a conversation, not a marketplace.
          </p>
        </div>

        {/* 3 Problem Cards in a Row on Desktop, Stacked on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-10 h-10 rounded-lg bg-danger/10 text-danger flex items-center justify-center mb-4">
                <MessageSquareX className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-text font-heading mb-2">
                Messages Get Buried
              </h3>
              <p className="text-sm text-neutral-muted leading-relaxed">
                A listing lives for a few hours before 200 new messages bury it. What isn&apos;t seen immediately vanishes forever.
              </p>
            </div>
            <span className="text-xs font-semibold text-neutral-muted uppercase tracking-wider mt-6">
              Zero Longevity
            </span>
          </div>

          {/* Card 2 */}
          <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4">
                <SearchX className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-text font-heading mb-2">
                No Search or Filtering
              </h3>
              <p className="text-sm text-neutral-muted leading-relaxed">
                No way to find a book from three weeks ago. No categories, no condition filters, and no structured discoverability.
              </p>
            </div>
            <span className="text-xs font-semibold text-neutral-muted uppercase tracking-wider mt-6">
              Zero Discoverability
            </span>
          </div>

          {/* Card 3 */}
          <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-text font-heading mb-2">
                Zero Verification
              </h3>
              <p className="text-sm text-neutral-muted leading-relaxed">
                Anonymous phone numbers provide no campus trust signal. You never know who you are actually dealing with.
              </p>
            </div>
            <span className="text-xs font-semibold text-neutral-muted uppercase tracking-wider mt-6">
              Broken Trust
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
