import type { Metadata } from "next";
import { CreditCard } from "@phosphor-icons/react/dist/ssr";
import { HostShell } from "@/features/host/components";

export const metadata: Metadata = { title: "Plan & billing — CandidCrowd" };

export default function BillingPage() {
  return (
    <HostShell active="billing">
      <section className="host-account-page" aria-labelledby="billing-title">
        <p className="eyebrow">ACCOUNT</p>
        <h1 id="billing-title">Plan &amp; billing</h1>
        <div className="host-account-page__card">
          <CreditCard size={22} aria-hidden="true" />
          <div>
            <h2>Free plan</h2>
            <p>
              Plans, invoices, and usage will appear here when billing launches.
            </p>
          </div>
        </div>
      </section>
    </HostShell>
  );
}
