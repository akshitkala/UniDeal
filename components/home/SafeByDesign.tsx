'use client';

import React from 'react';
import Link from 'next/link';
import { PhoneOff, UserCheck, ShieldCheck, Flag } from 'lucide-react';

const SAFETY_ITEMS = [
  {
    icon: PhoneOff,
    title: 'No numbers on listings',
    desc: 'Phone numbers are never shown on UniDeal. Contact happens through a WhatsApp link.',
  },
  {
    icon: UserCheck,
    title: 'First name only',
    desc: 'Listings show a seller\'s first name. Never a full name, branch, or year.',
  },
  {
    icon: ShieldCheck,
    title: 'Email-verified accounts',
    desc: 'You verify your email before you can post or contact a seller.',
  },
  {
    icon: Flag,
    title: 'Report anything',
    desc: 'Every listing has a report button, and every report is reviewed by a person.',
  },
];

export default function SafeByDesign() {
  return (
    <section className="bg-white border-b border-border py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        
        {/* Heading Block */}
        <div className="mb-6 md:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-text font-heading leading-tight">
            Safe by design
          </h2>
          <p className="text-sm text-neutral-muted mt-1">
            Simple rules that protect both sides of every deal.
          </p>
        </div>

        {/* 4 Items Grid: 1 col mobile, 2 col md, 4 col lg. Bordered cells, no shadows */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAFETY_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-5 rounded-lg border border-border bg-white flex flex-col gap-3"
              >
                <div
                  aria-hidden="true"
                  className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0"
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-text font-heading mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-neutral-muted leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Link below */}
        <div className="mt-8">
          <Link
            href="/safety"
            className="text-sm text-primary font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded min-h-[44px] inline-flex items-center"
          >
            Read our safety tips →
          </Link>
        </div>

      </div>
    </section>
  );
}
