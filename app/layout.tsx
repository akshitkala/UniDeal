import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import TopNav from '@/components/nav/TopNav';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'UniDeal — Campus Marketplace',
  description: 'Buy and sell physical items with verified students on your university campus.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="min-h-screen bg-white text-neutral-text font-body antialiased flex flex-col">
        <AuthProvider>
          <TopNav />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
