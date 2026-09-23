"use client";

import { useTranslations } from "next-intl";
import type {
  QRCornerDotType,
  QRCornerSquareType,
  QRDotType,
} from "./qr-customize-types";

interface QRStyleSelectorProps {
  dotType: QRDotType;
  cornerSquareType: QRCornerSquareType;
  cornerDotType: QRCornerDotType;
  onChange: (updates: {
    dotType?: QRDotType;
    cornerSquareType?: QRCornerSquareType;
    cornerDotType?: QRCornerDotType;
  }) => void;
}

type DotLabelKey = "dotRounded" | "dotSquare" | "dotDots" | "dotClassy";
type CornerLabelKey = "cornerRounded" | "cornerSquare" | "cornerDot";

export function QRStyleSelector({
  dotType,
  cornerSquareType,
  cornerDotType,
  onChange,
}: QRStyleSelectorProps) {
  const t = useTranslations("event.qrCustomize");

  const dotOptions: Array<{ type: QRDotType; labelKey: DotLabelKey }> = [
    { type: "rounded", labelKey: "dotRounded" },
    { type: "square", labelKey: "dotSquare" },
    { type: "dots", labelKey: "dotDots" },
    { type: "classy", labelKey: "dotClassy" },
  ];

  const cornerOptions: Array<{
    square: QRCornerSquareType;
    dot: QRCornerDotType;
    labelKey: CornerLabelKey;
  }> = [
    { square: "extra-rounded", dot: "dot", labelKey: "cornerRounded" },
    { square: "square", dot: "square", labelKey: "cornerSquare" },
    { square: "dot", dot: "dot", labelKey: "cornerDot" },
  ];

  return (
    <div className="qr-style-selector space-y-4">
      {/* Dot Style Selection */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
          {t("dotStyle")}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {dotOptions.map((opt) => {
            const isSelected = dotType === opt.type;

            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => onChange({ dotType: opt.type })}
                className={`py-2 px-2 rounded-xl text-xs font-medium border flex flex-col items-center gap-1.5 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/20"
                    : "border-line bg-surface text-muted-foreground hover:text-ink hover:border-line-hover"
                }`}
              >
                {/* Visual miniature dot preview */}
                <div className="flex gap-1 items-center justify-center h-4">
                  {opt.type === "square" && (
                    <>
                      <div className="w-2.5 h-2.5 bg-current" />
                      <div className="w-2.5 h-2.5 bg-current" />
                    </>
                  )}
                  {opt.type === "rounded" && (
                    <>
                      <div className="w-2.5 h-2.5 bg-current rounded-xs" />
                      <div className="w-2.5 h-2.5 bg-current rounded-xs" />
                    </>
                  )}
                  {opt.type === "dots" && (
                    <>
                      <div className="w-2.5 h-2.5 bg-current rounded-full" />
                      <div className="w-2.5 h-2.5 bg-current rounded-full" />
                    </>
                  )}
                  {opt.type === "classy" && (
                    <>
                      <div className="w-2.5 h-2.5 bg-current rounded-tl-lg rounded-br-lg" />
                      <div className="w-2.5 h-2.5 bg-current rounded-tl-lg rounded-br-lg" />
                    </>
                  )}
                </div>
                <span>{t(opt.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Corner Eye Style Selection */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
          {t("cornerStyle")}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {cornerOptions.map((opt) => {
            const isSelected =
              cornerSquareType === opt.square && cornerDotType === opt.dot;

            return (
              <button
                key={opt.labelKey}
                type="button"
                onClick={() =>
                  onChange({
                    cornerSquareType: opt.square,
                    cornerDotType: opt.dot,
                  })
                }
                className={`py-2 px-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/20"
                    : "border-line bg-surface text-muted-foreground hover:text-ink hover:border-line-hover"
                }`}
              >
                {/* Visual miniature corner eye */}
                <div
                  className={`w-4 h-4 border-2 border-current flex items-center justify-center ${
                    opt.square === "extra-rounded"
                      ? "rounded-md"
                      : opt.square === "dot"
                        ? "rounded-full"
                        : "rounded-none"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 bg-current ${
                      opt.dot === "dot" ? "rounded-full" : "rounded-none"
                    }`}
                  />
                </div>
                <span>{t(opt.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
