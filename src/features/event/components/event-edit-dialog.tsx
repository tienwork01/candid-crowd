"use client";

import { useEffect, useState } from "react";
import { Sparkle, X } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { eventTypes, type CandidEvent, type EventType } from "../types/event";
import {
  Button,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";

type EventEditDialogProps = {
  event: CandidEvent;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<CandidEvent>) => void;
};

function EventEditForm({
  event,
  onClose,
  onSave,
}: Omit<EventEditDialogProps, "isOpen">) {
  const t = useTranslations("event");
  const tCommon = useTranslations("common");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const [name, setName] = useState(event.name);
  const [eventType, setEventType] = useState<EventType>(event.event_type);
  const [date, setDate] = useState(
    event.event_date ? event.event_date.slice(0, 10) : "",
  );
  const [guestCount, setGuestCount] = useState<string>(
    event.expected_guest_count ? String(event.expected_guest_count) : "",
  );
  const [galleryEnabled, setGalleryEnabled] = useState(
    event.gallery_enabled !== false,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(t("create.nameRequired"));

      return;
    }

    const countNum = parseInt(guestCount.trim(), 10);

    onSave({
      name: name.trim(),
      event_type: eventType,
      event_date: date ? `${date}T00:00:00Z` : null,
      date_unknown: !date,
      expected_guest_count: Number.isNaN(countNum) ? null : countNum,
      gallery_enabled: galleryEnabled,
    });

    toast.success(t("settings.saveSuccess"));
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-dialog-title"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface border border-line rounded-2xl shadow-raised overflow-hidden"
        style={{ backgroundColor: "var(--surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-line">
          <div>
            <h2
              id="edit-dialog-title"
              className="font-heading text-xl text-ink"
            >
              {t("settings.title")}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("settings.sub")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-ink hover:bg-soft transition-colors"
            aria-label={tCommon("actions.close")}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <Label
              htmlFor="edit-name"
              className="text-xs font-semibold text-ink uppercase tracking-wider block mb-1"
            >
              {t("create.nameLabel")}
            </Label>
            <Input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="edit-type"
                className="text-xs font-semibold text-ink uppercase tracking-wider block mb-1"
              >
                {t("create.typeLabel")}
              </Label>
              <Select
                value={eventType}
                onValueChange={(val) => val && setEventType(val as EventType)}
              >
                <SelectTrigger id="edit-type" className="h-11 w-full">
                  <SelectValue>{t(`types.${eventType}`)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`types.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor="edit-date"
                className="text-xs font-semibold text-ink uppercase tracking-wider block mb-1"
              >
                {t("create.dateLabel")}
              </Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="edit-guests"
              className="text-xs font-semibold text-ink uppercase tracking-wider block mb-1"
            >
              {t("guestCount.heading")}
            </Label>
            <Input
              id="edit-guests"
              type="number"
              min={1}
              max={50000}
              placeholder="e.g. 120"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="pt-2 border-t border-line">
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="gallery-visibility"
                checked={galleryEnabled}
                onCheckedChange={(c) => setGalleryEnabled(Boolean(c))}
                className="mt-0.5"
              />
              <div>
                <Label
                  htmlFor="gallery-visibility"
                  className="text-xs font-semibold text-ink block cursor-pointer"
                >
                  {t("settings.galleryVisibilityLabel")}
                </Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {t("settings.galleryVisibilityDesc")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-10 px-4"
            >
              {tCommon("actions.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              className="button button--primary text-xs h-10 px-5"
            >
              <Sparkle size={14} weight="fill" className="mr-1" />
              <span>{tCommon("actions.save")}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EventEditDialog({
  event,
  isOpen,
  onClose,
  onSave,
}: EventEditDialogProps) {
  if (!isOpen) return null;

  return (
    <EventEditForm
      key={`${event.id}-${event.updated_at}`}
      event={event}
      onClose={onClose}
      onSave={onSave}
    />
  );
}
