"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger, TabsIndicator } from "@/components/ui";
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
    key: string;
    square: QRCornerSquareType;
    dot: QRCornerDotType;
    labelKey: CornerLabelKey;
  }> = [
    {
      key: "extra-rounded:dot",
      square: "extra-rounded",
      dot: "dot",
      labelKey: "cornerRounded",
    },
    {
      key: "square:square",
      square: "square",
      dot: "square",
      labelKey: "cornerSquare",
    },
    {
      key: "dot:dot",
      square: "dot",
      dot: "dot",
      labelKey: "cornerDot",
    },
  ];

  const activeCornerKey =
    cornerOptions.find(
      (opt) => opt.square === cornerSquareType && opt.dot === cornerDotType,
    )?.key || cornerOptions[0].key;

  return (
    <div className="qr-style-selector space-y-4">
      {/* Dot Style Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
          {t("dotStyle")}
        </label>
        <Tabs
          value={dotType}
          onValueChange={(val) => {
            if (val) onChange({ dotType: val as QRDotType });
          }}
        >
          <TabsList
            variant="pill"
            className="w-full grid grid-cols-4 gap-1 p-1 bg-soft border border-line rounded-xl"
          >
            {dotOptions.map((opt) => (
              <TabsTrigger
                key={opt.type}
                value={opt.type}
                variant="pill"
                className="py-2 px-1 text-xs rounded-lg flex flex-col items-center gap-1.5"
              >
                {/* Visual miniature dot preview */}
                <div className="flex gap-1 items-center justify-center h-4 text-current">
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
              </TabsTrigger>
            ))}
            <TabsIndicator variant="pill" />
          </TabsList>
        </Tabs>
      </div>

      {/* Corner Eye Style Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
          {t("cornerStyle")}
        </label>
        <Tabs
          value={activeCornerKey}
          onValueChange={(val) => {
            const selected = cornerOptions.find((opt) => opt.key === val);

            if (selected) {
              onChange({
                cornerSquareType: selected.square,
                cornerDotType: selected.dot,
              });
            }
          }}
        >
          <TabsList
            variant="pill"
            className="w-full grid grid-cols-3 gap-1 p-1 bg-soft border border-line rounded-xl"
          >
            {cornerOptions.map((opt) => (
              <TabsTrigger
                key={opt.key}
                value={opt.key}
                variant="pill"
                className="py-2 px-2 text-xs rounded-lg flex items-center justify-center gap-2"
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
              </TabsTrigger>
            ))}
            <TabsIndicator variant="pill" />
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
