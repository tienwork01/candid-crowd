import type { Metadata } from "next";
import { AccountRecovery } from "@/features/auth/components/account-recovery";

export const metadata: Metadata = { title: "Reset password - CandidCrowd" };

export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/reset-password">) {
  const { token } = await searchParams;

  return (
    <AccountRecovery
      mode="reset-password"
      token={typeof token === "string" ? token : undefined}
    />
  );
}
