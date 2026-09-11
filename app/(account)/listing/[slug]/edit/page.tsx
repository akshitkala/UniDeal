interface EditListingPageProps {
  params: {
    slug: string;
  };
}

export default function EditListingPage({ params }: EditListingPageProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-neutral-text font-heading mb-6">
        Edit Listing: {params.slug}
      </h1>
      <p className="text-neutral-muted">Pre-filled edit form will load here in Phase 3.</p>
    </div>
  );
}
