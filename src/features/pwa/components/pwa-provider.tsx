"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useServiceWorker, useInstallPrompt } from "../hooks";
import { OfflineIndicator } from "./offline-indicator";
import { InstallPromptDialog } from "./install-prompt-dialog";

type PWAContextValue = {
  canInstall: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  openInstallPrompt: () => void;
  updateAvailable: boolean;
  updateServiceWorker: () => void;
};

const PWAContext = createContext<PWAContextValue | null>(null);

export function PWAProvider({ children }: { children: ReactNode }) {
  const { updateAvailable, updateServiceWorker } = useServiceWorker();
  const { canInstall, isStandalone, isIOS } = useInstallPrompt();
  const [isInstallOpen, setIsInstallOpen] = useState(false);

  const openInstallPrompt = useCallback(() => {
    setIsInstallOpen(true);
  }, []);

  const closeInstallPrompt = useCallback(() => {
    setIsInstallOpen(false);
  }, []);

  return (
    <PWAContext.Provider
      value={{
        canInstall,
        isStandalone,
        isIOS,
        openInstallPrompt,
        updateAvailable,
        updateServiceWorker,
      }}
    >
      <OfflineIndicator />
      {children}
      <InstallPromptDialog
        isOpen={isInstallOpen}
        onClose={closeInstallPrompt}
      />
    </PWAContext.Provider>
  );
}

export function usePWA(): PWAContextValue {
  const context = useContext(PWAContext);

  if (!context) {
    // Return safe fallback if rendered outside provider
    return {
      canInstall: false,
      isStandalone: false,
      isIOS: false,
      openInstallPrompt: () => {},
      updateAvailable: false,
      updateServiceWorker: () => {},
    };
  }

  return context;
}
