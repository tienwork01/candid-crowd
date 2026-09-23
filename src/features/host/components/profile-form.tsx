"use client";

import { FormEvent, useRef, useState } from "react";
import {
  CheckCircle,
  Lock,
  PencilSimple,
  User,
  WarningCircle,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button, Input, Label, Spinner } from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { useHostProfile, useUserAccounts } from "../hooks";
import { ChangePasswordDialog } from "./change-password-dialog";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { HostUserCard } from "./host-user-card";

export function ProfileForm() {
  const t = useTranslations("host.pages");
  const tErrors = useTranslations("common.errors");
  const { user, isPending: sessionLoading, invalidate } = useHostProfile();
  const { hasPassword, invalidate: invalidateAccounts } = useUserAccounts();

  const [name, setName] = useState("");
  const [nameInitialized, setNameInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Initialize name from session once loaded
  if (user?.name && !nameInitialized) {
    setName(user.name);
    setNameInitialized(true);
  }

  const hasChanges = user ? name.trim() !== user.name : false;

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = name.trim();

    if (!trimmed) {
      setNameError(t("nameRequired"));

      return;
    }

    setNameError("");
    setIsSaving(true);

    const result = await authClient.updateUser({ name: trimmed });

    setIsSaving(false);

    if (result.error) {
      toast.error(
        getErrorMessage(result.error, t("profileUpdateFailed"), tErrors),
      );

      return;
    }

    invalidate();
    toast.success(t("profileUpdated"));
  }

  function handleNameBlur() {
    if (!name.trim()) {
      setNameError(t("nameRequired"));
    } else {
      setNameError("");
    }
  }

  if (sessionLoading) {
    return (
      <div className="profile-page__grid" aria-busy="true">
        <div className="profile-page__main space-y-6">
          <div className="profile-page__card animate-pulse">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-9 rounded-lg bg-muted/20" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-muted/25 rounded" />
                <div className="h-3 w-48 bg-muted/15 rounded" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-10 w-full bg-muted/15 rounded-md" />
              <div className="h-10 w-full bg-muted/15 rounded-md" />
            </div>
          </div>
          <div className="profile-page__card animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-9 rounded-lg bg-muted/20" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 bg-muted/25 rounded" />
                <div className="h-3 w-40 bg-muted/15 rounded" />
              </div>
            </div>
          </div>
        </div>
        <div className="profile-page__sidebar">
          <HostUserCard />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page__grid">
      {/* ─── Main content: settings cards ─── */}
      <div className="profile-page__main">
        {/* Personal Information Card */}
        <div className="profile-page__card">
          <div className="profile-page__card-header">
            <div className="profile-page__card-icon">
              <User size={18} weight="bold" aria-hidden="true" />
            </div>
            <div>
              <h3>{t("personalInfoTitle")}</h3>
              <p>{t("personalInfoDescription")}</p>
            </div>
          </div>

          <form
            ref={formRef}
            className="profile-page__fields"
            onSubmit={handleSave}
            noValidate
          >
            <div className="profile-page__field">
              <Label htmlFor="profile-name">{t("nameLabel")}</Label>
              <Input
                id="profile-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder={t("namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameBlur}
                aria-invalid={!!nameError}
                aria-describedby={nameError ? "name-error" : undefined}
                required
              />
              {nameError && (
                <p id="name-error" className="profile-page__error" role="alert">
                  <WarningCircle size={14} aria-hidden="true" />
                  {nameError}
                </p>
              )}
            </div>

            <div className="profile-page__field">
              <Label htmlFor="profile-email">{t("emailLabel")}</Label>
              <div className="profile-page__email-row">
                <Input
                  id="profile-email"
                  type="email"
                  value={user.email}
                  disabled
                  readOnly
                />
                <span
                  className={cn(
                    "profile-page__email-icon",
                    user.emailVerified
                      ? "profile-page__email-icon--verified"
                      : "profile-page__email-icon--unverified",
                  )}
                  aria-label={
                    user.emailVerified
                      ? t("emailVerified")
                      : t("emailUnverified")
                  }
                  role="img"
                >
                  {user.emailVerified ? (
                    <CheckCircle size={18} weight="fill" />
                  ) : (
                    <WarningCircle size={18} weight="fill" />
                  )}
                </span>
              </div>
            </div>

            <div className="profile-page__actions">
              <Button type="submit" disabled={isSaving || !hasChanges}>
                {isSaving ? (
                  <>
                    <Spinner size="sm" aria-hidden="true" />
                    {t("saving")}
                  </>
                ) : (
                  <>
                    <PencilSimple size={16} aria-hidden="true" />
                    {t("saveChanges")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Password Card */}
        <div className="profile-page__card">
          <div className="profile-page__card-header">
            <div className="profile-page__card-icon">
              <Lock size={18} weight="bold" aria-hidden="true" />
            </div>
            <div>
              <h3>{t("passwordTitle")}</h3>
              <p>
                {hasPassword
                  ? t("passwordDescription")
                  : t("setPasswordDescription")}
              </p>
            </div>
          </div>
          <div className="profile-page__card-actions">
            <ChangePasswordDialog
              hasPassword={hasPassword}
              onSuccess={invalidateAccounts}
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="profile-page__card profile-page__card--danger">
          <div className="profile-page__card-header">
            <div className="profile-page__card-icon profile-page__card-icon--danger">
              <WarningCircle size={18} weight="bold" aria-hidden="true" />
            </div>
            <div>
              <h3>{t("dangerZoneTitle")}</h3>
              <p>{t("dangerZoneDescription")}</p>
            </div>
          </div>
          <div className="profile-page__card-actions">
            <DeleteAccountDialog />
          </div>
        </div>
      </div>

      {/* ─── Sidebar: account summary ─── */}
      <HostUserCard showChangeAvatar />
    </div>
  );
}
