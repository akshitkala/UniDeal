import Link from 'next/link';
import { PackagePlus, Search, MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UniDeal — Campus Marketplace',
  description:
    'Buy and sell physical items with verified students on your university campus. No buried WhatsApp messages.',
};

const howSteps = [
  { icon: PackagePlus, label: 'List your item', body: 'Photos, price, condition — done in two minutes.' },
  { icon: Search,      label: 'Buyer finds it', body: 'Search, filter by category or condition, sorted by newest or price.' },
  { icon: MessageCircle, label: 'Connect on WhatsApp', body: 'One tap opens a pre-filled chat. Deal closes off-platform.' },
];

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-16 sm:py-24 max-w-3xl text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-text font-display leading-tight">
            Buy and sell on campus with{' '}
            <span className="text-primary">verified students</span>.
          </h1>
          <p className="text-lg text-neutral-muted max-w-xl mx-auto">
            No buried WhatsApp messages. No anonymous strangers. A structured, searchable marketplace
            built for university life.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/browse"
              className="py-3 px-6 bg-primary text-white rounded-md font-semibold text-base hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors min-h-[44px] flex items-center justify-center"
            >
              Browse Listings
            </Link>
            <Link
              href="/sell"
              className="py-3 px-6 bg-white text-neutral-text border border-border rounded-md font-semibold text-base hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors min-h-[44px] flex items-center justify-center"
            >
              Sell an Item
            </Link>
          </div>
        </div>
      </section>

      {/* ── Problem → Solution ────────────────────────────────── */}
      <section className="bg-surface border-b border-border">
        <div className="container mx-auto px-4 py-14 max-w-3xl">
          <h2 className="text-2xl font-bold text-neutral-text font-heading mb-4">
            WhatsApp groups weren&rsquo;t built for this.
          </h2>
          <p className="text-neutral-muted leading-relaxed">
            Listings scroll out of view in hours. Sellers are anonymous. There&rsquo;s no search, no filter,
            and no way to know if the item is still available. UniDeal is the structured layer that
            was missing — discovery and trust on one clean page, deal on WhatsApp.
          </p>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-14 max-w-3xl">
          <h2 className="text-2xl font-bold text-neutral-text font-heading mb-8">How it works</h2>
          <ol className="grid sm:grid-cols-3 gap-6" aria-label="How UniDeal works">
            {howSteps.map(({ icon: Icon, label, body }, i) => (
              <li key={label} className="flex flex-col gap-3">
                <div
                  className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-shrink-0"
                  aria-hidden="true"
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-neutral-muted uppercase tracking-wide">
                    Step {i + 1}
                  </span>
                  <h3 className="text-base font-semibold text-neutral-text mt-0.5 mb-1">{label}</h3>
                  <p className="text-sm text-neutral-muted leading-relaxed">{body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-8">
            <Link
              href="/how-it-works"
              className="text-sm text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
            >
              Read more about how UniDeal works →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Footer Strip ─────────────────────────────────── */}
      <section className="bg-primary/5 border-t border-primary/10">
        <div className="container mx-auto px-4 py-12 max-w-3xl text-center space-y-4">
          <h2 className="text-xl font-bold text-neutral-text font-heading">
            Ready to find something — or clear out your room?
          </h2>
          <p className="text-sm text-neutral-muted">
            It&rsquo;s free. No ads. Built by a student for students.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
            <Link
              href="/browse"
              className="py-2.5 px-6 bg-primary text-white rounded-md font-medium text-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors min-h-[44px] flex items-center justify-center"
            >
              Browse Listings
            </Link>
            <Link
              href="/our-story"
              className="py-2.5 px-6 bg-white text-neutral-text border border-border rounded-md font-medium text-sm hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors min-h-[44px] flex items-center justify-center"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
