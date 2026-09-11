interface ListingDetailPageProps {
  params: {
    slug: string;
  };
}

export default function ListingDetailPage({ params }: ListingDetailPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-text font-heading mb-4">
        Listing: {params.slug}
      </h1>
      <p className="text-neutral-muted">Listing detail view will load here.</p>
    </div>
  );
}
