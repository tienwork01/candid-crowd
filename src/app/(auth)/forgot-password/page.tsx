import type { Metadata } from "next";
import { AccountRecovery } from "@/features/auth/components";

export const metadata: Metadata = { title: "Forgot password - CandidCrowd" };

export default async function ForgotPasswordPage({
  searchParams,
}: PageProps<"/forgot-password">) {
  const { next } = await searchParams;

  return (
    <AccountRecovery
      mode="forgot-password"
      nextPath={typeof next === "string" ? next : undefined}
    />
  );
}
