import { expect, test } from "@playwright/test";
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
      token = "test_cursor_session_" + Date.now();

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

test.describe("Button Gap & Interactive Cursor Pointer UX", () => {
  test("button icon and text have refined proximity gap without disconnected margins", async ({
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

    const submitButton = page.locator(".create-event-card__button");

    await expect(submitButton).toBeVisible();

    // Evaluate computed gap and icon styles
    const buttonData = await submitButton.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      const icon = el.querySelector("svg");
      const iconCs = icon ? window.getComputedStyle(icon) : null;

      return {
        gap: cs.gap,
        cursor: cs.cursor,
        iconMarginLeft: iconCs ? iconCs.marginLeft : null,
      };
    });

    expect(buttonData.cursor).toBe("pointer");
    // Gap should be 6px (gap-1.5) rather than old wide 24px/14px
    expect(buttonData.gap).toBe("6px");
    // Redundant ml-1.5 margin has been removed (0px)
    expect(buttonData.iconMarginLeft).toBe("0px");
  });

  test("user account dropdown menu items and subtriggers all use cursor: pointer", async ({
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

    const userTrigger = page
      .locator("[data-slot='dropdown-menu-trigger']")
      .first();

    if (await userTrigger.isVisible()) {
      await userTrigger.click();

      const menuContent = page.locator("[data-slot='dropdown-menu-content']");

      await expect(menuContent).toBeVisible();

      const items = page.locator("[data-slot='dropdown-menu-item']");
      const count = await items.count();

      expect(count).toBeGreaterThan(0);

      // Verify each item has cursor: pointer
      for (let i = 0; i < count; i++) {
        const itemCursor = await items.nth(i).evaluate((el) => {
          return window.getComputedStyle(el).cursor;
        });

        expect(itemCursor).toBe("pointer");
      }

      // Verify subtrigger has cursor: pointer
      const subTrigger = page.locator(
        "[data-slot='dropdown-menu-sub-trigger']",
      );

      if (await subTrigger.isVisible()) {
        const subCursor = await subTrigger.evaluate((el) => {
          return window.getComputedStyle(el).cursor;
        });

        expect(subCursor).toBe("pointer");
      }
    }
  });

  test("hero button and inline actions have refined gap and cursor pointer", async ({
    page,
  }) => {
    test.setTimeout(30000);
    await page.goto("/en");

    const heroCta = page.locator(".hero__actions .button");

    await expect(heroCta).toBeVisible();

    const ctaStyles = await heroCta.evaluate((el) => {
      const cs = window.getComputedStyle(el);

      return {
        gap: cs.gap,
        cursor: cs.cursor,
      };
    });

    // Verify .button gap was reduced from 24px to 6px
    expect(ctaStyles.gap).toBe("6px");
    expect(ctaStyles.cursor).toBe("pointer");

    const inlineAction = page.locator(".hero__actions .inline-action");

    await expect(inlineAction).toBeVisible();

    const inlineStyles = await inlineAction.evaluate((el) => {
      const cs = window.getComputedStyle(el);

      return {
        gap: cs.gap,
        cursor: cs.cursor,
      };
    });

    // Verify .inline-action gap was reduced from 10px to 6px
    expect(inlineStyles.gap).toBe("6px");
    expect(inlineStyles.cursor).toBe("pointer");
  });
});
