import { SignupForm } from "@/components/auth/SignupForm";

type SignupPageProps = {
  searchParams?: Promise<{
    returnTo?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const resolvedSearchParams = await searchParams;
  const returnTo = resolvedSearchParams?.returnTo ?? "/dashboard";

  return <SignupForm returnTo={returnTo} />;
}
