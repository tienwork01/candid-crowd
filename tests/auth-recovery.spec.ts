import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("mobile auth controls accept physical taps", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");

  await page.goto("/login");

  const email = page.getByLabel("Email address");
  const emailBox = await email.boundingBox();

  expect(emailBox).not.toBeNull();
  await page.touchscreen.tap(
    emailBox!.x + emailBox!.width / 2,
    emailBox!.y + emailBox!.height / 2,
  );
  await expect(email).toBeFocused();

  const passwordToggle = page.getByRole("button", { name: "Show password" });
  const toggleBox = await passwordToggle.boundingBox();

  expect(toggleBox).not.toBeNull();
  await page.touchscreen.tap(
    toggleBox!.x + toggleBox!.width / 2,
    toggleBox!.y + toggleBox!.height / 2,
  );
  await expect(page.locator("#password")).toHaveAttribute("type", "text");
});

test("password recovery and verification use Better Auth link flows", async ({
  page,
}) => {
  const mutations: string[] = [];

  await page.route("**/api/auth/**", async (route) => {
    mutations.push(new URL(route.request().url()).pathname);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: true }),
    });
  });

  await page.goto("/forgot-password");
  await page.getByLabel("Email address").fill("host@example.com");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("status")).toContainText(
    "If an account exists for that email",
  );

  await page.goto("/reset-password?token=reset-token");
  await page
    .getByLabel("New password", { exact: true })
    .fill("memory-book-2026");
  await page
    .getByLabel("Confirm new password", { exact: true })
    .fill("different-password");
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(page.locator("#password-error")).toContainText("do not match");
  await expect(
    page.getByLabel("Confirm new password", { exact: true }),
  ).toBeFocused();
  await page
    .getByLabel("Confirm new password", { exact: true })
    .fill("memory-book-2026");
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Your password has been changed",
  );

  await page.goto("/verify-email?email=host%40example.com");
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("button", { name: "Send another link" }).click();
  await expect(page.getByRole("status")).toContainText(
    "A fresh verification link is on its way",
  );

  expect(mutations).toEqual([
    "/api/auth/request-password-reset",
    "/api/auth/reset-password",
    "/api/auth/send-verification-email",
  ]);
});
