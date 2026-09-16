import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/components";

export const metadata: Metadata = { title: "Create an account - CandidCrowd" };

export default async function RegisterPage({
  searchParams,
}: PageProps<"/register">) {
  const { next } = await searchParams;

  return (
    <AuthForm
      mode="register"
      nextPath={typeof next === "string" ? next : undefined}
    />
  );
}
