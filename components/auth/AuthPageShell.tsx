import Link from "next/link";
import type { ReactNode } from "react";

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
};

export function AuthPageShell({
  eyebrow,
  title,
  description,
  footer,
  children,
}: AuthPageShellProps) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <section className="w-full max-w-md rounded-lg border bg-surface px-6 py-8 shadow-sm sm:px-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex font-body text-caption uppercase tracking-[0.12em] text-primary transition-colors duration-base ease-base hover:text-primary-hover"
            >
              {eyebrow}
            </Link>
            <div className="space-y-2">
              <h1 className="font-display text-heading text-text">{title}</h1>
              <p className="font-body text-body text-text-muted">{description}</p>
            </div>
          </div>

          {children}

          <div className="border-t pt-4 font-body text-caption text-text-muted">{footer}</div>
        </div>
      </section>
    </main>
  );
}
