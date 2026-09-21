import type { Metadata } from 'next';
import { PackagePlus, Search, MessageCircle, Handshake } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How It Works — UniDeal',
  description: 'List, discover, and connect with verified campus sellers on UniDeal.',
};

const steps = [
  {
    icon: PackagePlus,
    label: 'List Your Item',
    body: 'Add photos, set your price, pick a category, and describe the condition. Takes under two minutes.',
  },
  {
    icon: Search,
    label: 'Discover & Filter',
    body: 'Browse by category, condition, and price. Search by keyword. Every listing is from a verified campus student.',
  },
  {
    icon: MessageCircle,
    label: 'Contact on WhatsApp',
    body: "Tap Contact Seller — a pre-filled WhatsApp message opens instantly. No phone number displayed, no guesswork.",
  },
  {
    icon: Handshake,
    label: 'Meet Up & Deal',
    body: 'Agree on a time, meet on campus, hand over the item. Simple, safe, done.',
  },
];

export default function HowItWorksPage() {
  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-14 max-w-2xl">
        <h1 className="text-4xl font-bold text-neutral-text font-heading mb-3 leading-tight">
          How It Works
        </h1>
        <p className="text-neutral-muted mb-10 text-lg">
          Four steps from listing to done.
        </p>

        <ol className="space-y-4" aria-label="How UniDeal works">
          {steps.map(({ icon: Icon, label, body }, i) => (
            <li
              key={label}
              className="flex gap-4 p-6 rounded-lg border border-border bg-white"
            >
              <div
                className="flex-shrink-0 w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center"
                aria-hidden="true"
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-neutral-muted uppercase tracking-wide">
                  Step {i + 1}
                </span>
                <h2 className="text-base font-semibold text-neutral-text mt-0.5 mb-1">{label}</h2>
                <p className="text-sm text-neutral-muted leading-relaxed">{body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row gap-3">
          <a
            href="/browse"
            className="py-2.5 px-5 bg-primary text-white rounded-md font-medium text-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors text-center min-h-[44px] flex items-center justify-center"
          >
            Browse Listings
          </a>
          <a
            href="/sell"
            className="py-2.5 px-5 bg-white text-neutral-text border border-border rounded-md font-medium text-sm hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors text-center min-h-[44px] flex items-center justify-center"
          >
            Sell an Item
          </a>
        </div>
      </div>
    </main>
  );
}
