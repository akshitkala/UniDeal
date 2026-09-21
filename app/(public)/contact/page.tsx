import ContactForm from '@/components/contact/ContactForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us — UniDeal',
  description: 'Have feedback or questions? Reach out to the UniDeal team.',
};

export default function ContactUsPage() {
  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <h1 className="text-3xl font-bold text-neutral-text font-heading mb-2">Contact Us</h1>
        <p className="text-neutral-muted mb-8">
          Have feedback, questions, or issues? Reach out and we&rsquo;ll get back to you soon.
        </p>
        <ContactForm />
      </div>
    </main>
  );
}
