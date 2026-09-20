'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import ListingForm from '@/components/listing/ListingForm';
import type { ListingCondition } from '@/types/domain';
import { AlertCircle, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CategoryOption {
  id: number;
  name: string;
  slug: string;
}

interface EditListingPageProps {
  params: {
    slug: string;
  };
}

export default function EditListingPage({ params }: EditListingPageProps) {
  const { slug } = params;
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [initialData, setInitialData] = useState<{
    id: string;
    title: string;
    description: string;
    price: number;
    negotiable: boolean;
    category_id: number;
    condition: ListingCondition;
    images: string[];
  } | null>(null);
  const [loadingListing, setLoadingListing] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      // 1. Load categories
      const { data: catData } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('id');
      if (catData) setCategories(catData);

      // 2. Load listing by slug
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .select('id, seller_id, title, description, price, negotiable, category_id, condition, images')
        .eq('slug', slug)
        .single();

      if (listingError || !listingData) {
        setErrorMessage('Listing not found.');
      } else {
        setInitialData(listingData);
      }
      setLoadingListing(false);
    }

    loadData();
  }, [slug, supabase]);

  if (isLoading || loadingListing) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-neutral-muted">
        Loading listing details...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <div className="p-8 rounded-lg bg-surface border border-border space-y-4">
          <Lock className="w-8 h-8 text-neutral-muted mx-auto" />
          <h1 className="text-xl font-bold text-neutral-text font-heading">Sign In Required</h1>
          <p className="text-sm text-neutral-muted">You must sign in to edit listings.</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !initialData) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <div className="p-8 rounded-lg bg-surface border border-border space-y-4">
          <AlertCircle className="w-8 h-8 text-danger mx-auto" />
          <h1 className="text-xl font-bold text-neutral-text font-heading">Not Found</h1>
          <p className="text-sm text-neutral-muted">{errorMessage || 'Could not find listing.'}</p>
          <Link href="/browse" className="text-sm text-primary font-medium hover:underline inline-block">
            Return to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link
          href={`/listing/${slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-neutral-muted hover:text-primary mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Listing</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-text font-heading">
          Edit Listing
        </h1>
        <p className="text-sm text-neutral-muted mt-1">
          Update price, photos, or description for &ldquo;{initialData.title}&rdquo;.
        </p>
      </div>

      <ListingForm
        initialData={initialData}
        categories={categories}
        isEditing={true}
      />
    </div>
  );
}
