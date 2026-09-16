"use client";

import Link from "next/link";
import { Aperture } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

export function Brand() {
  const t = useTranslations("common");

  return (
    <Link href="/" className="brand" aria-label={t("brandHome")}>
      <Aperture aria-hidden="true" />
      <span>
        candidcrowd<span className="brand__dot">.</span>
      </span>
    </Link>
  );
}
