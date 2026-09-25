import { expect, test } from "@playwright/test";
import { APIError } from "@/lib/api-client";
import {
  DEFAULT_ERROR_MESSAGE,
  ERROR_MESSAGES,
  getErrorMessage,
  normalizeErrorCode,
} from "@/lib/errors";

test.describe("Frontend Error Architecture", () => {
  test("normalizes error codes consistently across formats", () => {
    expect(normalizeErrorCode("USER_ALREADY_EXISTS")).toBe(
      "USER_ALREADY_EXISTS",
    );
    expect(normalizeErrorCode("user-already-exists")).toBe(
      "USER_ALREADY_EXISTS",
    );
    expect(normalizeErrorCode("  Invalid_Credentials  ")).toBe(
      "INVALID_CREDENTIALS",
    );
    expect(normalizeErrorCode("EMAIL-UNVERIFIED")).toBe("EMAIL_UNVERIFIED");
  });

  test("resolves known error codes from the error dictionary", () => {
    expect(getErrorMessage("user_already_exists")).toBe(
      ERROR_MESSAGES.user_already_exists,
    );
    expect(getErrorMessage("USER_ALREADY_EXISTS")).toBe(
      ERROR_MESSAGES.user_already_exists,
    );
    expect(getErrorMessage("invalid-credentials")).toBe(
      ERROR_MESSAGES.invalid_credentials,
    );
    expect(getErrorMessage("consent_required")).toBe(
      ERROR_MESSAGES.consent_required,
    );
    expect(getErrorMessage("RATE_LIMIT_EXCEEDED")).toBe(
      ERROR_MESSAGES.rate_limit_exceeded,
    );
    expect(getErrorMessage("event_not_found")).toBe(
      ERROR_MESSAGES.event_not_found,
    );
    expect(getErrorMessage("DISPOSABLE_EMAIL_NOT_ALLOWED")).toBe(
      ERROR_MESSAGES.disposable_email_not_allowed,
    );
  });

  test("falls back to DEFAULT_ERROR_MESSAGE when error code is unknown", () => {
    expect(getErrorMessage("non_existent_code_12345")).toBe(
      DEFAULT_ERROR_MESSAGE,
    );
    expect(getErrorMessage("RANDOM_BACKEND_ERROR")).toBe(DEFAULT_ERROR_MESSAGE);
    expect(getErrorMessage(null)).toBe(DEFAULT_ERROR_MESSAGE);
    expect(getErrorMessage(undefined)).toBe(DEFAULT_ERROR_MESSAGE);
    expect(getErrorMessage("")).toBe(DEFAULT_ERROR_MESSAGE);
  });

  test("falls back to custom fallback if provided and code is unknown", () => {
    const custom = "Custom form error fallback";

    expect(getErrorMessage("unknown_code", custom)).toBe(custom);
    expect(getErrorMessage(null, custom)).toBe(custom);
    // But if code IS known, it still uses the dictionary message:
    expect(getErrorMessage("user_already_exists", custom)).toBe(
      ERROR_MESSAGES.user_already_exists,
    );
  });

  test("resolves error codes from error objects (Better-Auth / APIError)", () => {
    // Better-Auth style: { code: string }
    expect(getErrorMessage({ code: "USER_ALREADY_EXISTS" })).toBe(
      ERROR_MESSAGES.user_already_exists,
    );

    // Nested style: { error: { code: string } }
    expect(getErrorMessage({ error: { code: "invalid_password" } })).toBe(
      ERROR_MESSAGES.invalid_password,
    );

    // Object with unknown code falls back
    expect(getErrorMessage({ code: "UNKNOWN_CUSTOM_ERROR" })).toBe(
      DEFAULT_ERROR_MESSAGE,
    );
  });

  test("APIError automatically resolves message from error dictionary", () => {
    const knownError = new APIError(400, "invalid_event_date");

    expect(knownError.code).toBe("invalid_event_date");
    expect(knownError.message).toBe(ERROR_MESSAGES.invalid_event_date);

    const unknownError = new APIError(500, "MYSTERIOUS_SERVER_FAILURE");

    expect(unknownError.code).toBe("MYSTERIOUS_SERVER_FAILURE");
    expect(unknownError.message).toBe(DEFAULT_ERROR_MESSAGE);
  });
});
