import Link from 'next/link';
import { SearchX, ArrowRight, Home } from 'lucide-react';

export const metadata = {
  title: 'Page Not Found — UniDeal',
  description: 'The page you are looking for does not exist on UniDeal.',
};

export default function NotFound() {
  return (
    <main id="main-content" className="min-h-[65vh] flex items-center justify-center px-4 py-16 bg-surface">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-xl border border-border shadow-sm">
        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-5 text-neutral-muted">
          <SearchX className="w-8 h-8 text-neutral-muted" />
        </div>
        <span className="text-xs font-semibold tracking-wider text-primary uppercase">Error 404</span>
        <h1 className="text-2xl font-bold font-heading text-neutral-text mt-2 mb-3">
          Page Not Found
        </h1>
        <p className="text-sm text-neutral-muted mb-8 leading-relaxed">
          The page you are looking for doesn’t exist, has been removed, or the link may be outdated.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/browse"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] transition-colors"
          >
            <span>Browse Listings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-border text-neutral-text rounded-md text-sm font-medium hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] transition-colors"
          >
            <Home className="w-4 h-4 text-neutral-muted" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
