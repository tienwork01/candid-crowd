import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Subtle & Refined Scrollbar System", () => {
  test("global document and elements use thin, refined scrollbar with brand tokens", async ({
    page,
  }) => {
    test.setTimeout(30000);
    await page.goto("/en");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();

    // Verify html and body computed styles
    const globalStyles = await page.evaluate(() => {
      const htmlStyle = window.getComputedStyle(document.documentElement);
      const bodyStyle = window.getComputedStyle(document.body);

      return {
        htmlScrollbarWidth: htmlStyle.scrollbarWidth,
        htmlScrollBehavior: htmlStyle.scrollBehavior,
        bodyScrollbarWidth: bodyStyle.scrollbarWidth,
        scrollbarTrackVar: htmlStyle
          .getPropertyValue("--scrollbar-track")
          .trim(),
        scrollbarThumbVar: htmlStyle
          .getPropertyValue("--scrollbar-thumb")
          .trim(),
      };
    });

    expect(globalStyles.htmlScrollbarWidth).toBe("thin");
    expect(globalStyles.htmlScrollBehavior).toBe("smooth");
    expect(globalStyles.bodyScrollbarWidth).toBe("thin");
    expect(globalStyles.scrollbarTrackVar).toBe("transparent");
    expect(globalStyles.scrollbarThumbVar).toContain("color-mix");

    // Accessibility check
    const axeResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(axeResults.violations).toEqual([]);
  });

  test("legal page TOC list uses refined thin scrollbar with tokens on desktop", async ({
    page,
    isMobile,
  }) => {
    test.setTimeout(30000);

    if (isMobile) {
      test.skip(
        true,
        "Table of contents sidebar is desktop-only (min-width: 1024px)",
      );

      return;
    }

    await page.goto("/en/terms");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toBeVisible();

    const tocList = page.locator(".legal-toc__list");

    await expect(tocList).toBeVisible();

    const tocStyles = await tocList.evaluate((el) => {
      const cs = window.getComputedStyle(el);

      return {
        scrollbarWidth: cs.scrollbarWidth,
        overflowY: cs.overflowY,
      };
    });

    expect(tocStyles.scrollbarWidth).toBe("thin");
    expect(tocStyles.overflowY).toBe("auto");
  });
});
