import { PRINT_DIMENSIONS, type PrintSignConfig } from "./print-template-types";
import { renderPrintTemplateCanvas } from "./print-template-renderer";

/**
 * Generates and triggers download of a print-ready event sign (PDF or PNG).
 */
export async function downloadPrintableSign(
  config: PrintSignConfig,
): Promise<void> {
  const canvas = await renderPrintTemplateCanvas(config);
  const spec = PRINT_DIMENSIONS[config.size] || PRINT_DIMENSIONS["5x7"];

  const safeEventName = config.eventName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents for clean filenames
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const fileNamePrefix = `${safeEventName || "candidcrowd"}-sign-${config.theme}-${config.size}`;

  if (config.format === "png") {
    // High-resolution 300 DPI PNG download
    const link = document.createElement("a");

    link.download = `${fileNamePrefix}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    return;
  }

  // Exact millimetre PDF generation
  const pdfFormat: [number, number] | string =
    config.size === "5x7"
      ? [spec.widthMm, spec.heightMm]
      : config.size === "a5"
        ? "a5"
        : "a4";

  // jsPDF is ~400 kB and only ever runs when a host actually exports a PDF, so
  // it is pulled in on demand instead of riding along in the event page bundle.
  const { jsPDF } = await import("jspdf");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: pdfFormat,
    compress: true,
  });

  const imgData = canvas.toDataURL("image/png");

  pdf.addImage(
    imgData,
    "PNG",
    0,
    0,
    spec.widthMm,
    spec.heightMm,
    undefined,
    "FAST",
  );

  pdf.save(`${fileNamePrefix}.pdf`);
}
