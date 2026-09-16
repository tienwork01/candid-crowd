import type { Metadata } from "next";
import { AccountRecovery } from "@/features/auth/components";

export const metadata: Metadata = { title: "Verify email - CandidCrowd" };

export default async function VerifyEmailPage({
  searchParams,
}: PageProps<"/verify-email">) {
  const { email, next } = await searchParams;

  return (
    <AccountRecovery
      mode="verify-email"
      email={typeof email === "string" ? email : undefined}
      nextPath={typeof next === "string" ? next : undefined}
    />
  );
}
