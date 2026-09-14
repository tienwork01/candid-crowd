import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const output = "test-results/visual";

await mkdir(output, { recursive: true });

const browser = await chromium.launch();

try {
  for (const width of [375, 390, 430, 768, 1024, 1440, 1920]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });

    await page.goto(process.env.AUDIT_URL || "http://localhost:3000");
    await page.evaluate(() => document.fonts.ready);

    for (const section of await page.locator("main > section").all()) {
      await section.scrollIntoViewIfNeeded();
      await section
        .locator("img")
        .evaluateAll((images) =>
          Promise.all(images.map((image) => image.decode().catch(() => {}))),
        );
    }

    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `${output}/hero-${width}.png` });
    await page.screenshot({
      path: `${output}/page-${width}.png`,
      fullPage: true,
    });
    if ([375, 1440].includes(width))
      await page
        .locator("#demo")
        .screenshot({ path: `${output}/demo-${width}.png` });
    console.log(
      `${width}px: overflow=${await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)}`,
    );
    await page.close();
  }
} finally {
  await browser.close();
}
