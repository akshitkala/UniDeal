import { ListingCard } from "./ListingCard";
import { EmptyState } from "@/components/ui/EmptyState";

type SellerInfo = {
  id: string;
  full_name: string;
  branch: string | null;
  year: string | null;
};

type Listing = {
  id: string;
  slug: string;
  title: string;
  price: number | string;
  negotiable: boolean;
  condition: string;
  images: string[];
  status: string;
  seller?: SellerInfo;
};

type ListingGridProps = {
  listings: Listing[];
  emptyState?: React.ReactNode;
};

export function ListingGrid({ listings, emptyState }: ListingGridProps) {
  if (listings.length === 0) {
    return (
      emptyState || (
        <EmptyState
          title="No listings found"
          description="Try adjusting your search terms or filters."
        />
      )
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
