import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("homepage hierarchy, accessibility and responsive widths", async ({
  page,
}) => {
  const errors: string[] = [];

  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "already take.",
  );
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page
      .locator("main > section")
      .evaluateAll((sections) =>
        sections.map((section) => section.getAttribute("aria-labelledby")),
      ),
  ).toEqual([
    "hero-title",
    "how-title",
    "problem-title",
    "demo-title",
    "participation-title",
    "lifecycle-title",
    "privacy-title",
    "events-title",
    "pricing-title",
    "final-title",
  ]);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);

  for (const width of [375, 390, 430, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `overflow at ${width}px`,
    ).toBe(true);
  }

  await page.setViewportSize({ width: 812, height: 375 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("hero illustrates a memory joining the gallery and can replay", async ({
  page,
}) => {
  await page.goto("/");

  const hero = page.locator(".hero-scene");

  await hero.getByRole("button", { name: "Share a memory" }).click();
  await expect(hero.getByRole("status")).toContainText(
    "A new memory, together.",
    { timeout: 12000 },
  );

  if ((await hero.getAttribute("data-renderer")) === "webgl") {
    await expect(hero.locator(".hero-scene__canvas")).toHaveAttribute(
      "data-progress",
      "1",
    );
  } else {
    await expect(hero.locator(".hero-scene__tile--new img")).toBeVisible();
  }

  await hero.getByRole("button", { name: "Try again" }).click();
  await expect(
    hero.getByRole("button", { name: "Share a memory" }),
  ).toBeEnabled();
});

test("guest simulation selects, uploads, retries, views and resets without requests", async ({
  page,
}) => {
  const writes: string[] = [];

  page.on("request", (request) => {
    if (
      ["POST", "PUT", "PATCH"].includes(request.method()) &&
      !request.url().includes("google-analytics.com")
    )
      writes.push(request.url());
  });
  await page.goto("/#demo");

  const demo = page.locator("#demo");

  await demo.getByRole("button", { name: "Try without scanning" }).click();
  await demo.getByRole("button", { name: "Use sample photos" }).click();
  await expect(demo.locator(".demo-gallery__photo")).toHaveCount(3);
  await demo.getByRole("button", { name: "Upload 2 photos" }).click();
  await expect(page.getByRole("progressbar")).toBeVisible();
  await demo.getByRole("button", { name: "Simulate an interruption" }).click();
  await expect(demo.getByRole("status")).toContainText("interrupted");
  await demo.getByRole("button", { name: "Retry upload" }).click();
  await expect(demo.getByRole("status")).toContainText("2 photos added", {
    timeout: 12000,
  });
  await expect(demo.locator(".demo-gallery__photo")).toHaveCount(5);
  await demo.locator(".demo-gallery__photo").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await demo.getByRole("button", { name: "Reset demo" }).click();
  await expect(demo.locator(".demo-gallery__photo")).toHaveCount(3);
  await expect(demo.getByRole("button", { name: "Open event" })).toBeVisible();
  expect(writes).toEqual([]);
});

test("real local photo validation and upload preview", async ({ page }) => {
  await page.goto("/?demo=open#demo");

  const demo = page.locator("#demo");

  await expect(
    demo.getByRole("button", { name: "Add photos", exact: true }),
  ).toBeVisible();
  await page.locator("#demo-files").setInputFiles({
    name: "bad.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("not a decodable image"),
  });
  await expect(demo.getByRole("alert")).toContainText("couldn’t be added");
  await page.locator("#demo-files").setInputFiles("public/images/table.jpg");
  await expect(
    demo.getByRole("button", { name: "Upload 1 photo", exact: true }),
  ).toBeEnabled();
  await demo
    .getByRole("button", { name: "Upload 1 photo", exact: true })
    .click();
  await expect(demo.getByRole("status")).toContainText("1 photo added", {
    timeout: 12000,
  });
  await expect(demo.locator(".demo-gallery__photo")).toHaveCount(4);
});

test("reset during upload cancels completion", async ({ page }) => {
  await page.goto("/?demo=open#demo");

  const demo = page.locator("#demo");

  await demo.getByRole("button", { name: "Use sample photos" }).click();
  await demo.getByRole("button", { name: "Upload 2 photos" }).click();
  await demo.getByRole("button", { name: "Reset demo" }).click();
  await expect(demo.getByRole("button", { name: "Open event" })).toBeVisible();
  await page.waitForTimeout(2500);
  await expect(demo.locator(".demo-gallery__photo")).toHaveCount(3);
});

test("navigation, preview dialogs and event types work with keyboard", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Pricing" })
    .click();
  await expect(page).toHaveURL(/#pricing$/);
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Birthdays", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Birthdays", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#event-description")).toContainText(
    "Another year.",
  );

  const privacy = page.locator(".site-footer a[href$='/privacy']").first();

  await expect(privacy).toBeVisible();

  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "Log in", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { name: /Welcome back/i }),
  ).toBeVisible();
});

test("marketing navigation returns from legal pages to homepage sections", async ({
  page,
  isMobile,
}) => {
  for (const route of ["/terms", "/privacy"]) {
    await page.goto(route);

    if (isMobile) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await page
        .getByRole("navigation", { name: "Mobile navigation" })
        .getByRole("link", { name: "Pricing" })
        .click();
    } else {
      await page
        .getByRole("navigation", { name: "Main navigation" })
        .getByRole("link", { name: "Pricing" })
        .click();
    }

    await expect(page).toHaveURL(/(?:\/en)?\/?#pricing$/);
    await expect(page.locator("#pricing")).toBeInViewport();
  }
});

test("homepage anchors leave a consistent header clearance", async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/#demo");

    await expect
      .poll(
        async () => {
          return page.evaluate(() => {
            const header = document.querySelector(".site-header")!;
            const demo = document.querySelector("#demo")!;

            return Math.abs(
              demo.getBoundingClientRect().top -
                header.getBoundingClientRect().bottom,
            );
          });
        },
        { timeout: 10000 },
      )
      .toBeLessThanOrEqual(4);
  }
});

test("early access card renders with CTA", async ({ page }) => {
  await page.goto("/#pricing");

  const card = page.locator(".early-access__card");

  await expect(card).toBeVisible();

  const cta = card.locator("a.button");

  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute("href", "/register?next=/events/new");
});

test("reduced motion and text zoom preserve usability", async ({ page }) => {
  const errors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");

  const cta = page
    .locator(".hero__copy")
    .getByRole("link", { name: "Create your event free" });
  const bounds = await cta.boundingBox();

  expect(bounds && bounds.y + bounds.height < 812).toBeTruthy();
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
