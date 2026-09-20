'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Settings, Clock, AlertTriangle, Users, ArrowLeft } from 'lucide-react';

const adminNavLinks = [
  { href: '/admin', label: 'Settings', icon: Settings },
  { href: '/admin/listings/pending', label: 'Pending Queue', icon: Clock },
  { href: '/admin/reports', label: 'Reports', icon: AlertTriangle },
  { href: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-neutral-text font-heading leading-tight">
                UniDeal Admin Console
              </h1>
              <p className="text-xs text-neutral-muted">Platform Management & Moderation</p>
            </div>
          </div>

          <Link
            href="/browse"
            className="text-xs font-medium text-neutral-muted hover:text-primary transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Site</span>
          </Link>
        </div>

        {/* Sub-nav tabs */}
        <div className="container mx-auto px-4 flex border-t border-border overflow-x-auto no-scrollbar">
          {adminNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-neutral-muted hover:text-neutral-text'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 flex-1 max-w-5xl">
        {children}
      </main>
    </div>
  );
}
