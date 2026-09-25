import { expect, test } from "@playwright/test";
import { isDisposableEmail } from "@/lib/disposable-email";

test.describe("Disposable Email Detection", () => {
  test("identifies well-known 10-minute and disposable email services", () => {
    const disposableAddresses = [
      "user@10minutemail.com",
      "user@temp-mail.org",
      "user@mailinator.com",
      "user@sub.mailinator.com",
      "user@guerrillamail.com",
      "user@yopmail.com",
      "user@trashmail.com",
      "user@sharklasers.com",
      "user@dispostable.com",
      "user@getairmail.com",
    ];

    for (const email of disposableAddresses) {
      expect(
        isDisposableEmail(email),
        `Expected ${email} to be detected as disposable`,
      ).toBe(true);
    }
  });

  test("allows legitimate email providers and domains", () => {
    const legitimateAddresses = [
      "host@gmail.com",
      "user@outlook.com",
      "user@hotmail.com",
      "user@yahoo.com",
      "user@proton.me",
      "user@icloud.com",
      "user@company.co.uk",
      "planner@eventvenue.org",
      "contact@candidcrowd.app",
    ];

    for (const email of legitimateAddresses) {
      expect(
        isDisposableEmail(email),
        `Expected ${email} to be allowed as legitimate`,
      ).toBe(false);
    }
  });

  test("handles malformed and edge-case email inputs safely", () => {
    expect(isDisposableEmail("")).toBe(false);
    expect(isDisposableEmail("notanemail")).toBe(false);
    expect(isDisposableEmail("@")).toBe(false);
    expect(isDisposableEmail("user@")).toBe(false);
    expect(isDisposableEmail("@domain.com")).toBe(false);
  });
});
