import type { Metadata } from "next";
import { AccountRecovery } from "@/features/auth/components";

export const metadata: Metadata = { title: "Reset password - CandidCrowd" };

export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/reset-password">) {
  const { token, next } = await searchParams;

  return (
    <AccountRecovery
      mode="reset-password"
      token={typeof token === "string" ? token : undefined}
      nextPath={typeof next === "string" ? next : undefined}
    />
  );
}
