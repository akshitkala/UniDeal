'use client';

import React from 'react';
import Link from 'next/link';
import { PackagePlus, Search, MessageCircle } from 'lucide-react';

const steps = [
  {
    step: '1',
    title: 'List your item',
    body: 'Photos, price, condition. Done in two minutes.',
    icon: PackagePlus,
    // Mini form row fragment
    fragment: (
      <div className="p-3 bg-surface border border-border rounded-md flex flex-col gap-2 select-none" aria-hidden="true">
        <div className="flex gap-2">
          <div className="flex-1 bg-white border border-border rounded px-2 py-1 text-xs text-neutral-muted truncate">
            Lab Manual Sem 3
          </div>
          <div className="w-16 bg-white border border-border rounded px-2 py-1 text-xs text-neutral-muted text-right">
            ₹250
          </div>
        </div>
        <div className="py-1 px-3 bg-primary text-white text-xs font-semibold rounded text-center">
          Post listing
        </div>
      </div>
    ),
  },
  {
    step: '2',
    title: 'Buyer finds it',
    body: 'Search, filter by category or condition, sort by newest or price.',
    icon: Search,
    // 3 chip-style filters fragment
    fragment: (
      <div className="p-3 bg-surface border border-border rounded-md flex flex-wrap gap-1.5 select-none" aria-hidden="true">
        <span className="px-2 py-1 bg-white border border-primary text-primary text-xs font-medium rounded-full">
          Books & Notes
        </span>
        <span className="px-2 py-1 bg-white border border-border text-neutral-muted text-xs font-medium rounded-full">
          Like New
        </span>
        <span className="px-2 py-1 bg-white border border-border text-neutral-muted text-xs font-medium rounded-full">
          Price: Low to High
        </span>
      </div>
    ),
  },
  {
    step: '3',
    title: 'Connect on WhatsApp',
    body: 'One tap opens a pre-filled chat. The deal closes off-platform.',
    icon: MessageCircle,
    // Ghost-style button labelled "Contact Seller" + caption "Opens WhatsApp"
    // IMPORTANT: neutral outlined style or --color-accent, NEVER --color-accent-contact
    fragment: (
      <div className="p-3 bg-surface border border-border rounded-md flex flex-col items-center justify-center gap-1.5 select-none" aria-hidden="true">
        <div className="w-full py-1.5 px-3 border border-border bg-white text-neutral-text text-xs font-medium rounded text-center flex items-center justify-center gap-1.5">
          <MessageCircle className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
          <span>Contact Seller</span>
        </div>
        <span className="text-xs text-neutral-muted">
          Opens WhatsApp
        </span>
      </div>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-white border-b border-border py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 md:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-text font-heading leading-tight">
              Three steps from listing to deal.
            </h2>
          </div>
          <Link
            href="/how-it-works"
            className="text-sm text-primary font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded shrink-0 self-start sm:self-end min-h-[44px] flex items-center"
          >
            Full walkthrough →
          </Link>
        </div>

        {/* Steps Grid: horizontal joined by hairline connector on desktop, stacked with left line on mobile */}
        <div className="relative">
          {/* Desktop hairline connector */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-7 left-[16.6%] right-[16.6%] h-px bg-border z-0"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative z-10">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="flex flex-col relative pl-8 md:pl-0"
                >
                  {/* Mobile vertical left connector line */}
                  <div
                    aria-hidden="true"
                    className="md:hidden absolute top-4 bottom-0 left-3 w-px bg-border -z-10"
                  />

                  {/* Top row: badge + title */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-7 h-7 rounded-full bg-white border border-primary text-primary font-display font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {item.step}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-neutral-text font-heading">
                      {item.title}
                    </h3>
                  </div>

                  {/* Step one-line description */}
                  <p className="text-sm text-neutral-muted leading-relaxed mb-4">
                    {item.body}
                  </p>

                  {/* Static UI fragment */}
                  <div className="mt-auto pt-2">
                    {item.fragment}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
