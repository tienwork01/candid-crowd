"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeSlash, Lock, WarningCircle } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Spinner,
} from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/errors";

export interface ChangePasswordDialogProps {
  hasPassword?: boolean;
  onSuccess?: () => void;
}

export function ChangePasswordDialog({
  hasPassword = true,
  onSuccess,
}: ChangePasswordDialogProps) {
  const t = useTranslations("host.pages");
  const tErrors = useTranslations("common.errors");
  const [open, setOpen] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const data = new FormData(event.currentTarget);
    const currentPassword = String(data.get("currentPassword") ?? "");
    const newPassword = String(data.get("newPassword") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");

    if (newPassword.length < 8) {
      setError(t("passwordMinLength"));

      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("passwordMismatch"));

      return;
    }

    setIsPending(true);

    if (!hasPassword) {
      try {
        const response = await fetch("/api/account/set-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword }),
        });

        const result = await response.json().catch(() => ({}));

        setIsPending(false);

        if (!response.ok || !result.success) {
          setError(result.message || t("passwordSetFailed"));

          return;
        }

        toast.success(t("passwordSetSuccess"));
        setOpen(false);
        resetForm();
        onSuccess?.();
      } catch {
        setIsPending(false);
        setError(t("passwordSetFailed"));
      }

      return;
    }

    const result = await authClient.changePassword({
      currentPassword,
      newPassword,
    });

    setIsPending(false);

    if (result.error) {
      setError(
        getErrorMessage(result.error, t("passwordChangeFailed"), tErrors),
      );

      return;
    }

    toast.success(t("passwordChanged"));
    setOpen(false);
    resetForm();
    onSuccess?.();
  }

  function resetForm() {
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setError("");
  }

  const actionLabel = hasPassword ? t("changePassword") : t("setPassword");
  const dialogDescription = hasPassword
    ? t("passwordDescription")
    : t("setPasswordDescription");

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);

        if (!isOpen) resetForm();
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Lock size={14} aria-hidden="true" />
            {actionLabel}
          </Button>
        }
      />
      <DialogContent className="max-w-md">
        <DialogTitle className="text-lg font-semibold mb-1">
          {actionLabel}
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground mb-6">
          {dialogDescription}
        </DialogDescription>

        <form
          className="profile-page__fields"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Current password */}
          {hasPassword && (
            <div className="profile-page__field">
              <Label htmlFor="cp-current">{t("currentPassword")}</Label>
              <div className="profile-page__password-row">
                <Input
                  id="cp-current"
                  name="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="profile-page__password-toggle"
                  onClick={() => setShowCurrent((v) => !v)}
                  aria-label={showCurrent ? "Hide password" : "Show password"}
                >
                  {showCurrent ? (
                    <EyeSlash size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* New password */}
          <div className="profile-page__field">
            <Label htmlFor="cp-new">{t("newPassword")}</Label>
            <div className="profile-page__password-row">
              <Input
                id="cp-new"
                name="newPassword"
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="profile-page__password-toggle"
                onClick={() => setShowNew((v) => !v)}
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? (
                  <EyeSlash size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
                )}
              </button>
            </div>
            <p className="profile-page__hint">{t("passwordMinLength")}</p>
          </div>

          {/* Confirm password */}
          <div className="profile-page__field">
            <Label htmlFor="cp-confirm">{t("confirmPassword")}</Label>
            <div className="profile-page__password-row">
              <Input
                id="cp-confirm"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="profile-page__password-toggle"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <EyeSlash size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="profile-page__error" role="alert">
              <WarningCircle size={14} aria-hidden="true" />
              {error}
            </p>
          )}

          <Button type="submit" disabled={isPending} className="w-full mt-2">
            {isPending ? (
              <>
                <Spinner size="sm" aria-hidden="true" />
                {t("saving")}
              </>
            ) : (
              actionLabel
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
