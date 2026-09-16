"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import { previewNotices } from "../data/marketing";

export function PreviewNotice({
  kind,
  children,
  className,
}: {
  kind: keyof typeof previewNotices;
  children: React.ReactNode;
  className?: string;
}) {
  const t = useTranslations("marketing.previewNotice");

  return (
    <Dialog>
      <DialogTrigger className={className ?? "site-footer__link"}>
        {children}
      </DialogTrigger>
      <DialogContent>
        <span className="eyebrow mb-4">{t("dialogEyebrow")}</span>
        <DialogTitle className="notice__title">
          {t(`notices.${kind}.title`)}
        </DialogTitle>
        <DialogDescription className="mt-5 text-sm leading-relaxed text-muted-foreground">
          {t(`notices.${kind}.body`)}
        </DialogDescription>
        {kind === "login" && (
          <Link href="/events/new" className="button mt-6">
            {t("createDraft")}
          </Link>
        )}
      </DialogContent>
    </Dialog>
  );
}
