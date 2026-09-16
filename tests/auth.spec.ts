import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

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
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);
  await expect(
    page.getByRole("heading", { name: "Find your way back." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Log in" }).click();
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
});

test("registration sends consent to Better Auth and stores no credentials", async ({
  page,
}) => {
  let registration: Record<string, unknown> | undefined;

  await page.route("**/api/auth/sign-up/email", async (route) => {
    registration = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        token: null,
        user: {
          id: "better-auth-test-user",
          name: "Jamie Morgan",
          email: "jamie@example.com",
          emailVerified: false,
        },
      }),
    });
  });

  await page.goto("/register");
  await page.getByLabel("Full name").fill("Jamie Morgan");
  await page.getByLabel("Email address").fill("jamie@example.com");
  await page.locator("#password").fill("sample-only-password");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.locator("#password")).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Hide password" }).click();
  await expect(page.locator("#password")).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.locator("#terms")).toBeFocused();
  await page.locator("#terms").check();
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/verify-email\?email=jamie%40example.com$/);
  expect(registration).toMatchObject({
    name: "Jamie Morgan",
    email: "jamie@example.com",
    termsVersion: "2026-01",
    privacyVersion: "2026-01",
  });
  await expect(
    page.getByRole("button", { name: "Continue with Google" }),
  ).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Continue with Apple" }),
  ).toBeHidden();
  expect(
    await page.evaluate(() =>
      JSON.stringify({ ...localStorage, ...sessionStorage }),
    ),
  ).not.toContain("sample-only-password");
  await page.goto("/register");
  await expect(page.locator("#password")).toHaveValue("");
});

test("login calls Better Auth and honors only a safe relative redirect", async ({
  page,
}) => {
  const callbackURLs: string[] = [];

  await page.route("**/api/auth/sign-in/email", async (route) => {
    callbackURLs.push(
      (route.request().postDataJSON() as { callbackURL?: string })
        .callbackURL ?? "",
    );
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        redirect: false,
        token: "opaque-session-token",
        user: {
          id: "better-auth-test-user",
          name: "Jamie Morgan",
          email: "jamie@example.com",
          emailVerified: true,
        },
      }),
    });
  });

  await page.goto("/login?next=//attacker.example");
  await page.getByLabel("Email address").fill("jamie@example.com");
  await page.locator("#password").fill("sample-only-password");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect.poll(() => callbackURLs).toEqual(["/events/new"]);

  await page.goto("/login?next=/profile");
  await page.getByLabel("Email address").fill("jamie@example.com");
  await page.locator("#password").fill("sample-only-password");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect.poll(() => callbackURLs).toEqual(["/events/new", "/profile"]);
});

test("protected host routes redirect anonymous visitors to login and preserve the path", async ({
  page,
}) => {
  await page.goto("/events/new?template=wedding");

  await expect(page).toHaveURL(
    /\/login\?next=%2Fevents%2Fnew%3Ftemplate%3Dwedding$/,
  );
});

test("protected routes reject an invalid Better Auth cookie", async ({
  page,
  context,
}) => {
  await context.addCookies([
    {
      name: "better-auth.session_token",
      value: "invalid-session-cookie",
      url: "http://localhost:3000",
    },
  ]);

  await page.goto("/profile");

  await expect(page).toHaveURL(/\/login\?next=%2Fprofile$/);
});
