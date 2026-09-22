'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { firstName } from '@/lib/display-name';
import { createClient } from '@/lib/supabase/client';
import { PlusCircle, User, LogOut, LayoutDashboard, Shield, Menu, X } from 'lucide-react';

export default function TopNav() {
  const pathname = usePathname();
  const { user, isVerified, openAuthModal, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const supabase = createClient();

  // QA-04: gate the Admin link on is_admin from public_profiles
  React.useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('public_profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();
      if (!cancelled) setIsAdmin(!!data?.is_admin);
    })();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const displayName = user?.user_metadata?.full_name
    ? firstName(user.user_metadata.full_name)
    : 'Student';

  const handleSellClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      openAuthModal({ tab: 'login', returnTo: '/sell' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-neutral-text font-heading">
          <span className="w-8 h-8 rounded-md bg-primary text-white flex items-center justify-center font-display font-extrabold text-lg">
            U
          </span>
          <span>UniDeal</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/browse"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname.startsWith('/browse') ? 'text-primary font-semibold' : 'text-neutral-text'
            }`}
          >
            Browse
          </Link>
          <Link
            href="/how-it-works"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/how-it-works' ? 'text-primary font-semibold' : 'text-neutral-muted'
            }`}
          >
            How It Works
          </Link>
          <Link
            href="/our-story"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/our-story' ? 'text-primary font-semibold' : 'text-neutral-muted'
            }`}
          >
            Our Story
          </Link>
          <Link
            href="/contact"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/contact' ? 'text-primary font-semibold' : 'text-neutral-muted'
            }`}
          >
            Contact Us
          </Link>
        </nav>

        {/* Desktop CTA & Auth Section */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/sell"
            onClick={handleSellClick}
            className="py-2 px-3.5 bg-primary text-white rounded-md font-medium text-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors min-h-[40px] flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Sell Item</span>
          </Link>

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 py-1.5 px-3 rounded-md border border-border hover:bg-surface text-sm font-medium text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary min-h-[40px] transition-colors"
                aria-expanded={profileDropdownOpen}
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  {displayName[0]?.toUpperCase() || 'S'}
                </div>
                <span>{displayName}</span>
              </button>

              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-md border border-border py-1 z-20 animate-in fade-in duration-150">
                    {!isVerified && (
                      <Link
                        href="/verify-email"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-xs font-semibold text-accent bg-accent/5 hover:bg-accent/10 border-b border-border"
                      >
                        Verify Your Email ⚠️
                      </Link>
                    )}
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-text hover:bg-surface"
                    >
                      <LayoutDashboard className="w-4 h-4 text-neutral-muted" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-text hover:bg-surface"
                    >
                      <User className="w-4 h-4 text-neutral-muted" />
                      <span>Profile</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-text hover:bg-surface"
                      >
                        <Shield className="w-4 h-4 text-neutral-muted" />
                        <span>Admin</span>
                      </Link>
                    )}
                    <div className="border-t border-border my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        signOut();
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-danger hover:bg-danger/5 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal({ tab: 'login' })}
              className="py-2 px-3.5 bg-white text-neutral-text border border-border rounded-md font-medium text-sm hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary transition-colors min-h-[40px]"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile right side — Sign In shortcut (logged-out) or Sell Item (logged-in) + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          {user ? (
            <Link
              href="/sell"
              onClick={handleSellClick}
              className="py-1.5 px-3 bg-primary text-white rounded-md font-medium text-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary min-h-[40px] flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Sell</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal({ tab: 'login' })}
              className="py-1.5 px-3 bg-white text-neutral-text border border-border rounded-md font-medium text-sm hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary min-h-[40px]"
            >
              Sign In
            </button>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 text-neutral-text hover:bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white p-4 space-y-3">
          <nav className="flex flex-col gap-2">
            <Link
              href="/browse"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-md text-neutral-text hover:bg-surface text-sm font-medium"
            >
              Browse Listings
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-md text-neutral-muted hover:bg-surface text-sm font-medium"
            >
              How It Works
            </Link>
            <Link
              href="/our-story"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-md text-neutral-muted hover:bg-surface text-sm font-medium"
            >
              Our Story
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-md text-neutral-muted hover:bg-surface text-sm font-medium"
            >
              Contact Us
            </Link>
          </nav>

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Link
              href="/sell"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleSellClick(e);
              }}
              className="w-full py-2.5 px-4 bg-primary text-white rounded-md font-medium text-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center gap-2 min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Sell an Item</span>
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 px-4 bg-surface text-neutral-text rounded-md font-medium text-sm text-center min-h-[44px] flex items-center justify-center"
                >
                  Dashboard ({displayName})
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 px-4 bg-surface text-neutral-text rounded-md font-medium text-sm text-center min-h-[44px] flex items-center justify-center"
                >
                  Profile
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2 px-4 bg-surface text-neutral-text rounded-md font-medium text-sm text-center min-h-[44px] flex items-center justify-center"
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="w-full py-2 px-4 text-danger rounded-md font-medium text-sm text-center min-h-[44px] flex items-center justify-center"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal({ tab: 'login' });
                }}
                className="w-full py-2.5 px-4 bg-surface text-neutral-text border border-border rounded-md font-medium text-sm text-center min-h-[44px] flex items-center justify-center"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
