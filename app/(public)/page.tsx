export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-2xl space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-text font-display">
          Buy and sell on campus with <span className="text-primary">verified students</span>.
        </h1>
        <p className="text-lg text-neutral-muted max-w-xl mx-auto">
          No buried WhatsApp messages. No anonymous strangers. The structured, trusted marketplace for university life.
        </p>
      </div>
    </main>
  );
}
