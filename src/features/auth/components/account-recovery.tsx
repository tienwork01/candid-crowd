"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  MailCheck,
  RefreshCw,
} from "lucide-react";
import { Brand } from "@/components/shared/brand";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type RecoveryMode = "forgot-password" | "reset-password" | "verify-email";

const content = {
  "forgot-password": {
    eyebrow: "ACCOUNT RECOVERY",
    title: "Find your way back.",
    description:
      "Enter the email attached to your account and we’ll prepare a secure reset link.",
  },
  "reset-password": {
    eyebrow: "A FRESH START",
    title: "Choose a new password.",
    description:
      "Create a password you haven’t used before to keep your memories protected.",
  },
  "verify-email": {
    eyebrow: "ONE LAST STEP",
    title: "Check your inbox.",
    description:
      "We sent you a secure verification link. Open it to finish setting up your account.",
  },
} satisfies Record<
  RecoveryMode,
  { eyebrow: string; title: string; description: string }
>;

export function AccountRecovery({
  mode,
  email,
  token,
}: {
  mode: RecoveryMode;
  email?: string;
  token?: string;
}) {
  const [complete, setComplete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [notice, setNotice] = useState("");
  const [isPending, setIsPending] = useState(false);
  const page = content[mode];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setPasswordError("");
    setIsPending(true);

    const data = new FormData(event.currentTarget);

    if (mode === "forgot-password") {
      await authClient.requestPasswordReset({
        email: String(data.get("email")),
        redirectTo: "/reset-password",
      });
    }

    if (mode === "reset-password") {
      if (data.get("password") !== data.get("confirm-password")) {
        setPasswordError(
          "Passwords do not match. Check both fields and try again.",
        );
        document.querySelector<HTMLInputElement>("#confirm-password")?.focus();
        setIsPending(false);

        return;
      }

      if (!token) {
        setPasswordError("This reset link is invalid or expired.");
        setIsPending(false);

        return;
      }

      const result = await authClient.resetPassword({
        newPassword: String(data.get("password")),
        token,
      });

      if (result.error) {
        setPasswordError(
          result.error.message || "This reset link is invalid or expired.",
        );
        setIsPending(false);

        return;
      }
    }

    if (mode === "verify-email") {
      if (!email) {
        setNotice("Return to registration and enter your email again.");
        setIsPending(false);

        return;
      }

      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL: "/create",
      });

      if (result.error) {
        setNotice(
          result.error.message || "We couldn’t send the verification email.",
        );
        setIsPending(false);

        return;
      }

      setNotice("A fresh verification link is on its way.");
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
        <Link href="/login" className="recovery-form__back">
          <ArrowLeft size={15} aria-hidden="true" />
          Log in
        </Link>
      </div>

      {complete ? (
        <RecoverySuccess mode={mode} onReset={() => setComplete(false)} />
      ) : (
        <>
          <div className="recovery-form__heading">
            <span className="recovery-form__eyebrow">{page.eyebrow}</span>
            <h1 id="recovery-heading">{page.title}</h1>
            <p>{page.description}</p>
          </div>

          <form className="recovery-form__fields" onSubmit={submit}>
            {mode === "forgot-password" && (
              <div className="recovery-form__field">
                <label htmlFor="recovery-email">Email address</label>
                <input
                  id="recovery-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="you@example.com"
                  required
                />
              </div>
            )}

            {mode === "reset-password" && (
              <>
                <PasswordField
                  id="new-password"
                  label="New password"
                  name="password"
                  visible={showPassword}
                  onVisibilityChange={() => setShowPassword((value) => !value)}
                  describedBy="new-password-hint"
                />
                <p className="recovery-form__hint" id="new-password-hint">
                  Use at least 8 characters.
                </p>
                <PasswordField
                  id="confirm-password"
                  label="Confirm new password"
                  name="confirm-password"
                  visible={showConfirmation}
                  onVisibilityChange={() =>
                    setShowConfirmation((value) => !value)
                  }
                  describedBy={passwordError ? "password-error" : undefined}
                  invalid={Boolean(passwordError)}
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
                Verification links expire for your security. Check spam or
                request a fresh email below.
              </p>
            )}

            <Button
              className="recovery-form__submit"
              type="submit"
              disabled={isPending}
            >
              {isPending
                ? "Please wait…"
                : mode === "forgot-password"
                  ? "Send reset link"
                  : mode === "reset-password"
                    ? "Save new password"
                    : "Send another link"}
              <ArrowRight aria-hidden="true" />
            </Button>
          </form>

          {mode === "verify-email" && (
            <div className="recovery-form__resend">
              <span>Didn’t receive the email?</span>
              <span>
                <RefreshCw size={14} aria-hidden="true" /> Use the button above
                to resend securely.
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
}: {
  id: string;
  label: string;
  name: string;
  visible: boolean;
  onVisibilityChange: () => void;
  describedBy?: string;
  invalid?: boolean;
}) {
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
          required
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="recovery-form__visibility"
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          aria-pressed={visible}
          onClick={onVisibilityChange}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      </div>
    </div>
  );
}

function RecoverySuccess({
  mode,
  onReset,
}: {
  mode: RecoveryMode;
  onReset: () => void;
}) {
  const forgot = mode === "forgot-password";
  const Icon = forgot ? MailCheck : KeyRound;

  return (
    <div className="recovery-form__success" role="status">
      <span className="recovery-form__success-icon">
        <Icon aria-hidden="true" />
      </span>
      <span className="recovery-form__eyebrow">
        {forgot ? "CHECK YOUR INBOX" : "ALL SET"}
      </span>
      <h1 id="recovery-heading">
        {forgot ? "Your reset link is ready." : "Your password is renewed."}
      </h1>
      <p>
        {forgot
          ? "If an account exists for that email, a secure reset link will arrive shortly."
          : "Your password has been changed. You can now log in with your new password."}
      </p>
      {forgot ? (
        <button
          className="recovery-form__secondary"
          type="button"
          onClick={onReset}
        >
          Try another email
        </button>
      ) : (
        <Link href="/login" className="button recovery-form__success-action">
          Continue to log in <ArrowRight aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
