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
    </AuthPageShell>
  );
}
