"use client";

import {
  DownloadSimple,
  Eye,
  EyeSlash,
  Heart,
  Trash,
  X,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

type EventBatchActionBarProps = {
  selectedCount: number;
  onClearSelection: () => void;
  onBatchFavorite?: () => void;
  onBatchHide: () => void;
  onBatchShow: () => void;
  onBatchDownload: () => void;
  onBatchDelete: () => void;
};

export function EventBatchActionBar({
  selectedCount,
  onClearSelection,
  onBatchFavorite,
  onBatchHide,
  onBatchShow,
  onBatchDownload,
  onBatchDelete,
}: EventBatchActionBarProps) {
  const t = useTranslations("event");

  if (selectedCount === 0) return null;

  return (
    <aside
      className="event-batch-bar"
      aria-label="Batch actions toolbar"
      role="toolbar"
    >
      <div className="event-batch-bar__pill">
        {/* Count Label */}
        <span className="event-batch-bar__count">
          {t("gallery.batchSelectedCount", { count: selectedCount })}
        </span>

        <span className="event-batch-bar__divider" aria-hidden="true" />

        {/* Action Buttons */}
        <div className="event-batch-bar__actions">
          {onBatchFavorite && (
            <button
              type="button"
              onClick={onBatchFavorite}
              className="event-batch-bar__btn"
              title={t("gallery.batchFavorite", { count: selectedCount })}
              aria-label={t("gallery.batchFavorite", { count: selectedCount })}
            >
              <Heart
                size={15}
                weight="fill"
                className="text-rose-400"
                aria-hidden="true"
              />
              <span className="hidden sm:inline">
                {t("gallery.batchFavorite", { count: selectedCount })}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onBatchHide}
            className="event-batch-bar__btn"
            title={t("gallery.batchHide", { count: selectedCount })}
            aria-label={t("gallery.batchHide", { count: selectedCount })}
          >
            <EyeSlash size={15} aria-hidden="true" />
            <span className="hidden sm:inline">
              {t("gallery.batchHide", { count: selectedCount })}
            </span>
          </button>

          <button
            type="button"
            onClick={onBatchShow}
            className="event-batch-bar__btn"
            title={t("gallery.batchShow", { count: selectedCount })}
            aria-label={t("gallery.batchShow", { count: selectedCount })}
          >
            <Eye size={15} aria-hidden="true" />
            <span className="hidden sm:inline">
              {t("gallery.batchShow", { count: selectedCount })}
            </span>
          </button>

          <button
            type="button"
            onClick={onBatchDownload}
            className="event-batch-bar__btn"
            title={t("gallery.batchDownload", { count: selectedCount })}
            aria-label={t("gallery.batchDownload", { count: selectedCount })}
          >
            <DownloadSimple size={15} aria-hidden="true" />
            <span className="hidden sm:inline">
              {t("gallery.batchDownload", { count: selectedCount })}
            </span>
          </button>

          <button
            type="button"
            onClick={onBatchDelete}
            className="event-batch-bar__btn event-batch-bar__btn--delete"
            title={t("gallery.batchDelete", { count: selectedCount })}
            aria-label={t("gallery.batchDelete", { count: selectedCount })}
          >
            <Trash size={15} aria-hidden="true" />
            <span className="hidden sm:inline">
              {t("gallery.batchDelete", { count: selectedCount })}
            </span>
          </button>
        </div>

        <span className="event-batch-bar__divider" aria-hidden="true" />

        {/* Clear Selection */}
        <button
          type="button"
          onClick={onClearSelection}
          className="event-batch-bar__close"
          title={t("gallery.batchCancel")}
          aria-label={t("gallery.batchCancel")}
        >
          <X size={15} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
