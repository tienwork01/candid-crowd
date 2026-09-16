import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/components";

export const metadata: Metadata = { title: "Create an account - CandidCrowd" };

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
