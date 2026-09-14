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
  const layer = hero.locator(".hero-three-canvas");
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
  await expect(hero.locator(".scene-new img")).toBeVisible();
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
  await expect(page.locator(".hero-three-canvas canvas")).toHaveCount(0);
});
