"use client";

import {
  DownloadSimple,
  ShareNetwork,
  PlusSquare,
  X,
  DeviceMobile,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useInstallPrompt } from "../hooks";
import "./pwa.css";

export type InstallPromptDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  customTitle?: string;
  customDescription?: string;
};

export function InstallPromptDialog({
  isOpen,
  onClose,
  customTitle,
  customDescription,
}: InstallPromptDialogProps) {
  const { isIOS, promptInstall, dismissPrompt } = useInstallPrompt();

  let title = "Install CandidCrowd";
  let description =
    "Add CandidCrowd to your home screen for instant access, offline photo queuing, and full-screen event viewing.";
  let buttonInstall = "Install App";
  let buttonLater = "Maybe Later";
  let iosStep1 = "Tap the Share button";
  let iosStep2 = "Select 'Add to Home Screen'";

  try {
    const t = useTranslations("pwa");

    title = t("install.title");
    description = t("install.description");
    buttonInstall = t("install.buttonInstall");
    buttonLater = t("install.buttonLater");
    iosStep1 = t("install.iosInstruction1");
    iosStep2 = t("install.iosInstruction2");
  } catch {
    // Graceful fallback when rendered outside NextIntlClientProvider
  }

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await promptInstall();

    if (success) {
      onClose();
    }
  };

  const handleClose = () => {
    dismissPrompt(14);
    onClose();
  };

  return (
    <div
      className="pwa-install-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
    >
      <div
        className="pwa-install-modal__backdrop"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="pwa-install-modal__card">
        <div className="pwa-install-modal__header">
          <div className="pwa-install-modal__icon" aria-hidden="true">
            <DeviceMobile size={24} weight="duotone" />
          </div>
          <button
            type="button"
            className="pwa-install-modal__close"
            onClick={handleClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <h2 id="pwa-install-title" className="pwa-install-modal__title">
          {customTitle || title}
        </h2>
        <p className="pwa-install-modal__desc">
          {customDescription || description}
        </p>

        {isIOS ? (
          <div className="pwa-ios-guide" aria-label="iOS installation guide">
            <div className="pwa-ios-guide__step">
              <span className="pwa-ios-guide__step-num" aria-hidden="true">
                1
              </span>
              <span className="pwa-ios-guide__step-text">
                {iosStep1}{" "}
                <span className="pwa-ios-guide__badge">
                  <ShareNetwork size={14} aria-hidden="true" />
                </span>
              </span>
            </div>
            <div className="pwa-ios-guide__step">
              <span className="pwa-ios-guide__step-num" aria-hidden="true">
                2
              </span>
              <span className="pwa-ios-guide__step-text">
                {iosStep2}{" "}
                <span className="pwa-ios-guide__badge">
                  <PlusSquare size={14} aria-hidden="true" />
                </span>
              </span>
            </div>
          </div>
        ) : null}

        <div className="pwa-install-modal__actions">
          <button
            type="button"
            className="pwa-install-modal__btn pwa-install-modal__btn--secondary"
            onClick={handleClose}
          >
            {buttonLater}
          </button>

          {!isIOS ? (
            <button
              type="button"
              className="pwa-install-modal__btn pwa-install-modal__btn--primary"
              onClick={handleInstallClick}
            >
              <DownloadSimple size={16} weight="bold" aria-hidden="true" />
              <span>{buttonInstall}</span>
            </button>
          ) : (
            <button
              type="button"
              className="pwa-install-modal__btn pwa-install-modal__btn--primary"
              onClick={handleClose}
            >
              <span>OK</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
