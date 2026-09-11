export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-neutral-text font-heading mb-6">How It Works</h1>
      <div className="grid gap-6">
        <div className="p-6 rounded-md bg-surface border border-border">
          <h2 className="text-xl font-semibold mb-2">1. List Your Item</h2>
          <p className="text-neutral-muted">Add photos, set your price, and describe condition in under two minutes.</p>
        </div>
        <div className="p-6 rounded-md bg-surface border border-border">
          <h2 className="text-xl font-semibold mb-2">2. Discover & Verify</h2>
          <p className="text-neutral-muted">Search through listings from verified students on campus.</p>
        </div>
        <div className="p-6 rounded-md bg-surface border border-border">
          <h2 className="text-xl font-semibold mb-2">3. Connect on WhatsApp</h2>
          <p className="text-neutral-muted">Tap Contact Seller to open a pre-filled WhatsApp chat and arrange meetup.</p>
        </div>
      </div>
    </div>
  );
}
