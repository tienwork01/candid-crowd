import { chromium, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const output = "test-results/hero-three";

await mkdir(output, { recursive: true });

const browser = await chromium.launch();

try {
  for (const width of [375, 390, 430, 768, 1024, 1440, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });

    await page.addInitScript(() => {
      Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 });
      Object.defineProperty(navigator, "deviceMemory", { get: () => 8 });
    });
    await page.goto(process.env.AUDIT_URL || "http://localhost:3000");

    const hero = page.locator(".hero-scene");

    await hero.scrollIntoViewIfNeeded();
    await expect(hero).toHaveAttribute("data-renderer", "webgl");

    const canvas = hero.locator("canvas");

    await hero.screenshot({ path: `${output}/entrance-${width}.png` });
    await expect(hero.locator(".hero-scene__canvas")).toHaveAttribute(
      "data-entrance",
      "complete",
    );

    const before = await canvas.screenshot();
    const colors = await page.evaluate(async (base64) => {
      const image = new Image();

      image.src = `data:image/png;base64,${base64}`;
      await image.decode();

      const sample = document.createElement("canvas");

      sample.width = image.width;
      sample.height = image.height;

      const ctx = sample.getContext("2d");

      ctx.drawImage(image, 0, 0);

      const { data } = ctx.getImageData(0, 0, sample.width, sample.height);
      const distinct = new Set();

      for (let i = 0; i < data.length; i += 16) {
        distinct.add(`${data[i] >> 4},${data[i + 1] >> 4},${data[i + 2] >> 4}`);
      }

      return distinct.size;
    }, before.toString("base64"));

    expect(colors).toBeGreaterThan(100);

    if (width >= 1024) {
      const bounds = await canvas.boundingBox();

      await page.mouse.move(
        bounds.x + bounds.width * 0.85,
        bounds.y + bounds.height * 0.3,
      );
      await page.waitForTimeout(600);
      expect(before.equals(await canvas.screenshot())).toBe(false);
      await page.mouse.move(0, 0);
      await page.waitForTimeout(800);
    }

    await hero.screenshot({ path: `${output}/scene-${width}.png` });
    await hero.getByRole("button", { name: "Rotate view right" }).click();
    await page.waitForTimeout(800);
    expect(before.equals(await canvas.screenshot())).toBe(false);
    await hero.screenshot({ path: `${output}/rotated-${width}.png` });
    await hero.getByRole("button", { name: "Rotate view left" }).click();
    await hero.getByRole("button", { name: "Share a memory" }).click();
    await page.waitForTimeout(1100);
    await hero.screenshot({ path: `${output}/in-flight-${width}.png` });
    await expect(hero.getByRole("button", { name: "Try again" })).toBeEnabled();
    await page.waitForTimeout(700);
    expect(before.equals(await canvas.screenshot())).toBe(false);
    await hero.screenshot({ path: `${output}/shared-${width}.png` });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `${output}/page-${width}.png` });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
    console.log(
      `${width}px: canvas ${colors} colors, share changes pixels, no overflow`,
    );
    await page.close();
  }
} finally {
  await browser.close();
}
