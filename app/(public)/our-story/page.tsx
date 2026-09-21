import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Story — UniDeal',
  description: 'How UniDeal started, and why we built a structured campus marketplace.',
};

export default function OurStoryPage() {
  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-14 max-w-2xl">
        <h1 className="text-4xl font-bold text-neutral-text font-heading mb-4 leading-tight">
          Our Story
        </h1>
        <p className="text-neutral-muted text-sm mb-10">Founded September 2026 · Built by a student, for students</p>

        <div className="prose-reset space-y-6 text-neutral-text leading-relaxed">
          <p className="text-lg">
            UniDeal started with a simple frustration: campus WhatsApp groups were chaos. A charger listed
            at 11 AM was buried under 40 messages by noon. The seller was anonymous. The buyer had no
            way to tell if the item was real, or if the person was even on campus.
          </p>

          <p>
            We built UniDeal as the structured layer that was missing — a place where listings don&rsquo;t
            disappear, where sellers are verified students, and where finding something you need on campus
            takes seconds, not scrolling through a year&rsquo;s worth of group chat history.
          </p>

          <p>
            The deal still closes on WhatsApp. We&rsquo;re not trying to replace that — we&rsquo;re just making
            sure the right two people find each other first. Discovery and trust are the problem;
            UniDeal is the fix for that part.
          </p>

          <p>
            We&rsquo;re starting at one campus. If it works — and we think it will — we&rsquo;ll expand to others.
            No VC backing, no ads in your face, no artificial urgency. Just a clean, honest tool for
            student-to-student commerce.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-neutral-muted">
            Questions? Ideas?{' '}
            <a
              href="/contact"
              className="text-primary underline underline-offset-2 hover:text-primary-hover focus:outline-none focus:ring-2 focus:ring-primary rounded"
            >
              Reach out
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
