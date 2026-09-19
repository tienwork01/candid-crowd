"use client";

import { FormEvent, useState } from "react";
import { Trash, WarningCircle } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
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
import { useDeleteAccount } from "../hooks";

export function DeleteAccountDialog() {
  const t = useTranslations("host.pages");
  const tActions = useTranslations("common.actions");
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const { mutate: deleteAccount, isPending, error } = useDeleteAccount();

  const val = confirmation.trim().toUpperCase();
  const isConfirmed = val === "DELETE" || val === "XÓA" || val === "XOA";

  function handleDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isConfirmed) return;

    deleteAccount(undefined, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  }

  function resetForm() {
    setConfirmation("");
  }

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
          <Button
            variant="outline"
            size="sm"
            className="border-destructive/30 text-destructive hover:bg-destructive/5"
          >
            <Trash size={14} aria-hidden="true" />
            {t("deleteAccount")}
          </Button>
        }
      />
      <DialogContent className="max-w-md">
        <DialogTitle className="text-lg font-semibold text-destructive mb-1">
          {t("deleteConfirmTitle")}
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground mb-6">
          {t("deleteConfirmDescription")}
        </DialogDescription>

        <form onSubmit={handleDelete} noValidate>
          <div className="profile-page__field">
            <Label htmlFor="delete-confirm">
              {t("deleteConfirmInstruction")}
            </Label>
            <Input
              id="delete-confirm"
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder={t("deleteConfirmPlaceholder")}
              autoComplete="off"
              spellCheck={false}
              aria-describedby={error ? "delete-error" : undefined}
            />
          </div>

          {error && (
            <p
              id="delete-error"
              className="profile-page__error mt-3"
              role="alert"
            >
              <WarningCircle size={14} aria-hidden="true" />
              {error.message}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              {tActions("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={!isConfirmed || isPending}
              className="border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (
                <>
                  <Spinner size="sm" aria-hidden="true" />
                  {t("deleting")}
                </>
              ) : (
                <>
                  <Trash size={16} aria-hidden="true" />
                  {t("deleteAccount")}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
