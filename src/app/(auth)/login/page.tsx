import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/components/auth-form";

export const metadata: Metadata = { title: "Log in - CandidCrowd" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;

  return (
    <AuthForm
      mode="login"
      nextPath={typeof next === "string" ? next : undefined}
    />
  );
}
