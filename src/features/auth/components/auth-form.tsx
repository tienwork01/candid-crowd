"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Brand } from "@/components/shared/brand";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function AuthForm({
  mode,
  nextPath,
}: {
  mode: "login" | "register";
  nextPath?: string;
}) {
  const register = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";
  const appleEnabled = process.env.NEXT_PUBLIC_APPLE_AUTH_ENABLED === "true";
  const socialEnabled = googleEnabled || appleEnabled;

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
        callbackURL: "/create",
      });

      setIsPending(false);

      if (result.error) {
        setFeedback(result.error.message || "We couldn’t create your account.");

        return;
      }

      router.push(`/verify-email?email=${encodeURIComponent(email)}`);

      return;
    }

    const result = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/create",
    });

    setIsPending(false);

    if (result.error) {
      setFeedback(result.error.message || "Email or password is incorrect.");

      return;
    }

    router.push(
      nextPath?.startsWith("/") && !nextPath.startsWith("//")
        ? nextPath
        : "/create",
    );
  }

  async function social(provider: "google" | "apple") {
    setFeedback("");

    const result = await authClient.signIn.social({
      provider,
      callbackURL: "/create",
      additionalData: {
        termsVersion: process.env.NEXT_PUBLIC_TERMS_VERSION || "2026-01",
        privacyVersion: process.env.NEXT_PUBLIC_PRIVACY_VERSION || "2026-01",
      },
    });

    if (result.error)
      setFeedback(
        result.error.message || `Couldn’t continue with ${provider}.`,
      );
  }

  return (
    <section className="auth-form" aria-labelledby="auth-heading">
      {/* Inline brand + back link (replaces removed header) */}
      <div className="auth-form__top">
        <Brand />
        <Link href="/" className="auth-form__back">
          <ArrowLeft size={15} aria-hidden="true" />
          Home
        </Link>
      </div>

      <div className="auth-form__heading">
        <span className="auth-form__eyebrow">
          {register ? "GET STARTED" : "YOUR MEMORIES, TOGETHER"}
        </span>
        <h1 id="auth-heading">
          {register ? "Create your account." : "Welcome back."}
        </h1>
        <p>
          {register
            ? "Collect every photo from your event in original quality."
            : "A little closer to all your favorite moments."}
        </p>
      </div>

      {socialEnabled && (
        <>
          <div
            className="auth-form__social"
            role="group"
            aria-label={
              register ? "Sign up with a provider" : "Log in with a provider"
            }
          >
            {googleEnabled && (
              <button
                type="button"
                className="auth-form__social-btn auth-form__social-btn--google"
                aria-label="Continue with Google"
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
                aria-label="Continue with Apple"
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
            By continuing, you agree to our <Link href="/terms">Terms</Link> and{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>
          <div className="auth-form__divider">
            <span>or with email</span>
          </div>
        </>
      )}

      <form className="auth-form__fields" onSubmit={submit}>
        {register && (
          <div className="auth-form__field">
            <label htmlFor="full-name">Full name</label>
            <input
              id="full-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              required
              maxLength={100}
            />
          </div>
        )}
        <div className="auth-form__field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="auth-form__field">
          <div className="auth-form__label-row">
            <label htmlFor="password">Password</label>
            {!register && (
              <Link className="auth-form__text-button" href="/forgot-password">
                Forgot password?
              </Link>
            )}
          </div>
          <div className="auth-form__password">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={register ? "new-password" : "current-password"}
              placeholder={
                register ? "Create a password" : "Enter your password"
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
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              title={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" />
              ) : (
                <Eye aria-hidden="true" />
              )}
            </Button>
          </div>
          {register && (
            <p className="auth-form__hint" id="password-hint">
              At least 8 characters.
            </p>
          )}
        </div>
        {register && (
          <div className="auth-form__consent">
            <input id="terms" name="terms" type="checkbox" required />
            <label htmlFor="terms">
              I agree to the{" "}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="auth-form__text-button"
              >
                Terms of service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="auth-form__text-button"
              >
                Privacy policy
              </Link>
              .
            </label>
          </div>
        )}
        <p className="auth-form__feedback" role="status" aria-live="polite">
          {feedback}
        </p>
        <Button
          className="auth-form__submit"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Please wait…" : register ? "Create account" : "Log in"}
          <ArrowRight aria-hidden="true" className="auth-form__submit-arrow" />
        </Button>
      </form>

      <p className="auth-form__switch">
        {register ? "Already have an account?" : "New to CandidCrowd?"}{" "}
        <Link href={register ? "/login" : "/register"}>
          {register ? "Log in" : "Create an account"}
        </Link>
      </p>
    </section>
  );
}
