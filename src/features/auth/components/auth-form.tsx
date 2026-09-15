"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Brand } from "@/components/shared/brand";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const notices = {
  terms: {
    title: "Terms of service",
    body: "Our terms of service are being finalized. Account creation is not available yet.",
  },
  privacy: {
    title: "Privacy policy",
    body: "Our privacy policy is being finalized. Information entered on this page is not sent or saved.",
  },
  reset: {
    title: "Reset your password",
    body: "Password reset is not available yet. No email has been sent.",
  },
};

const subscribe = () => () => undefined;

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  // Keep the UI-only form from submitting credentials before hydration.
  const interactive = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const register = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<keyof typeof notices | null>(null);

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

      {/* ── Social login — prominent full-width buttons ── */}
      <div
        className="auth-form__social"
        role="group"
        aria-label={
          register ? "Sign up with a provider" : "Log in with a provider"
        }
      >
        <button
          type="button"
          className="auth-form__social-btn auth-form__social-btn--google"
          aria-label="Continue with Google"
        >
          <Image src="/icons/google.svg" alt="" width={20} height={20} />
          Google
        </button>
        <button
          type="button"
          className="auth-form__social-btn auth-form__social-btn--apple"
          aria-label="Continue with Apple"
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
      </div>

      <div className="auth-form__divider">
        <span>or with email</span>
      </div>

      <form
        className="auth-form__fields"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
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
              <button
                className="auth-form__text-button"
                type="button"
                onClick={() => setNotice("reset")}
              >
                Forgot password?
              </button>
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
        <Button
          className="auth-form__submit"
          type="submit"
          disabled={!interactive}
        >
          {register ? "Create account" : "Log in"}
          <ArrowRight aria-hidden="true" className="auth-form__submit-arrow" />
        </Button>
      </form>

      <p className="auth-form__switch">
        {register ? "Already have an account?" : "New to CandidCrowd?"}{" "}
        <Link href={register ? "/login" : "/register"}>
          {register ? "Log in" : "Create an account"}
        </Link>
      </p>
      <Dialog
        open={notice !== null}
        onOpenChange={(open) => {
          if (!open) setNotice(null);
        }}
      >
        <DialogContent>
          <DialogTitle className="auth-form__notice-title">
            {notice ? notices[notice].title : ""}
          </DialogTitle>
          <DialogDescription className="auth-form__notice-body">
            {notice ? notices[notice].body : ""}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </section>
  );
}
