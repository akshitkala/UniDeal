import ContactForm from '@/components/contact/ContactForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us — UniDeal',
  description: "Have feedback, questions, or issues? Write to us here and we'll get back to you.",
};

export default function ContactUsPage() {
  return (
    <main className="flex-1 bg-white">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-16">
        {/* Heading block (full width, left-aligned) */}
        <div className="mb-8 md:mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-text font-heading">
            Contact Us
          </h1>
          <p className="mt-2 text-base text-neutral-muted font-body max-w-xl [text-wrap:balance]">
            Have feedback, questions, or issues? Write to us here and we&apos;ll get back to you.
          </p>
        </div>

        {/* Form and Panel layout */}
        <ContactForm />
      </div>
    </main>
  );
}
