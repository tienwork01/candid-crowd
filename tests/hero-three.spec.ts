import { expect, test } from "@playwright/test";

test("WebGL hero renders, responds, stops offscreen, and falls back on context loss", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 });
    Object.defineProperty(navigator, "deviceMemory", { get: () => 8 });
  });
  await page.goto("/");

  const hero = page.locator(".hero-scene");

  await hero.scrollIntoViewIfNeeded();
  await expect(hero).toHaveAttribute("data-renderer", "webgl", {
    timeout: 20000,
  });

  const canvas = hero.locator("canvas");

  await expect(canvas).toBeVisible();

  const layer = hero.locator(".hero-scene__canvas");

  await expect(layer).toHaveAttribute("data-entrance", "complete");
  await hero.getByRole("button", { name: "Rotate view right" }).click();
  await expect(layer).toHaveAttribute("data-angle", "0.4");
  await expect(
    hero.getByRole("button", { name: "Rotate view right" }),
  ).toBeDisabled();
  await hero.getByRole("button", { name: "Rotate view left" }).focus();
  await page.keyboard.press("Enter");
  await expect(layer).toHaveAttribute("data-angle", "0");
  await page.mouse.move(0, 0);
  await page.waitForTimeout(1200);

  const idleFrames = await layer.getAttribute("data-frames");

  await page.waitForTimeout(300);
  expect(await layer.getAttribute("data-frames")).toBe(idleFrames);

  await hero.getByRole("button", { name: "Share a memory" }).click();
  await expect(layer).toHaveAttribute("data-progress", "1", { timeout: 12000 });
  await page.locator("#pricing").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  const frames = await layer.getAttribute("data-frames");

  await page.waitForTimeout(350);
  expect(await layer.getAttribute("data-frames")).toBe(frames);
  await hero.scrollIntoViewIfNeeded();
  await canvas.evaluate((element) => {
    (element as HTMLCanvasElement)
      .getContext("webgl2")
      ?.getExtension("WEBGL_lose_context")
      ?.loseContext();
  });
  await expect(hero).toHaveAttribute("data-renderer", "fallback");
  await expect(hero.getByRole("group", { name: "Gallery view" })).toHaveCount(
    0,
  );
  await expect(hero.locator(".hero-scene__tile--new img")).toBeVisible();
  await expect(hero.getByRole("button", { name: "Try again" })).toBeEnabled();
});

test("reduced motion never creates a WebGL canvas", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForTimeout(1200);
  await expect(page.locator(".hero-scene")).toHaveAttribute(
    "data-renderer",
    "fallback",
  );
  await expect(page.locator(".hero-scene__canvas canvas")).toHaveCount(0);
});
