"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeSlash } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Brand } from "@/components/shared";
import {
  Alert,
  AlertDescription,
  Button,
  Input,
  Label,
  Separator,
} from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { getSafeAuthRedirect, withAuthRedirect } from "@/lib/auth-redirect";
import { getErrorMessage } from "@/lib/errors";

export function AuthForm({
  mode,
  nextPath,
}: {
  mode: "login" | "register";
  nextPath?: string;
}) {
  const t = useTranslations("auth");
  const tErrors = useTranslations("common.errors");
  const register = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";
  const appleEnabled = process.env.NEXT_PUBLIC_APPLE_AUTH_ENABLED === "true";
  const socialEnabled = googleEnabled || appleEnabled;
  const safeNextPath = getSafeAuthRedirect(nextPath);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setIsPending(true);

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    if (register) {
      const result = await authClient.signUp.email({
        name: String(data.get("name") ?? "").trim(),
        email,
        password,
        termsVersion: process.env.NEXT_PUBLIC_TERMS_VERSION || "2026-01",
        privacyVersion: process.env.NEXT_PUBLIC_PRIVACY_VERSION || "2026-01",
        callbackURL: safeNextPath,
      });

      setIsPending(false);

      if (result.error) {
        setFeedback(getErrorMessage(result.error.code, undefined, tErrors));

        return;
      }

      const verifyUrl = new URLSearchParams({ email });

      if (safeNextPath !== "/events/new") {
        verifyUrl.set("next", safeNextPath);
      }

      router.replace(`/verify-email?${verifyUrl.toString()}`);

      return;
    }

    const result = await authClient.signIn.email({
      email,
      password,
      callbackURL: safeNextPath,
    });

    setIsPending(false);

    if (result.error) {
      setFeedback(getErrorMessage(result.error.code, undefined, tErrors));

      return;
    }

    router.replace(safeNextPath);
  }

  async function social(provider: "google" | "apple") {
    setFeedback("");
    setIsPending(true);

    const result = await authClient.signIn.social({
      provider,
      callbackURL: safeNextPath,
      additionalData: {
        termsVersion: process.env.NEXT_PUBLIC_TERMS_VERSION || "2026-01",
        privacyVersion: process.env.NEXT_PUBLIC_PRIVACY_VERSION || "2026-01",
      },
    });

    if (result.error) {
      setFeedback(getErrorMessage(result.error.code, undefined, tErrors));
      setIsPending(false);
    }
  }

  return (
    <section className="auth-form" aria-labelledby="auth-heading">
      {/* Inline brand + back link (replaces removed header) */}
      <div className="auth-form__top">
        <Brand />
        <Link href="/" className="auth-form__back">
          <ArrowLeft size={15} aria-hidden="true" />
          {t("ui.home")}
        </Link>
      </div>

      <div className="auth-form__heading">
        <span className="auth-form__eyebrow">
          {register ? t("ui.getStarted") : t("ui.memoriesTogether")}
        </span>
        <h1 id="auth-heading">
          {register ? t("register.title") : t("signIn.title")}
        </h1>
        <p>
          {register ? t("ui.registerDescription") : t("ui.loginDescription")}
        </p>
      </div>

      {socialEnabled && (
        <>
          <div
            className="auth-form__social"
            role="group"
            aria-label={
              register ? t("ui.signUpWithProvider") : t("ui.logInWithProvider")
            }
          >
            {googleEnabled && (
              <button
                type="button"
                className="auth-form__social-btn auth-form__social-btn--google"
                aria-label={t("ui.continueWithGoogle")}
                disabled={isPending}
                onClick={() => void social("google")}
              >
                <Image src="/icons/google.svg" alt="" width={20} height={20} />
                Google
              </button>
            )}
            {appleEnabled && (
              <button
                type="button"
                className="auth-form__social-btn auth-form__social-btn--apple"
                aria-label={t("ui.continueWithApple")}
                disabled={isPending}
                onClick={() => void social("apple")}
              >
                <Image
                  src="/icons/apple.svg"
                  alt=""
                  width={20}
                  height={20}
                  style={{ filter: "invert(1)" }}
                />
                Apple
              </button>
            )}
          </div>
          <p className="auth-form__social-consent">
            {t("ui.socialConsentPrefix")}{" "}
            <Link href="/terms">{t("ui.terms")}</Link> {t("ui.and")}{" "}
            <Link href="/privacy">{t("ui.privacyPolicy")}</Link>.
          </p>
          <div className="relative my-6 flex items-center justify-center">
            <Separator className="absolute inset-0 m-auto" />
            <span className="relative bg-card px-3 text-xs uppercase tracking-wider text-muted-foreground">
              {t("ui.orWithEmail")}
            </span>
          </div>
        </>
      )}

      <form className="auth-form__fields" onSubmit={submit}>
        {register && (
          <div className="auth-form__field">
            <Label htmlFor="full-name">{t("register.name")}</Label>
            <Input
              id="full-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder={t("ui.fullNamePlaceholder")}
              required
              maxLength={100}
            />
          </div>
        )}
        <div className="auth-form__field">
          <Label htmlFor="email">{t("signIn.email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={t("ui.emailPlaceholder")}
            required
          />
        </div>
        <div className="auth-form__field">
          <div className="auth-form__label-row">
            <Label htmlFor="password">{t("signIn.password")}</Label>
            {!register && (
              <Link
                className="auth-form__text-button"
                href={withAuthRedirect("/forgot-password", safeNextPath)}
              >
                {t("ui.forgotPassword")}
              </Link>
            )}
          </div>
          <div className="auth-form__password relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={register ? "new-password" : "current-password"}
              placeholder={
                register
                  ? t("ui.createPasswordPlaceholder")
                  : t("ui.enterPasswordPlaceholder")
              }
              required
              minLength={register ? 8 : undefined}
              aria-describedby={register ? "password-hint" : undefined}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="auth-form__visibility"
              aria-label={
                showPassword ? t("ui.hidePassword") : t("ui.showPassword")
              }
              aria-pressed={showPassword}
              title={showPassword ? t("ui.hidePassword") : t("ui.showPassword")}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? (
                <EyeSlash aria-hidden="true" />
              ) : (
                <Eye aria-hidden="true" />
              )}
            </Button>
          </div>
          {register && (
            <p className="auth-form__hint" id="password-hint">
              {t("ui.passwordMinHint")}
            </p>
          )}
        </div>
        {register && (
          <div className="auth-form__consent">
            <input id="terms" name="terms" type="checkbox" required />
            <label htmlFor="terms">
              {t("ui.agreeToTermsPrefix")}{" "}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="auth-form__text-button"
              >
                {t("ui.termsOfService")}
              </Link>{" "}
              {t("ui.and")}{" "}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="auth-form__text-button"
              >
                {t("ui.privacyPolicy")}
              </Link>
              .
            </label>
          </div>
        )}
        {feedback && (
          <Alert variant="destructive" className="mb-2">
            <AlertDescription>{feedback}</AlertDescription>
          </Alert>
        )}
        <Button
          className="auth-form__submit"
          type="submit"
          disabled={isPending}
        >
          {isPending
            ? t("ui.wait")
            : register
              ? t("ui.submitCreateAccount")
              : t("ui.submitLogIn")}
          <ArrowRight aria-hidden="true" className="auth-form__submit-arrow" />
        </Button>
      </form>

      <p className="auth-form__switch">
        {register ? t("ui.alreadyHaveAccount") : t("ui.newToCandidCrowd")}{" "}
        <Link
          href={withAuthRedirect(
            register ? "/login" : "/register",
            safeNextPath,
          )}
        >
          {register ? t("ui.actionLogIn") : t("ui.actionCreateAccount")}
        </Link>
      </p>
    </section>
  );
}
