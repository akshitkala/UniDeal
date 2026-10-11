'use client';

import React from 'react';

/**
 * Placeholder component for SafeByDesign section.
 * To be filled in by subsequent prompts.
 */
export default function SafeByDesign() {
  return (
    <section className="bg-white border-b border-border py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="mb-6 md:mb-10">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Security & Privacy</p>
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-text font-heading">
            Safe by design.
          </h2>
        </div>
        <p className="text-neutral-muted text-base leading-relaxed">
          Built for campus trust. Direct peer-to-peer deals with verified student profiles and privacy-protected contact.
        </p>
      </div>
    </section>
  );
}
