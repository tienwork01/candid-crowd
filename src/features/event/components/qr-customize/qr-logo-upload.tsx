"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  CheckCircle,
  Trash,
  UploadSimple,
  WarningCircle,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

interface QRLogoUploadProps {
  logoDataUrl: string | null;
  logoSize: number;
  onChange: (updates: {
    logoDataUrl: string | null;
    logoSize?: number;
  }) => void;
}

export function QRLogoUpload({
  logoDataUrl,
  logoSize,
  onChange,
}: QRLogoUploadProps) {
  const t = useTranslations("event.qrCustomize");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = async (file: File) => {
    // Validate format
    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/svg+xml",
      "image/webp",
    ];

    if (!validTypes.includes(file.type)) {
      toast.error(t("uploadLogoFormats"));

      return;
    }

    // Size limit: 5MB input
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("uploadLogoFormats"));

      return;
    }

    setIsProcessing(true);

    try {
      let targetFile = file;

      // Compress bitmap images to keep base64 fast and lightweight (under 250px)
      if (file.type !== "image/svg+xml") {
        try {
          targetFile = await imageCompression(file, {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 300,
            useWebWorker: true,
          });
        } catch {
          targetFile = file;
        }
      }

      // Convert to Base64
      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result as string;

        onChange({ logoDataUrl: result });
        setIsProcessing(false);
        toast.success(t("logoUploaded"));
      };

      reader.onerror = () => {
        setIsProcessing(false);
        toast.error(t("uploadLogo"));
      };

      reader.readAsDataURL(targetFile);
    } catch {
      setIsProcessing(false);
      toast.error(t("uploadLogo"));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];

    if (file) void processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) void processFile(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ logoDataUrl: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="qr-logo-upload space-y-3">
      {/* Section Header with Required Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
            {t("logo")}
          </label>
          <span className="text-[10px] font-semibold text-amber-700 bg-amber-500/10 px-1.5 py-0.2 rounded">
            {t("requiredBadge")}
          </span>
        </div>
        {logoDataUrl ? (
          <span className="text-xs text-primary font-medium flex items-center gap-1">
            <CheckCircle size={14} weight="fill" />
            <span>{t("logoAdded")}</span>
          </span>
        ) : (
          <span className="text-xs text-amber-700 flex items-center gap-1">
            <WarningCircle size={13} />
            <span>{t("logoRequiredPrompt")}</span>
          </span>
        )}
      </div>

      {/* Upload Zone / Active Preview */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative rounded-xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragging
            ? "border-primary bg-primary/10"
            : logoDataUrl
              ? "border-primary/40 bg-surface hover:border-primary"
              : "border-line hover:border-line-hover bg-surface hover:bg-surface-raised"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {logoDataUrl ? (
          <div className="flex items-center justify-between w-full px-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg border border-line bg-white p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                <Image
                  src={logoDataUrl}
                  alt={t("logoAlt")}
                  width={44}
                  height={44}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
              <div className="text-left">
                <span className="text-xs font-medium text-ink block">
                  {t("logoCustom")}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {t("clickToReplace")}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="p-2 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title={t("removeLogo")}
              aria-label={t("removeLogo")}
            >
              <Trash size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <UploadSimple size={20} />
            </div>
            <p className="text-xs font-medium text-ink">
              {isProcessing ? t("processingLogo") : t("uploadLogoDrag")}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {t("uploadLogoFormats")}
            </p>
          </div>
        )}
      </div>

      {/* Logo Size Control (Slider) */}
      {logoDataUrl && (
        <div className="pt-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground font-medium">
              {t("logoSize")}
            </span>
            <span className="font-mono text-ink text-[11px]">
              {Math.round(logoSize * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0.15}
            max={0.3}
            step={0.01}
            value={logoSize}
            onChange={(e) =>
              onChange({ logoDataUrl, logoSize: parseFloat(e.target.value) })
            }
            className="w-full accent-primary h-1.5 bg-line rounded-lg cursor-pointer"
            aria-label={t("logoSize")}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
            <span>{t("logoSizeSmall")}</span>
            <span>{t("logoSizeBalanced")}</span>
            <span>{t("logoSizeProminent")}</span>
          </div>
        </div>
      )}
    </div>
  );
}
