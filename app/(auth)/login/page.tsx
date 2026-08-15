import { LoginForm } from "@/components/auth/LoginForm";

type LoginPageProps = {
  searchParams?: Promise<{
    returnTo?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const returnTo = resolvedSearchParams?.returnTo ?? "/dashboard";

  return <LoginForm returnTo={returnTo} />;
}
