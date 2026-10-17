import type { Metadata } from 'next';
import { Outfit, Work_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import TopNav from '@/components/nav/TopNav';
import Footer from '@/components/nav/Footer';


const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'UniDeal — Campus Marketplace',
    template: '%s — UniDeal',
  },
  description: 'Buy and sell physical items with verified students on your university campus.',
  openGraph: {
    title: 'UniDeal — Campus Marketplace',
    description: 'Buy and sell physical items with verified students on your university campus.',
    url: '/',
    siteName: 'UniDeal',
    images: [
      {
        url: '/hero-campus.webp',
        width: 1200,
        height: 630,
        alt: 'UniDeal Campus Marketplace',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UniDeal — Campus Marketplace',
    description: 'Buy and sell physical items with verified students on your university campus.',
    images: ['/hero-campus.webp'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${workSans.variable} ${outfit.variable}`}>
      <body className="min-h-screen bg-white text-neutral-text font-body antialiased flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 font-medium text-sm"
        >
          Skip to content
        </a>
        <AuthProvider>
          <TopNav />
          <main id="main-content" className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
