import { devices, expect, test } from "@playwright/test";

test("mobile header opens from a physical tap and navigates to login", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");

  await page.goto("/");

  const trigger = page.locator(".mobile-nav__trigger");
  const triggerBox = await trigger.boundingBox();

  expect(triggerBox).not.toBeNull();
  await page.touchscreen.tap(
    triggerBox!.x + triggerBox!.width / 2,
    triggerBox!.y + triggerBox!.height / 2,
  );
  await expect(page.locator(".mobile-nav")).toHaveAttribute("open", "");

  const login = page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Log in", exact: true });
  const loginBox = await login.boundingBox();

  expect(loginBox).not.toBeNull();
  await page.touchscreen.tap(
    loginBox!.x + loginBox!.width / 2,
    loginBox!.y + loginBox!.height / 2,
  );
  await expect(page).toHaveURL(/\/login$/);
});

test("mobile header remains usable before JavaScript hydration", async ({
  browser,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");

  const context = await browser.newContext({
    ...devices["iPhone 13"],
    javaScriptEnabled: false,
  });
  const page = await context.newPage();

  await page.goto("http://localhost:3000/");

  const trigger = page.locator(".mobile-nav__trigger");
  const triggerBox = await trigger.boundingBox();

  expect(triggerBox).not.toBeNull();
  await page.touchscreen.tap(
    triggerBox!.x + triggerBox!.width / 2,
    triggerBox!.y + triggerBox!.height / 2,
  );
  await expect(page.locator(".mobile-nav")).toHaveAttribute("open", "");

  const login = page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Log in", exact: true });
  const loginBox = await login.boundingBox();

  expect(loginBox).not.toBeNull();
  await page.touchscreen.tap(
    loginBox!.x + loginBox!.width / 2,
    loginBox!.y + loginBox!.height / 2,
  );
  await expect(page).toHaveURL(/\/login$/);

  await context.close();
});
