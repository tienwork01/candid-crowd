import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("auth routes are accessible and link to each other", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel("Email address")).toHaveAttribute(
    "autocomplete",
    "email",
  );
  await expect(page.locator("#password")).toHaveAttribute(
    "autocomplete",
    "current-password",
  );
  await page.getByRole("button", { name: "Forgot password?" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "No email has been sent",
  );
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Forgot password?" }),
  ).toBeFocused();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("link", { name: "Create an account" }).click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByLabel("Full name")).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("link", { name: "Log in", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("registration validates consent and keeps credentials local to the form", async ({
  page,
}) => {
  const mutations: string[] = [];

  page.on("request", (request) => {
    if (["POST", "PUT", "PATCH"].includes(request.method()))
      mutations.push(request.url());
  });
  await page.goto("/register");
  await page.getByLabel("Full name").fill("Jamie Morgan");
  await page.getByLabel("Email address").fill("jamie@example.com");
  await page.locator("#password").fill("sample-only-password");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.locator("#password")).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Hide password" }).click();
  await expect(page.locator("#password")).toHaveAttribute("type", "password");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page.locator("#terms")).toBeFocused();
  await expect(page.locator(".auth-form__feedback")).toBeEmpty();
  await page
    .getByRole("button", { name: "Terms of service", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("being finalized");
  await page.keyboard.press("Escape");
  await page.locator("#terms").check();
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("not been saved");

  for (const provider of ["Google", "Apple"]) {
    await page
      .getByRole("button", { name: `Continue with ${provider}` })
      .click();
    await expect(page.getByRole("status")).toContainText(
      `${provider} sign-in is not available`,
    );
  }

  expect(mutations).toEqual([]);
  expect(
    await page.evaluate(() =>
      JSON.stringify({ ...localStorage, ...sessionStorage }),
    ),
  ).not.toContain("sample-only-password");
  await page.reload();
  await expect(page.locator("#password")).toHaveValue("");
});
