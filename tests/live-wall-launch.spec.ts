import { expect, test } from "@playwright/test";

test("the Live Wall launch screen stops waiting and offers recovery", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/live-wall/launching");

  await expect(
    page.getByRole("heading", { name: "Preparing Live Wall" }),
  ).toBeVisible();

  // Leave headroom for client hydration to register the watchdog on slower
  // mobile emulation before advancing past its 30-second deadline.
  await page.clock.fastForward(31_000);

  await expect(
    page.getByRole("heading", { name: "Live Wall could not start" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Close" })).toBeVisible();
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
});

test("an explicit launch error is shown without a loading flash", async ({
  page,
}) => {
  await page.goto("/live-wall/launching?error=request_failed");

  await expect(
    page.getByRole("heading", { name: "Live Wall could not start" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Close" })).toBeVisible();
});
