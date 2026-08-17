"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

type Listing = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  negotiable: boolean;
  condition: string;
  images: string[];
  status: "approved" | "pending" | "rejected" | "sold" | "expired";
  rejection_reason: string | null;
  views: number;
  created_at: string;
  category: {
    name: string;
    slug: string;
  } | null;
};

type DashboardClientProps = {
  initialListings: Listing[];
};

type TabType = "approved" | "pending" | "sold" | "rejected";

export function DashboardClient({ initialListings }: DashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("approved");
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  // Sync listings state if initialListings changes
  if (JSON.stringify(initialListings) !== JSON.stringify(listings)) {
    setListings(initialListings);
  }

  // Filter listings based on status mapping
  const filteredListings = listings.filter((l) => l.status === activeTab);

  // Tabs structure
  const tabs = [
    { id: "approved" as TabType, label: "Active", count: listings.filter(l => l.status === "approved").length },
    { id: "pending" as TabType, label: "Under Review", count: listings.filter(l => l.status === "pending").length },
    { id: "sold" as TabType, label: "Sold", count: listings.filter(l => l.status === "sold").length },
    { id: "rejected" as TabType, label: "Rejected", count: listings.filter(l => l.status === "rejected").length },
  ];

  // Action handlers
  const handleMarkAsSold = (id: string) => {
    if (!confirm("Are you sure you want to mark this item as sold?")) return;
    setActionError(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/listings/${id}/sold`, {
          method: "POST",
        });

        const json = await response.json();

        if (!response.ok) {
          setActionError(json.error?.message || "Failed to mark as sold.");
          return;
        }

        // Update local state for fast UI update
        setListings(
          listings.map((l) => (l.id === id ? { ...l, status: "sold" } : l))
        );
        router.refresh();
      } catch (error) {
        console.error("Mark as sold error:", error);
        setActionError("Network error. Failed to mark listing as sold.");
      }
    });
  };

  const handleDeleteListing = (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this listing? This action cannot be undone.")) return;
    setActionError(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/listings/${id}`, {
          method: "DELETE",
        });

        const json = await response.json();

        if (!response.ok) {
          setActionError(json.error?.message || "Failed to delete listing.");
          return;
        }

        // Update local state
        setListings(listings.filter((l) => l.id !== id));
        router.refresh();
      } catch (error) {
        console.error("Delete listing error:", error);
        setActionError("Network error. Failed to delete listing.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Action error banner */}
      {actionError ? (
        <div className="rounded-md border border-danger/20 bg-danger/5 px-4 py-3 font-body text-caption text-danger">
          {actionError}
        </div>
      ) : null}

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex space-x-8 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 py-4 px-1 font-display text-body font-semibold whitespace-nowrap transition-colors outline-none ${
                  isTabActive
                    ? "border-primary text-primary"
                    : "border-transparent text-text-muted hover:text-text"
                }`}
              >
                {tab.label}{" "}
                <span
                  className={`ml-1 text-caption font-normal font-body px-2 py-0.5 rounded-full ${
                    isTabActive ? "bg-primary/10 text-primary" : "bg-surface text-text-muted"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Listings List */}
      {filteredListings.length === 0 ? (
        <EmptyState
          title={`No ${activeTab === "approved" ? "active" : activeTab === "pending" ? "pending review" : activeTab} listings`}
          description={
            activeTab === "approved"
              ? "You don't have any items currently listed for sale."
              : activeTab === "pending"
              ? "All your listings are currently live."
              : activeTab === "sold"
              ? "Mark your items as sold to keep track of transactions here!"
              : "No rejected listings found."
          }
          className="py-16 bg-surface/50 border border-dashed rounded-lg border-border"
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => {
            const formattedPrice = new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(listing.price);

            const image = listing.images[0] || "/placeholder-listing.png";

            return (
              <article
                key={listing.id}
                className="flex flex-col overflow-hidden rounded-md border border-border bg-surface shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-background">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={listing.title}
                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute left-3 top-3">
                    {listing.status === "approved" ? (
                      <Badge variant="primary">Active</Badge>
                    ) : listing.status === "pending" ? (
                      <Badge variant="accent">Under Review</Badge>
                    ) : listing.status === "sold" ? (
                      <Badge variant="default">Sold</Badge>
                    ) : (
                      <Badge variant="danger">Rejected</Badge>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="flex flex-1 flex-col p-5 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-body text-caption text-text-muted">
                        {listing.category?.name || "Other"}
                      </span>
                      <span className="font-display text-body font-bold text-accent">
                        {formattedPrice}
                      </span>
                    </div>
                    <h3 className="font-display text-body text-text font-semibold line-clamp-1">
                      {listing.title}
                    </h3>
                    <p className="font-body text-caption text-text-muted line-clamp-2">
                      {listing.description}
                    </p>
                  </div>

                  {/* Inline Rejection Reason (ui-direction.md §4.3) */}
                  {listing.status === "rejected" && listing.rejection_reason && (
                    <div className="rounded-sm border border-danger/20 bg-danger/5 p-3 font-body text-caption text-danger">
                      <p className="font-semibold mb-1">Rejection Reason:</p>
                      <p className="font-normal italic leading-relaxed">
                        &quot;{listing.rejection_reason}&quot;
                      </p>
                    </div>
                  )}

                  <hr className="border-border mt-auto" />

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    {listing.status === "approved" && (
                      <>
                        <Button
                          type="button"
                          variant="primary"
                          disabled={isPending}
                          onClick={() => handleMarkAsSold(listing.id)}
                          className="flex-1 font-semibold text-caption py-2"
                        >
                          Mark Sold
                        </Button>
                        <Link
                          href={`/listing/${listing.slug}/edit`}
                          className="flex-1 text-center font-body text-caption font-semibold px-4 py-2 border rounded-md border-border text-text hover:bg-white hover:border-primary hover:text-primary transition-all duration-200"
                        >
                          Edit
                        </Link>
                      </>
                    )}

                    {(listing.status === "pending" || listing.status === "rejected") && (
                      <Link
                        href={`/listing/${listing.slug}/edit`}
                        className="flex-1 text-center font-body text-caption font-semibold px-4 py-2 border rounded-md border-border text-text hover:bg-white hover:border-primary hover:text-primary transition-all duration-200"
                      >
                        Edit
                      </Link>
                    )}

                    <Button
                      type="button"
                      variant="danger"
                      disabled={isPending}
                      onClick={() => handleDeleteListing(listing.id)}
                      className={`${
                        listing.status === "approved" ? "px-3" : "flex-1"
                      } font-semibold text-caption py-2`}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
