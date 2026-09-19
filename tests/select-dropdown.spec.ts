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
      token = "test_select_session_" + Date.now();

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

test.describe("Event Type Select Dropdown UX & Positioning", () => {
  test("dropdown opens cleanly below trigger without overlapping, with proper accessibility and interactions", async ({
    page,
    context,
  }) => {
    test.setTimeout(30000);

    const signedCookie = await getSignedSessionCookie();

    await context.addCookies([
      {
        name: "better-auth.session_token",
        value: signedCookie,
        url: "http://localhost:3000",
      },
    ]);

    await page.goto("/events/new");
    await expect(page).toHaveURL(/\/events\/new/);

    const trigger = page.locator("#event-type");

    await expect(trigger).toBeVisible();

    // 1. Initial trigger state
    const triggerBoxBefore = await trigger.boundingBox();

    expect(triggerBoxBefore).not.toBeNull();

    // 2. Click trigger to open dropdown
    await trigger.click();

    const popup = page.locator("[data-slot='select-content']");

    await expect(popup).toBeVisible();

    const triggerBox = (await trigger.boundingBox())!;
    const popupBox = (await popup.boundingBox())!;

    // 3. Verify positioning: popup must NOT overlap the trigger
    const overlaps = !(
      popupBox.y + popupBox.height <= triggerBox.y ||
      popupBox.y >= triggerBox.y + triggerBox.height
    );

    expect(overlaps).toBe(false);

    // 4. Verify popup alignment: popup left edge should align with trigger left edge (within 2px tolerance)
    expect(Math.abs(popupBox.x - triggerBox.x)).toBeLessThanOrEqual(2);

    // 5. Check accessible items and selection
    const options = page.locator("[data-slot='select-item']");
    const count = await options.count();

    expect(count).toBeGreaterThan(5);

    // Check accessibility with dropdown open
    const axeResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(axeResults.violations).toEqual([]);

    // 6. Select "Birthday"
    const birthdayOption = page.getByRole("option", { name: "Birthday" });

    await expect(birthdayOption).toBeVisible();
    await birthdayOption.click();

    // 7. Popup closes after selection
    await expect(popup).not.toBeVisible();

    // 8. Trigger displays selected value
    await expect(trigger).toContainText("Birthday");
  });

  test("input and date focus states use elegant brand primary glow without harsh 3px black outline", async ({
    page,
    context,
  }) => {
    test.setTimeout(30000);

    const signedCookie = await getSignedSessionCookie();

    await context.addCookies([
      {
        name: "better-auth.session_token",
        value: signedCookie,
        url: "http://localhost:3000",
      },
    ]);

    await page.goto("/events/new");
    await expect(page).toHaveURL(/\/events\/new/);

    const nameInput = page.locator("#event-name");

    await nameInput.focus();

    const nameStyle = await nameInput.evaluate((el) => {
      const cs = window.getComputedStyle(el);

      return {
        outlineStyle: cs.outlineStyle,
        outlineWidth: cs.outlineWidth,
        borderColor: cs.borderColor,
        boxShadow: cs.boxShadow,
      };
    });

    // Verify border is primary moss green (#46533a -> rgb(70, 83, 58))
    expect(nameStyle.borderColor).toContain("70, 83, 58");
    // Verify no solid black ring
    expect(nameStyle.boxShadow).not.toContain("rgb(0, 0, 0)");

    const dateInput = page.locator("#event-date");

    await dateInput.click();
    await page.waitForTimeout(200);

    const dateStyle = await dateInput.evaluate((el) => {
      const cs = window.getComputedStyle(el);

      return {
        outlineStyle: cs.outlineStyle,
        outlineWidth: cs.outlineWidth,
        borderColor: cs.borderColor,
        boxShadow: cs.boxShadow,
      };
    });

    expect(dateStyle.borderColor).toContain("70, 83, 58");
    expect(dateStyle.boxShadow).not.toContain("rgb(0, 0, 0)");
  });
});
