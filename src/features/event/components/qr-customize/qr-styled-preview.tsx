"use client";

import { useEffect, useRef, useState } from "react";
import { QrCode } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import type QRCodeStyling from "qr-code-styling";
import type { QRCustomizeState } from "./qr-customize-types";

interface QRStyledPreviewProps {
  url: string;
  config: QRCustomizeState;
  eventName: string;
  formattedDate?: string | null;
  size?: number;
  className?: string;
  onDownloadReady?: (
    downloadFn: (extension: "png" | "svg") => Promise<void>,
  ) => void;
}

export function QRStyledPreview({
  url,
  config,
  eventName,
  formattedDate,
  size = 260,
  className = "",
  onDownloadReady,
}: QRStyledPreviewProps) {
  const t = useTranslations("event");
  const containerRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<QRCodeStyling | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function initOrUpdate() {
      if (!containerRef.current) return;

      const { default: QRCodeStylingClass } = await import("qr-code-styling");

      if (!active) return;

      const options = {
        width: size,
        height: size,
        data: url,
        image: config.logoDataUrl || undefined,
        dotsOptions: {
          color: config.fgColor,
          type: config.dotType,
        },
        cornersSquareOptions: {
          color: config.fgColor,
          type: config.cornerSquareType,
        },
        cornersDotOptions: {
          color: config.fgColor,
          type: config.cornerDotType,
        },
        backgroundOptions: {
          color: config.bgColor,
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 6,
          imageSize: config.logoSize,
          hideBackgroundDots: true,
        },
        qrOptions: {
          errorCorrectionLevel: "H" as const,
        },
      };

      if (!qrInstanceRef.current) {
        const qr = new QRCodeStylingClass(options);

        qrInstanceRef.current = qr;
        containerRef.current.innerHTML = "";
        qr.append(containerRef.current);
      } else {
        qrInstanceRef.current.update(options);
      }

      setIsReady(true);

      if (onDownloadReady && qrInstanceRef.current) {
        onDownloadReady(async (extension: "png" | "svg") => {
          if (!qrInstanceRef.current) return;

          const safeName = eventName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

          await qrInstanceRef.current.download({
            name: `${safeName || "candidcrowd"}-qr`,
            extension,
          });
        });
      }
    }

    void initOrUpdate();

    return () => {
      active = false;
    };
  }, [url, config, eventName, size, onDownloadReady]);

  return (
    <div
      className={`qr-styled-card flex flex-col items-center justify-center p-6 rounded-2xl border border-line transition-all duration-300 ${className}`}
      style={{
        backgroundColor: config.cardBgColor,
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.06)",
      }}
    >
      {/* QR Code Container */}
      <div
        className="qr-styled-card__code relative flex items-center justify-center rounded-xl p-3 transition-colors"
        style={{ backgroundColor: config.bgColor }}
      >
        <div ref={containerRef} className="flex items-center justify-center" />
        {!isReady && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl"
            style={{ backgroundColor: config.bgColor }}
          >
            <QrCode size={48} className="text-muted-foreground animate-pulse" />
          </div>
        )}
      </div>

      {/* Card Typography / Event Meta */}
      <div className="qr-styled-card__meta text-center mt-4 w-full">
        <h3
          className="font-heading text-base font-semibold truncate max-w-[280px] mx-auto"
          style={{ color: config.fgColor }}
        >
          {eventName}
        </h3>
        {formattedDate && (
          <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
            {formattedDate}
          </p>
        )}
        <p
          className="text-xs font-medium mt-1"
          style={{ color: config.fgColor, opacity: 0.85 }}
        >
          {t("ready.qrCta")}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {t("ready.noAppNeeded")}
        </p>
      </div>
    </div>
  );
}
