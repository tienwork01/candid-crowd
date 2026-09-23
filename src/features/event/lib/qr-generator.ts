import type { QRCustomizeState } from "../components/qr-customize/qr-customize-types";

/**
 * Generates a high-resolution QR code data URL (1400x1400 by default for 300 DPI print quality).
 * If a custom QR configuration is provided (custom logo, colors, dot/corner styles),
 * it uses `qr-code-styling` to preserve the exact branding and center logo.
 * Otherwise, it falls back to standard `qrcode` with crisp ECC H level.
 */
export async function generateHighResQRDataUrl(
  url: string,
  config?: QRCustomizeState | null,
  size = 1400,
): Promise<string> {
  if (config) {
    try {
      const { default: QRCodeStyling } = await import("qr-code-styling");

      const qr = new QRCodeStyling({
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
          margin: Math.round(size * 0.006),
          imageSize: config.logoSize,
          hideBackgroundDots: true,
        },
        qrOptions: {
          errorCorrectionLevel: "H",
        },
      });

      const rawData = await qr.getRawData("png");

      if (rawData instanceof Blob) {
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();

          reader.onloadend = () => {
            if (typeof reader.result === "string") {
              resolve(reader.result);
            } else {
              reject(new Error("Failed to read QR blob"));
            }
          };

          reader.onerror = reject;

          reader.readAsDataURL(rawData);
        });
      }
    } catch (err) {
      console.warn(
        "Failed to generate styled QR code for print, falling back to standard QR:",
        err,
      );
    }
  }

  // Fallback to crisp standard QR code
  const qrcodeModule = await import("qrcode");

  return qrcodeModule.toDataURL(url, {
    width: size,
    margin: 1.5,
    color: {
      dark: config?.fgColor || "#181e17",
      light: config?.bgColor || "#ffffff",
    },
    errorCorrectionLevel: "H",
  });
}
