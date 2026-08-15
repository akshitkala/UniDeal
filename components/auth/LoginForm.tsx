"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type LoginFormProps = {
  returnTo: string;
};

export function LoginForm({ returnTo }: LoginFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage("Couldn't sign you in. Check your email and password and try again.");
        return;
      }

      setMessage("Signed in. Redirecting you now.");
      router.replace(returnTo);
      router.refresh();
    });
  }

  return (
    <AuthPageShell
      eyebrow="UniDeal"
      title="Sign in to your account"
      description="Browse freely as a guest, then sign in when you're ready to post or contact a seller."
      footer={
        <p>
          New here?{" "}
          <Link
            href={returnTo === "/dashboard" ? "/signup" : `/signup?returnTo=${encodeURIComponent(returnTo)}`}
            className="text-primary transition-colors duration-base ease-base hover:text-primary-hover"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
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
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border bg-background px-4 py-3 font-body text-body text-text outline-none transition-colors duration-base ease-base placeholder:text-text-muted focus:border-primary"
            placeholder="Enter your password"
            required
          />
        </div>

        {errorMessage ? (
          <p className="rounded-md border border-danger/20 bg-danger/5 px-4 py-3 font-body text-caption text-danger">
            {errorMessage}
          </p>
        ) : null}

        {message ? (
          <p className="rounded-md border border-success/20 bg-success/5 px-4 py-3 font-body text-caption text-success">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 font-body text-body text-on-primary transition-colors duration-base ease-base hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Signing you in..." : "Sign in"}
        </button>
      </form>
    </AuthPageShell>
  );
}
