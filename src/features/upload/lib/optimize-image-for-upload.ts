const DEFAULT_MAX_DIMENSION = 2560;
const DEFAULT_INITIAL_QUALITY = 0.9;
const DEFAULT_MIN_BYTES = 1024 * 1024;

function positiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const maxDimension = positiveNumber(
  process.env.NEXT_PUBLIC_UPLOAD_IMAGE_MAX_DIMENSION,
  DEFAULT_MAX_DIMENSION,
);
const initialQuality = Math.min(
  positiveNumber(
    process.env.NEXT_PUBLIC_UPLOAD_IMAGE_INITIAL_QUALITY,
    DEFAULT_INITIAL_QUALITY,
  ),
  1,
);
const minimumBytes = positiveNumber(
  process.env.NEXT_PUBLIC_UPLOAD_IMAGE_COMPRESSION_MIN_BYTES,
  DEFAULT_MIN_BYTES,
);

/**
 * Reduces the upload payload without forcing a low-quality target file size.
 * PNG and WebP retain their input MIME type; video is deliberately untouched.
 * If a browser cannot process an image, the original remains uploadable.
 */
export async function optimizeImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size < minimumBytes) {
    return file;
  }

  try {
    const { default: imageCompression } =
      await import("browser-image-compression");
    const optimized = await imageCompression(file, {
      maxWidthOrHeight: maxDimension,
      initialQuality,
      useWebWorker: true,
      // Preserve the original MIME type: converting transparent PNGs to JPEG
      // would damage them, and WebP is already efficient.
      fileType: file.type,
    });

    // Some images are already efficiently encoded. Never upload a larger
    // replacement merely because optimization ran.
    return optimized.size < file.size ? optimized : file;
  } catch {
    return file;
  }
}
