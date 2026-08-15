export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <section className="w-full max-w-3xl rounded-lg border bg-surface px-6 py-10 shadow-sm sm:px-10 sm:py-14">
        <div className="space-y-4 text-center sm:text-left">
          <p className="font-body text-caption uppercase tracking-[0.12em] text-text-muted">
            UniDeal Foundation
          </p>
          <h1 className="font-display text-display text-text">
            The app shell is ready for the first build phase.
          </h1>
          <p className="max-w-2xl font-body text-body text-text-muted">
            Next.js, TypeScript, Tailwind, and the UniDeal design tokens are wired. Product
            screens, Supabase, and Cloudinary setup come next.
          </p>
        </div>
      </section>
    </main>
  );
}
