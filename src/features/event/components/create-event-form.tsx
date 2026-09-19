"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkle, ArrowRight } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { eventTypes, type EventType } from "../types/event";
import { useCreateEvent } from "../hooks";
import {
  Alert,
  AlertDescription,
  Button,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from "@/components/ui";

export function CreateEventForm() {
  const t = useTranslations("event");
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [eventType, setEventType] = useState<EventType>("Wedding");
  const [date, setDate] = useState("");
  const [dateUnknown, setDateUnknown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: createEvent, isPending } = useCreateEvent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError(t("create.nameRequired"));
      nameInputRef.current?.focus();

      return;
    }

    setError(null);

    try {
      const created = await createEvent({
        name: trimmedName,
        event_type: eventType,
        event_date: dateUnknown || !date ? null : `${date}T00:00:00Z`,
        date_unknown: dateUnknown,
      });

      startTransition(() => {
        router.push(`/events/${encodeURIComponent(created.id)}/ready`);
      });
    } catch {
      setError(t("create.nameRequired"));
    }
  };

  return (
    <div className="create-event-card">
      <header className="create-event-card__header">
        <div className="create-event-card__badge">
          <Sparkle size={13} weight="fill" aria-hidden="true" />
          <span>{t("create.under30s")}</span>
        </div>
        <h1 className="create-event-card__title">{t("create.pageTitle")}</h1>
        <p className="create-event-card__subtitle">
          {t("create.pageSubtitle")}
        </p>
      </header>

      <form
        className="create-event-card__form"
        onSubmit={handleSubmit}
        noValidate
      >
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="create-event-card__field">
          <Label htmlFor="event-name" className="create-event-card__label">
            {t("create.nameLabel")}
          </Label>
          <Input
            ref={nameInputRef}
            id="event-name"
            type="text"
            required
            autoFocus
            className="create-event-card__input h-12 text-base"
            placeholder={t("create.namePlaceholder")}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
          />
        </div>

        <div className="create-event-card__field">
          <Label htmlFor="event-type" className="create-event-card__label">
            {t("create.typeLabel")}
          </Label>
          <Select
            value={eventType}
            onValueChange={(val) => val && setEventType(val as EventType)}
          >
            <SelectTrigger
              id="event-type"
              className="create-event-card__select h-12 w-full text-base"
            >
              <SelectValue placeholder={t("create.typePlaceholder")}>
                {(val) =>
                  val
                    ? t(`types.${val as EventType}`)
                    : t("create.typePlaceholder")
                }
              </SelectValue>
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

        <div className="create-event-card__field">
          <div className="flex items-center justify-between mb-1.5">
            <Label
              htmlFor="event-date"
              className="create-event-card__label mb-0"
            >
              {t("create.dateLabel")}
            </Label>
          </div>

          <Input
            id="event-date"
            type="date"
            disabled={dateUnknown}
            className="create-event-card__input h-12 text-base disabled:opacity-50"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <div className="create-event-card__checkbox mt-2.5 flex items-center gap-2.5">
            <Checkbox
              id="date-unknown"
              checked={dateUnknown}
              onCheckedChange={(checked) => setDateUnknown(Boolean(checked))}
            />
            <Label
              htmlFor="date-unknown"
              className="text-sm font-normal text-muted-foreground cursor-pointer select-none"
            >
              {t("create.dateUnknown")}
            </Label>
          </div>
        </div>

        <div className="create-event-card__actions mt-6">
          <Button
            type="submit"
            disabled={isPending}
            className="create-event-card__button button w-full h-12 text-base font-medium"
          >
            {isPending ? (
              <>
                <Spinner size="sm" />
                <span>{t("create.creating")}</span>
              </>
            ) : (
              <>
                <span>{t("create.cta")}</span>
                <ArrowRight size={18} aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
