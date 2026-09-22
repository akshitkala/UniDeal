import type { Metadata } from 'next';
import OurStoryClient from './OurStoryClient';

export const metadata: Metadata = {
  title: 'Our Story — UniDeal',
  description: 'How UniDeal started, and why we built a structured campus marketplace.',
};

export default function OurStoryPage() {
  return <OurStoryClient />;
}
