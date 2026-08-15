import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

type SellerInfo = {
  id: string;
  full_name: string;
  branch: string | null;
  year: string | null;
};

type ListingCardProps = {
  listing: {
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
};

export function ListingCard({ listing }: ListingCardProps) {
  const { title, price, negotiable, condition, images, slug, seller, status } = listing;
  const mainImage = images[0] || "/placeholder-listing.png";

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price));

  const showStatusBadge = status !== "approved";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-surface shadow-sm transition-all duration-base ease-base hover:shadow-md">
      {/* Listing Detail Link wrapper */}
      <Link href={`/listing/${slug}`} className="flex flex-col h-full">
        {/* Image Area */}
        <div className="relative aspect-square w-full overflow-hidden bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mainImage}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-base ease-base group-hover:scale-105"
            loading="lazy"
          />
          {showStatusBadge ? (
            <div className="absolute left-2 top-2 uppercase tracking-wider">
              <Badge variant={status === "sold" ? "default" : status === "pending" ? "accent" : "danger"}>
                {status === "sold" ? "Sold" : status === "pending" ? "Under Review" : status}
              </Badge>
            </div>
          ) : null}
        </div>

        {/* Info Area */}
        <div className="flex flex-1 flex-col p-4 space-y-2">
          {/* Price & Negotiable */}
          <div className="flex items-baseline justify-between">
            <span className="font-display text-heading text-accent">
              {formattedPrice}
            </span>
            {negotiable ? (
              <span className="font-body text-caption text-text-muted">
                Negotiable
              </span>
            ) : null}
          </div>

          {/* Title */}
          <h3 className="line-clamp-1 font-body text-body font-semibold text-text group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Condition Badge */}
          <div className="flex">
            <Badge variant="default">
              {condition}
            </Badge>
          </div>

          {/* Seller Metadata Row */}
          {seller ? (
            <div className="border-t pt-2 mt-auto">
              <p className="line-clamp-1 font-body text-caption text-text-muted">
                <span className="font-semibold text-text">{seller.full_name}</span>
                {seller.branch || seller.year ? " • " : ""}
                {seller.branch}
                {seller.branch && seller.year ? ` (${seller.year})` : seller.year}
              </p>
            </div>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
