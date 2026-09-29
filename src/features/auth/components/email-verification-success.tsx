"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Brand } from "@/components/shared";
import { getSafeAuthRedirect } from "@/lib/auth-redirect";

export function EmailVerificationSuccess({
  nextPath,
  error,
}: {
  nextPath?: string;
  error?: string;
}) {
  const t = useTranslations("auth.recovery");
  const safeNextPath = getSafeAuthRedirect(nextPath);
  const failed = Boolean(error);

  return (
    <section className="recovery-form" aria-labelledby="verification-heading">
      <div className="recovery-form__top">
        <Brand />
      </div>
      <div
        className="recovery-form__success"
        role={failed ? "alert" : "status"}
      >
        <span
          className={`recovery-form__success-icon${failed ? " recovery-form__success-icon--error" : ""}`}
        >
          {failed ? (
            <WarningCircle weight="fill" aria-hidden="true" />
          ) : (
            <CheckCircle weight="fill" aria-hidden="true" />
          )}
        </span>
        <span className="recovery-form__eyebrow">
          {failed
            ? t("verificationLinkInvalidEyebrow")
            : t("successAllSetEyebrow")}
        </span>
        <h1 id="verification-heading">
          {failed ? t("emailVerificationFailedTitle") : t("emailVerifiedTitle")}
        </h1>
        <p>
          {failed ? t("emailVerificationFailedBody") : t("emailVerifiedBody")}
        </p>
        <Link
          href={
            failed
              ? `/login?next=${encodeURIComponent(safeNextPath)}`
              : safeNextPath
          }
          className="button recovery-form__success-action"
        >
          {failed ? t("continueToLogIn") : t("continueToDashboard")}{" "}
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
