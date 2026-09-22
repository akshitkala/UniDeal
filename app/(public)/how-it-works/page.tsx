import type { Metadata } from 'next';
import HowItWorksClient from './HowItWorksClient';

export const metadata: Metadata = {
  title: 'How It Works — UniDeal',
  description: 'List, discover, and connect with verified campus sellers on UniDeal.',
};

export default function HowItWorksPage() {
  return <HowItWorksClient />;
}
