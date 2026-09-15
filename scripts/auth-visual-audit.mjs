import { chromium, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const output = "test-results/auth-visual";

await mkdir(output, { recursive: true });

const browser = await chromium.launch();

try {
  for (const width of [375, 390, 430, 768, 1024, 1440, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });

    for (const route of ["login", "register"]) {
      await page.goto(
        `${process.env.AUDIT_URL || "http://localhost:3000"}/${route}`,
      );
      await page.evaluate(() => document.fonts.ready);
      await page
        .locator("img")
        .evaluateAll((images) =>
          Promise.all(images.map((image) => image.decode())),
        );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      ).toBe(false);
      await page.screenshot({
        path: `${output}/${route}-${width}.png`,
        fullPage: true,
      });
      console.log(`${route} ${width}px: images loaded, no horizontal overflow`);
    }

    await page.close();
  }
} finally {
  await browser.close();
}
