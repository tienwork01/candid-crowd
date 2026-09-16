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
  user_already_exists:
    "An account with this email already exists. Please log in instead.",
  email_exists:
    "An account with this email already exists. Please log in instead.",
  invalid_email_or_password:
    "Email or password is incorrect. Please check your credentials.",
  invalid_credentials:
    "Email or password is incorrect. Please check your credentials.",
  invalid_password: "The password you entered is incorrect.",
  password_too_short: "Password must be at least 8 characters.",
  password_too_long: "Password cannot exceed 128 characters.",
  email_not_verified: "Please verify your email address before continuing.",
  email_unverified: "Please verify your email address before continuing.",
  user_not_found: "No account was found with this email address.",
  invalid_token: "This link or code is invalid or has expired.",
  token_expired: "This link has expired. Please request a new one.",
  reset_password_failed:
    "Unable to reset your password. Please request a new link.",
  consent_required:
    "Please accept the current Terms of Service and Privacy Policy to continue.",
  session_expired: "Your session has expired. Please sign in again.",
  unauthenticated: "Your session has expired. Please sign in again.",
  unauthorized: "You do not have permission to perform this action.",
  forbidden: "You do not have permission to perform this action.",
  social_account_already_linked:
    "This social account is already linked to another user.",
  failed_to_create_user: "We couldn’t create your account. Please try again.",

  // Event & Domain
  event_not_found: "The requested event could not be found.",
  event_name_required: "Please enter an event name.",
  invalid_event_date: "Please select a valid date for your event.",
  invalid_guest_count: "Please enter a valid expected guest count.",
  event_expired: "This event has ended and is no longer accepting uploads.",
  event_closed: "This event gallery is currently closed.",

  // Media & Upload
  invalid_file_type:
    "Unsupported file type. Please upload a JPG, PNG, HEIC, or WebP photo.",
  file_too_large: "File size exceeds the allowed limit.",
  upload_failed: "Upload failed. Please check your connection and try again.",
  storage_error:
    "Storage service temporarily unavailable. Please try again shortly.",

  // System, Network & Rate Limiting
  rate_limit_exceeded:
    "Too many requests. Please wait a moment before trying again.",
  too_many_requests:
    "Too many requests. Please wait a moment before trying again.",
  network_error:
    "Unable to connect to the server. Please check your internet connection.",
  server_error: "A server error occurred. Please try again shortly.",
  internal_server_error: "A server error occurred. Please try again shortly.",
  request_failed: "The request could not be completed. Please try again.",
};

/**
 * Normalizes an error code by trimming, lowercasing, and replacing hyphens with underscores.
 * E.g. "USER_ALREADY_EXISTS" -> "user_already_exists"
 *      "user-already-exists" -> "user_already_exists"
 */
export function normalizeErrorCode(code: string): string {
  return code
    .trim()
    .toLowerCase()
    .replace(/-/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

/**
 * Resolves a user-facing error message from an error code or error object.
 *
 * Lookup flow:
 * 1. Extract error code from input (string, APIError, Better-Auth error object, etc.).
 * 2. Normalize the error code.
 * 3. Match against the frontend `ERROR_MESSAGES` dictionary.
 * 4. If matched, return the curated message.
 * 5. If not matched or no code found, return the fallback message (or DEFAULT_ERROR_MESSAGE).
 *
 * @param errorOrCode An error code string, Error instance, or error response object
 * @param customFallback Optional fallback message if the error code is unrecognized
 * @returns The user-facing error message
 */
export function getErrorMessage(
  errorOrCode?: unknown,
  customFallback?: string,
): string {
  const fallback = customFallback ?? DEFAULT_ERROR_MESSAGE;

  if (!errorOrCode) {
    return fallback;
  }

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

  if (!rawCode) {
    return fallback;
  }

  const normalized = normalizeErrorCode(rawCode);

  return ERROR_MESSAGES[normalized] ?? fallback;
}
