'use client';

import React from 'react';
import RecentListingsSection from './RecentListingsSection';
import type { ListingCardData } from '@/components/listing/ListingCard';

interface Props {
  listings: ListingCardData[];
}

/**
 * FreshOnCampus component.
 * Renders the recent listings section under the requested name.
 */
export default function FreshOnCampus({ listings }: Props) {
  return <RecentListingsSection listings={listings} />;
}
