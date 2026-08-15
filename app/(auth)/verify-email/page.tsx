import Link from "next/link";

type VerifyEmailPageProps = {
  searchParams?: Promise<{
    email?: string;
    returnTo?: string;
  }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const resolvedSearchParams = await searchParams;
  const email = resolvedSearchParams?.email;
  const returnTo = resolvedSearchParams?.returnTo ?? "/dashboard";
  const loginHref =
    returnTo === "/dashboard"
      ? "/login"
      : `/login?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <section className="w-full max-w-md rounded-lg border bg-surface px-6 py-8 shadow-sm sm:px-8">
        <div className="space-y-4">
          <p className="font-body text-caption uppercase tracking-[0.12em] text-primary">
            UniDeal
          </p>
          <div className="space-y-2">
            <h1 className="font-display text-heading text-text">Verify your email</h1>
            <p className="font-body text-body text-text-muted">
              Check your inbox and open the verification link before you try to post a listing or
              contact a seller.
            </p>
          </div>

          <div className="rounded-md border bg-background px-4 py-4">
            <p className="font-body text-body text-text">
              {email
                ? `We sent a verification email to ${email}.`
                : "We sent you a verification email."}
            </p>
            <p className="mt-2 font-body text-caption text-text-muted">
              Once you&apos;ve verified your email, sign in and continue where you left off.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={loginHref}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-3 font-body text-body text-on-primary transition-colors duration-base ease-base hover:bg-primary-hover"
            >
              Go to sign in
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-3 font-body text-body text-text transition-colors duration-base ease-base hover:bg-surface"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
