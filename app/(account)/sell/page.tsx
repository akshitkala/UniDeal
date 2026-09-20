'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import ListingForm from '@/components/listing/ListingForm';
import { AlertCircle, Lock, Mail, ArrowRight } from 'lucide-react';

interface CategoryOption {
  id: number;
  name: string;
  slug: string;
}

export default function SellPage() {
  const { user, isVerified, isLoading, openAuthModal } = useAuth();
  const supabase = createClient();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('id');
      if (data) {
        setCategories(data);
      }
      setLoadingCategories(false);
    }

    loadCategories();
  }, [supabase]);

  if (isLoading || loadingCategories) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-neutral-muted">
        Loading...
      </div>
    );
  }

  // Not logged in gate
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <div className="p-8 rounded-lg bg-surface border border-border space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-text font-heading">
            Sign In to Sell
          </h1>
          <p className="text-sm text-neutral-muted leading-relaxed">
            You must have a verified UniDeal student account to post physical items for sale on campus.
          </p>
          <div className="pt-4">
            <button
              type="button"
              onClick={() => openAuthModal({ tab: 'login', returnTo: '/sell' })}
              className="w-full py-2.5 px-4 bg-primary text-white rounded-md font-medium text-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors min-h-[44px] flex items-center justify-center gap-2"
            >
              <span>Sign In / Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Logged in but unverified gate
  if (!isVerified) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <div className="p-8 rounded-lg bg-surface border border-border space-y-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-text font-heading">
            Email Verification Required
          </h1>
          <p className="text-sm text-neutral-muted leading-relaxed">
            Please verify your student email address before creating listings on campus.
          </p>
          <div className="pt-4">
            <Link
              href="/verify-email"
              className="w-full py-2.5 px-4 bg-primary text-white rounded-md font-medium text-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors min-h-[44px] flex items-center justify-center gap-2"
            >
              <span>Go to Verification Page</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authorized and verified seller
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-text font-heading">
          Post an Item for Sale
        </h1>
        <p className="text-sm text-neutral-muted mt-1">
          Fill in the details below. Once posted, buyers on campus can reach you on WhatsApp.
        </p>
      </div>

      <ListingForm categories={categories} />
    </div>
  );
}
