"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeSlash,
  Key,
  EnvelopeSimple,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Brand } from "@/components/shared";
import { Button } from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { getSafeAuthRedirect, withAuthRedirect } from "@/lib/auth-redirect";
import { getErrorMessage } from "@/lib/errors";

type RecoveryMode = "forgot-password" | "reset-password" | "verify-email";

export function AccountRecovery({
  mode,
  email,
  token,
  nextPath,
}: {
  mode: RecoveryMode;
  email?: string;
  token?: string;
  nextPath?: string;
}) {
  const t = useTranslations("auth");
  const tErrors = useTranslations("common.errors");
  const [complete, setComplete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [notice, setNotice] = useState("");
  const [isPending, setIsPending] = useState(false);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const safeNextPath = getSafeAuthRedirect(nextPath);

  const headingContent = {
    "forgot-password": {
      eyebrow: t("recovery.forgotPasswordEyebrow"),
      title: t("recovery.forgotPasswordTitle"),
      description: t("recovery.forgotPasswordDescription"),
    },
    "reset-password": {
      eyebrow: t("recovery.resetPasswordEyebrow"),
      title: t("recovery.resetPasswordTitle"),
      description: t("recovery.resetPasswordDescription"),
    },
    "verify-email": {
      eyebrow: t("recovery.verifyEmailEyebrow"),
      title: t("recovery.verifyEmailTitle"),
      description: t("recovery.verifyEmailDescription"),
    },
  }[mode];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setPasswordError("");
    setIsPending(true);

    const data = new FormData(event.currentTarget);

    if (mode === "forgot-password") {
      await authClient.requestPasswordReset({
        email: String(data.get("email")),
        redirectTo: withAuthRedirect("/reset-password", safeNextPath),
      });
    }

    if (mode === "reset-password") {
      if (data.get("password") !== data.get("confirm-password")) {
        setPasswordError(t("recovery.passwordsDoNotMatch"));
        confirmPasswordRef.current?.focus();
        setIsPending(false);

        return;
      }

      if (!token) {
        setPasswordError(t("recovery.invalidOrExpiredResetLink"));
        setIsPending(false);

        return;
      }

      const result = await authClient.resetPassword({
        newPassword: String(data.get("password")),
        token,
      });

      if (result.error) {
        setPasswordError(
          getErrorMessage(result.error.code, undefined, tErrors),
        );
        setIsPending(false);

        return;
      }
    }

    if (mode === "verify-email") {
      if (!email) {
        setNotice(t("recovery.returnToRegistration"));
        setIsPending(false);

        return;
      }

      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL: safeNextPath,
      });

      if (result.error) {
        setNotice(getErrorMessage(result.error.code, undefined, tErrors));
        setIsPending(false);

        return;
      }

      setNotice(t("recovery.verificationLinkOnWay"));
      setIsPending(false);

      return;
    }

    setIsPending(false);
    setComplete(true);
  }

  return (
    <section className="recovery-form" aria-labelledby="recovery-heading">
      <div className="recovery-form__top">
        <Brand />
        <Link
          href={withAuthRedirect("/login", safeNextPath)}
          className="recovery-form__back"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          {t("ui.submitLogIn")}
        </Link>
      </div>

      {complete ? (
        <RecoverySuccess
          mode={mode}
          nextPath={safeNextPath}
          onReset={() => setComplete(false)}
        />
      ) : (
        <>
          <div className="recovery-form__heading">
            <span className="recovery-form__eyebrow">
              {headingContent.eyebrow}
            </span>
            <h1 id="recovery-heading">{headingContent.title}</h1>
            <p>{headingContent.description}</p>
          </div>

          <form className="recovery-form__fields" onSubmit={submit}>
            {mode === "forgot-password" && (
              <div className="recovery-form__field">
                <label htmlFor="recovery-email">
                  {t("recovery.emailAddress")}
                </label>
                <input
                  id="recovery-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder={t("ui.emailPlaceholder")}
                  required
                />
              </div>
            )}

            {mode === "reset-password" && (
              <>
                <PasswordField
                  id="new-password"
                  label={t("recovery.newPassword")}
                  name="password"
                  visible={showPassword}
                  onVisibilityChange={() => setShowPassword((value) => !value)}
                  describedBy="new-password-hint"
                />
                <p className="recovery-form__hint" id="new-password-hint">
                  {t("ui.passwordMinHint")}
                </p>
                <PasswordField
                  id="confirm-password"
                  label={t("recovery.confirmNewPassword")}
                  name="confirm-password"
                  visible={showConfirmation}
                  onVisibilityChange={() =>
                    setShowConfirmation((value) => !value)
                  }
                  describedBy={passwordError ? "password-error" : undefined}
                  invalid={Boolean(passwordError)}
                  inputRef={confirmPasswordRef}
                />
                {passwordError && (
                  <p
                    className="recovery-form__error"
                    id="password-error"
                    role="alert"
                  >
                    {passwordError}
                  </p>
                )}
              </>
            )}

            {mode === "verify-email" && (
              <p className="recovery-form__hint">
                {t("recovery.verifyEmailExpiryNotice")}
              </p>
            )}

            <Button
              className="recovery-form__submit"
              type="submit"
              disabled={isPending}
            >
              {isPending
                ? t("ui.wait")
                : mode === "forgot-password"
                  ? t("recovery.sendResetLink")
                  : mode === "reset-password"
                    ? t("recovery.saveNewPassword")
                    : t("recovery.sendAnotherLink")}
              <ArrowRight aria-hidden="true" />
            </Button>
          </form>

          {mode === "verify-email" && (
            <div className="recovery-form__resend">
              <span>{t("recovery.didntReceiveEmail")}</span>
              <span>
                <ArrowsClockwise size={14} aria-hidden="true" />{" "}
                {t("recovery.resendGuidance")}
              </span>
            </div>
          )}

          <p className="recovery-form__notice" role="status" aria-live="polite">
            {notice}
          </p>
        </>
      )}
    </section>
  );
}

function PasswordField({
  id,
  label,
  name,
  visible,
  onVisibilityChange,
  describedBy,
  invalid = false,
  inputRef,
}: {
  id: string;
  label: string;
  name: string;
  visible: boolean;
  onVisibilityChange: () => void;
  describedBy?: string;
  invalid?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const t = useTranslations("auth.ui");

  return (
    <div className="recovery-form__field">
      <label htmlFor={id}>{label}</label>
      <div className="recovery-form__password">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          placeholder={label}
          minLength={8}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          ref={inputRef}
          required
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="recovery-form__visibility"
          aria-label={visible ? t("hidePassword") : t("showPassword")}
          aria-pressed={visible}
          onClick={onVisibilityChange}
        >
          {visible ? (
            <EyeSlash aria-hidden="true" />
          ) : (
            <Eye aria-hidden="true" />
          )}
        </Button>
      </div>
    </div>
  );
}

function RecoverySuccess({
  mode,
  nextPath,
  onReset,
}: {
  mode: RecoveryMode;
  nextPath: string;
  onReset: () => void;
}) {
  const t = useTranslations("auth.recovery");
  const forgot = mode === "forgot-password";
  const Icon = forgot ? EnvelopeSimple : Key;

  return (
    <div className="recovery-form__success" role="status">
      <span className="recovery-form__success-icon">
        <Icon aria-hidden="true" />
      </span>
      <span className="recovery-form__eyebrow">
        {forgot ? t("successCheckInboxEyebrow") : t("successAllSetEyebrow")}
      </span>
      <h1 id="recovery-heading">
        {forgot ? t("successResetLinkReady") : t("successPasswordRenewed")}
      </h1>
      <p>
        {forgot ? t("successResetLinkBody") : t("successPasswordRenewedBody")}
      </p>
      {forgot ? (
        <button
          className="recovery-form__secondary"
          type="button"
          onClick={onReset}
        >
          {t("tryAnotherEmail")}
        </button>
      ) : (
        <Link
          href={withAuthRedirect("/login", nextPath)}
          className="button recovery-form__success-action"
        >
          {t("continueToLogIn")} <ArrowRight aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
