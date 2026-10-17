import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Campus Listings',
  description: 'Find textbooks, lab coats, drafters, electronics, and hostel essentials from verified students on your campus.',
  openGraph: {
    title: 'Browse Campus Listings — UniDeal',
    description: 'Find textbooks, lab coats, drafters, electronics, and hostel essentials from verified students on your campus.',
  },
};

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
