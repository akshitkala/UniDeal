"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SignupFormProps = {
  returnTo: string;
};

export function SignupForm({ returnTo }: SignupFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setErrorMessage("Couldn't create your account. Check the form and try again.");
        return;
      }

      const verifyUrl = `/verify-email?email=${encodeURIComponent(email)}&returnTo=${encodeURIComponent(returnTo)}`;
      router.replace(verifyUrl);
    });
  }

  function handleGoogleSignIn() {
    setErrorMessage(null);

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}${returnTo}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) {
        setErrorMessage(error.message || "Couldn't sign up with Google.");
      }
    });
  }

  return (
    <AuthPageShell
      eyebrow="UniDeal"
      title="Create your account"
      description="You can browse as a guest, but you'll need an account and a verified email to post or contact a seller."
      footer={
        <p>
          Already have an account?{" "}
          <Link
            href={returnTo === "/dashboard" ? "/login" : `/login?returnTo=${encodeURIComponent(returnTo)}`}
            className="text-primary transition-colors duration-base ease-base hover:text-primary-hover"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <div className="space-y-4">
        <button
          type="button"
          disabled={isPending}
          onClick={handleGoogleSignIn}
          className="inline-flex w-full items-center justify-center gap-3 rounded-md border border-border bg-white px-4 py-3 font-body text-body font-medium text-text shadow-sm transition-colors duration-base ease-base hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative bg-white px-3 text-caption font-body text-text-muted">
            or sign up with email
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block font-body text-caption text-text" htmlFor="fullName">
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full rounded-md border bg-background px-4 py-3 font-body text-body text-text outline-none transition-colors duration-base ease-base placeholder:text-text-muted focus:border-primary"
              placeholder="Your name"
              minLength={2}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block font-body text-caption text-text" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border bg-background px-4 py-3 font-body text-body text-text outline-none transition-colors duration-base ease-base placeholder:text-text-muted focus:border-primary"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block font-body text-caption text-text" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border bg-background px-4 py-3 font-body text-body text-text outline-none transition-colors duration-base ease-base placeholder:text-text-muted focus:border-primary"
              placeholder="Create a password"
              minLength={8}
              required
            />
          </div>

          {errorMessage ? (
            <p className="rounded-md border border-danger/20 bg-danger/5 px-4 py-3 font-body text-caption text-danger">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 font-body text-body text-on-primary transition-colors duration-base ease-base hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Creating your account..." : "Create account"}
          </button>
        </form>
      </div>
    </AuthPageShell>
  );
}
