import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { makeSignature } from "better-auth/crypto";
import { Pool } from "pg";

async function getSignedSessionCookie(): Promise<string> {
  const pool = new Pool({
    connectionString:
      process.env.BETTER_AUTH_DATABASE_URL ||
      "postgresql://neondb_owner:npg_3rKAwkci0lOe@ep-square-feather-b5asm686-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  const secret =
    process.env.BETTER_AUTH_SECRET || "replace-with-a-long-random-secret";

  try {
    const res = await pool.query(
      'SELECT token FROM "session" WHERE "expiresAt" > NOW() ORDER BY "expiresAt" DESC LIMIT 1',
    );
    let token = res.rows[0]?.token;

    if (!token) {
      const userRes = await pool.query('SELECT id FROM "user" LIMIT 1');
      const userId = userRes.rows[0]?.id;

      if (!userId) throw new Error("No user found in DB");
      token = "test_e2e_session_" + Date.now();

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await pool.query(
        'INSERT INTO "session" (id, "userId", token, "expiresAt", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
        ["session_" + Date.now(), userId, token, expiresAt],
      );
    }

    const sig = await makeSignature(token, secret);

    return `${token}.${sig}`;
  } finally {
    await pool.end();
  }
}

test.describe("CandidCrowd Event Creation and Ready Flow", () => {
  test("complete event creation, ready screen, guest preview test mode, and event overview", async ({
    page,
    context,
  }) => {
    test.setTimeout(60000);

    let signedCookie = "";

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        signedCookie = await getSignedSessionCookie();
        break;
      } catch (err) {
        if (attempt === 3) throw err;
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    await context.addCookies([
      {
        name: "better-auth.session_token",
        value: signedCookie,
        url: "http://localhost:3000",
      },
    ]);

    const pageErrors: string[] = [];

    page.on("pageerror", (error) => pageErrors.push(error.message));

    // 1. Visit /events/new
    await page.goto("/events/new");
    await expect(page).toHaveURL(/\/events\/new/);

    // Verify main page title and structure
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Create your event",
    );

    // Accessibility check on /events/new
    const createAxe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(createAxe.violations).toEqual([]);

    // 2. Fill in the event creation form
    const eventNameInput = page.getByLabel("Event name");

    await eventNameInput.fill("Chloe & Liam's Wedding");

    // Select Event Type
    const typeSelect = page.getByLabel("Event type");

    await typeSelect.click();
    await page.getByRole("option", { name: "Wedding" }).click();

    // Toggle "I don't know the date yet"
    const dateUnknownCheckbox = page.getByRole("checkbox", {
      name: "I don't know the date yet",
    });

    await dateUnknownCheckbox.click();

    // Verify date input is disabled
    const dateInput = page.getByLabel("Event date");

    await expect(dateInput).toBeDisabled();

    // 3. Submit the form
    const createButton = page.getByRole("button", { name: "Create event" });

    await createButton.click();

    // Wait for redirect to /events/[id]/ready
    await page.waitForURL(/\/events\/[a-zA-Z0-9-]+\/ready/);
    expect(page.url()).toMatch(/\/events\/[a-zA-Z0-9-]+\/ready/);

    const eventIdMatch = page.url().match(/\/events\/([a-zA-Z0-9-]+)\/ready/);
    const createdEventId = eventIdMatch ? eventIdMatch[1] : "";

    // 4. Verify Event Ready Screen
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Your event is ready",
    );
    await expect(page.locator(".event-ready-card__name")).toHaveText(
      "Chloe & Liam's Wedding",
    );

    // Verify QR code is rendered
    const qrElement = page.locator(
      ".event-ready-card__qr img, .event-ready-card__qr canvas",
    );

    await expect(qrElement).toBeVisible();

    // Verify guest short link is displayed
    const guestLink = page.locator(
      ".event-ready-card__guest-link span, .event-ready-card__link code",
    );

    await expect(guestLink).toBeVisible();

    const guestUrlText = await guestLink.textContent();

    expect(guestUrlText).toContain("/e/");

    // Verify copy link button and download QR button
    const copyLinkBtn = page
      .locator(".event-ready-card__qr-actions")
      .getByRole("button", { name: "Copy link" });

    await expect(copyLinkBtn).toBeVisible();

    const downloadQrBtn = page.getByRole("button", { name: "Download QR" });

    await expect(downloadQrBtn).toBeVisible();

    // 5. Interact with Expected Guest Count
    const guestCountTrigger = page.getByRole("button", {
      name: /Add expected guest count|How many guests are you expecting/i,
    });

    if (await guestCountTrigger.isVisible()) {
      await guestCountTrigger.click();
    }

    const guestCountInput = page.getByPlaceholder("e.g. 120");

    await expect(guestCountInput).toBeVisible();
    await guestCountInput.fill("120");

    const saveCountBtn = page.getByRole("button", { name: "Save estimate" });

    await saveCountBtn.click();

    // 6. Test "Preview as guest"
    const previewBtn = page.getByRole("link", { name: /Preview as guest/i });

    await expect(previewBtn).toBeVisible();

    const previewHref = await previewBtn.getAttribute("href");

    expect(previewHref).toContain("is_test=true");

    // 7. Navigate directly to the Guest Preview page
    await page.goto(previewHref!);
    await expect(page).toHaveURL(/.*is_test=true/);

    // Verify Guest page test mode banner is displayed
    const testBanner = page.locator(".guest-event-card__test-banner");

    await expect(testBanner).toBeVisible();
    await expect(testBanner).toContainText("Preview Mode");

    // Verify guest capture UI elements
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Chloe & Liam's Wedding",
    );
    await expect(
      page.getByRole("button", { name: "Select from camera roll" }),
    ).toBeVisible();

    // 8. Test "Remove test uploads" button
    const removeTestBtn = page.getByRole("button", {
      name: "Remove test uploads",
    });

    await expect(removeTestBtn).toBeVisible();
    await removeTestBtn.click();

    // 9. Navigate to Event Overview (/events/[id])
    await page.goto(`/events/${createdEventId}`);
    await expect(page).toHaveURL(new RegExp(`/events/${createdEventId}`));

    // Verify Overview board
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Chloe & Liam's Wedding",
    );
    await expect(page.getByRole("tab", { name: "Before event" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "During event" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "After event" })).toBeVisible();

    // Verify Expected Guest count is reflected
    await expect(page.locator(".event-overview-board")).toContainText("120");

    // Check page errors
    expect(pageErrors).toEqual([]);
  });
});
