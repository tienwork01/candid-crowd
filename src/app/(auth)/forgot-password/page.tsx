import type { Metadata } from "next";
import { AccountRecovery } from "@/features/auth/components";

export const metadata: Metadata = { title: "Forgot password - CandidCrowd" };

export default function ForgotPasswordPage() {
  return <AccountRecovery mode="forgot-password" />;
}
