"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const notice = previewNotices[kind];

  return (
    <Dialog>
      <DialogTrigger className={className ?? "site-footer__link"}>
        {children}
      </DialogTrigger>
      <DialogContent>
        <span className="eyebrow mb-4">CANDIDCROWD · FIRST CHAPTER</span>
        <DialogTitle className="notice__title">{notice.title}</DialogTitle>
        <DialogDescription className="mt-5 text-sm leading-relaxed text-muted-foreground">
          {notice.body}
        </DialogDescription>
        {kind === "login" && (
          <Link href="/events/new" className="button mt-6">
            Create an event draft
          </Link>
        )}
      </DialogContent>
    </Dialog>
  );
}
