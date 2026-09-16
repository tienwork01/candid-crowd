"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useInView } from "motion/react";
import { QrCode } from "@phosphor-icons/react";

export function DemoQr() {
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
      <span className="eyebrow">A LITTLE INVITATION</span>
      <span className="demo-qr__title">
        Your perspective
        <br />
        <em>belongs here.</em>
      </span>
      <div className="demo-qr__image">
        {src ? (
          <Image
            src={src}
            alt="Scan to open the interactive CandidCrowd guest demo"
            width={160}
            height={160}
            unoptimized
          />
        ) : (
          <QrCode
            size={90}
            aria-label={
              failed
                ? "QR unavailable; use Try without scanning"
                : "QR code loading"
            }
          />
        )}
      </div>
      <p>
        {failed
          ? "Use the button below to try the demo."
          : "Scan with your phone camera"}
      </p>
      <span className="demo-qr__brand">candidcrowd.</span>
      <p className="demo-qr__note">
        Use a publicly reachable site URL to scan from another device.
      </p>
    </div>
  );
}
