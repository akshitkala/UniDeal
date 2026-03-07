'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface ListingDrawerContextType {
    isOpen: boolean;
    slug: string | null;
    initialData: any | null;
    openListing: (slug: string, data?: any) => void;
    closeListing: () => void;
}

const ListingDrawerContext = createContext<ListingDrawerContextType | undefined>(undefined);

export function ListingDrawerProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [slug, setSlug] = useState<string | null>(null);
    const [initialData, setInitialData] = useState<any | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    const openListing = useCallback((newSlug: string, data?: any) => {
        setSlug(newSlug);
        setInitialData(data || null);
        setIsOpen(true);
        // Push state to URL without full navigation if we want to support back button
        // router.push(`/listings/${newSlug}`, { scroll: false });
    }, []);

    const closeListing = useCallback(() => {
        setIsOpen(false);
        // If we updated the URL, we should probably handle it here
        // if (pathname.startsWith('/listings/')) {
        //    router.back();
        // }
    }, [pathname, router]);

    return (
        <ListingDrawerContext.Provider value={{ isOpen, slug, initialData, openListing, closeListing }}>
            {children}
        </ListingDrawerContext.Provider>
    );
}

export function useListingDrawer() {
    const context = useContext(ListingDrawerContext);
    if (context === undefined) {
        throw new Error('useListingDrawer must be used within a ListingDrawerProvider');
    }
    return context;
}
