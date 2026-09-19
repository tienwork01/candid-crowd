"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useInView } from "motion/react";
import { QrCode } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { sampleEvent } from "../data/marketing";

export function DemoQr() {
  const t = useTranslations("marketing.demoQr");
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, margin: "200px" });
  const [src, setSrc] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;

    import("qrcode")
      .then((qr) =>
        qr.toDataURL(`${location.origin}/?demo=open#demo`, {
          width: 220,
          margin: 2,
          color: { dark: "#303e28", light: "#fffefa" },
          errorCorrectionLevel: "M",
        }),
      )
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [visible]);

  return (
    <div ref={ref} className="demo-qr">
      <div className="demo-qr__card">
        <span className="demo-qr__event-name">{sampleEvent.name}</span>
        <span className="demo-qr__title">
          {t("titleLine1")}
          <br />
          <em>{t("titleLine2")}</em>
        </span>
        <div className="demo-qr__image">
          {src ? (
            <Image
              src={src}
              alt={t("alt")}
              width={160}
              height={160}
              unoptimized
            />
          ) : (
            <QrCode
              size={90}
              aria-label={failed ? t("qrUnavailable") : t("qrLoading")}
            />
          )}
        </div>
        <span className="demo-qr__trust">{t("trust")}</span>
        <span className="demo-qr__url">{sampleEvent.fullUrl}</span>
      </div>
      <p className="demo-qr__note">
        {failed ? t("failedInstruction") : t("note")}
      </p>
    </div>
  );
}
