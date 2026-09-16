/**
 * Centralized Error Code Architecture for CandidCrowd.
 *
 * Backend/API services return machine-readable error codes.
 * The frontend maintains this error dictionary to translate codes
 * into consistent, user-friendly, and accessible UI messages.
 */

export const DEFAULT_ERROR_MESSAGE =
  "An unexpected error occurred. Please try again.";

export const ERROR_MESSAGES: Record<string, string> = {
  // Authentication & Account
  USER_ALREADY_EXISTS:
    "An account with this email already exists. Please log in instead.",
  INVALID_CREDENTIALS:
    "Email or password is incorrect. Please check your credentials.",
  INVALID_PASSWORD: "The password you entered is incorrect.",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters.",
  PASSWORD_TOO_LONG: "Password cannot exceed 128 characters.",
  EMAIL_NOT_VERIFIED: "Please verify your email address before continuing.",
  USER_NOT_FOUND: "No account was found with this email address.",
  INVALID_TOKEN: "This link or code is invalid or has expired.",
  TOKEN_EXPIRED: "This link has expired. Please request a new one.",
  RESET_PASSWORD_FAILED:
    "Unable to reset your password. Please request a new link.",
  CONSENT_REQUIRED:
    "Please accept the current Terms of Service and Privacy Policy to continue.",
  SESSION_EXPIRED: "Your session has expired. Please sign in again.",
  UNAUTHORIZED: "You do not have permission to perform this action.",
  SOCIAL_ACCOUNT_ALREADY_LINKED:
    "This social account is already linked to another user.",
  FAILED_TO_CREATE_USER: "We couldn’t create your account. Please try again.",

  // Event & Domain
  EVENT_NOT_FOUND: "The requested event could not be found.",
  EVENT_NAME_REQUIRED: "Please enter an event name.",
  INVALID_EVENT_DATE: "Please select a valid date for your event.",
  INVALID_GUEST_COUNT: "Please enter a valid expected guest count.",
  EVENT_EXPIRED: "This event has ended and is no longer accepting uploads.",
  EVENT_CLOSED: "This event gallery is currently closed.",

  // Media & Upload
  INVALID_FILE_TYPE:
    "Unsupported file type. Please upload a JPG, PNG, HEIC, or WebP photo.",
  FILE_TOO_LARGE: "File size exceeds the allowed limit.",
  UPLOAD_FAILED: "Upload failed. Please check your connection and try again.",
  STORAGE_ERROR:
    "Storage service temporarily unavailable. Please try again shortly.",

  // System, Network & Rate Limiting
  RATE_LIMIT_EXCEEDED:
    "Too many requests. Please wait a moment before trying again.",
  NETWORK_ERROR:
    "Unable to connect to the server. Please check your internet connection.",
  SERVER_ERROR: "A server error occurred. Please try again shortly.",
  REQUEST_FAILED: "The request could not be completed. Please try again.",
  UNKNOWN: DEFAULT_ERROR_MESSAGE,
};

const ERROR_CODE_ALIASES: Record<string, string> = {
  EMAIL_EXISTS: "USER_ALREADY_EXISTS",
  INVALID_EMAIL_OR_PASSWORD: "INVALID_CREDENTIALS",
  EMAIL_UNVERIFIED: "EMAIL_NOT_VERIFIED",
  UNAUTHENTICATED: "SESSION_EXPIRED",
  FORBIDDEN: "UNAUTHORIZED",
  TOO_MANY_REQUESTS: "RATE_LIMIT_EXCEEDED",
  INTERNAL_SERVER_ERROR: "SERVER_ERROR",
};

/**
 * Normalizes an error code by trimming, uppercasing, and replacing hyphens with underscores.
 * E.g. "user_already_exists" -> "USER_ALREADY_EXISTS"
 *      "user-already-exists" -> "USER_ALREADY_EXISTS"
 */
export function normalizeErrorCode(code: string): string {
  return code
    .trim()
    .toUpperCase()
    .replace(/-/g, "_")
    .replace(/[^A-Z0-9_]/g, "");
}

/**
 * Resolves an error object or string into a canonical uppercase error code.
 */
export function resolveErrorCode(errorOrCode?: unknown): string {
  if (!errorOrCode) return "UNKNOWN";

  let rawCode: string | undefined;

  if (typeof errorOrCode === "string") {
    rawCode = errorOrCode;
  } else if (typeof errorOrCode === "object" && errorOrCode !== null) {
    const errorObj = errorOrCode as Record<string, unknown>;

    if (typeof errorObj.code === "string") {
      rawCode = errorObj.code;
    } else if (
      typeof errorObj.error === "object" &&
      errorObj.error !== null &&
      typeof (errorObj.error as Record<string, unknown>).code === "string"
    ) {
      rawCode = (errorObj.error as Record<string, unknown>).code as string;
    }
  }

  if (!rawCode) return "UNKNOWN";

  const normalized = normalizeErrorCode(rawCode);

  return ERROR_CODE_ALIASES[normalized] ?? normalized;
}

/**
 * Resolves a user-facing error message from an error code or error object.
 * When a `translator` (e.g. from `useTranslations("common.errors")`) is provided,
 * returns the localized message; otherwise falls back to the English dictionary.
 *
 * @param errorOrCode An error code string, Error instance, or error response object
 * @param customFallback Optional fallback message if the error code is unrecognized
 * @param translator Optional next-intl translation function for common.errors
 * @returns The user-facing error message
 */
export function getErrorMessage(
  errorOrCode?: unknown,
  customFallback?: string,
  translator?: (key: string) => string,
): string {
  const code = resolveErrorCode(errorOrCode);

  if (translator) {
    try {
      const translated = translator(code);

      if (translated && translated !== code) return translated;
    } catch {
      // Fall through to dictionary or fallback
    }
  }

  return ERROR_MESSAGES[code] ?? customFallback ?? ERROR_MESSAGES.UNKNOWN;
}
