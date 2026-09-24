import { expect, test } from "@playwright/test";

test.describe("Guest Upload UI & Mobile Ergonomics", () => {
  test.use({ viewport: { width: 375, height: 667 } }); // Mobile iPhone SE viewport

  test.beforeEach(async ({ page }) => {
    await page.route("**/api/v1/public/events/demo-wedding", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "event-demo-wedding-123",
          name: "Emma & Liam's Wedding",
          event_type: "Wedding",
          event_date: "2026-10-15",
          slug: "demo-wedding",
          gallery_enabled: true,
          candid_camera_enabled: true,
          event_mode: "social",
          media_items: [],
        }),
      });
    });

    await page.route(
      "**/api/v1/public/events/demo-wedding/sessions",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            guest_session_token: "mock-token-abc",
          }),
        });
      },
    );

    await page.route(
      "**/api/v1/public/events/demo-wedding/media",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      },
    );

    await page.route("**/api/v1/public/events/**/uploads", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            media_id: "media-mock-123",
            upload_url: "https://r2-mock.example.com/upload",
            expires_at: new Date(Date.now() + 3600000).toISOString(),
            required_headers: {},
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.route("https://r2-mock.example.com/**", async (route) => {
      await route.fulfill({ status: 200 });
    });

    await page.route(
      "**/api/v1/public/events/**/uploads/**/complete",
      async (route) => {
        await route.fulfill({ status: 200 });
      },
    );
  });

  test("renders mobile guest upload interface with dual capture actions", async ({
    page,
  }) => {
    await page.goto("/e/demo-wedding?is_test=true");

    // Verify test banner
    const testBanner = page.locator(".guest-event-card__test-banner");

    await expect(testBanner).toBeVisible();

    // Verify event title & trust line
    await expect(page.locator(".guest-event__title")).toBeVisible();
    await expect(page.locator(".guest-event__trust-line")).toBeVisible();

    // Verify dual capture buttons for mobile
    const cameraBtn = page.locator(".guest-upload__btn--camera");
    const libraryBtn = page.locator(".guest-upload__btn--library");

    await expect(cameraBtn).toBeVisible();
    await expect(libraryBtn).toBeVisible();

    // Verify mobile touch targets (height >= 44px)
    const cameraBox = await cameraBtn.boundingBox();
    const libraryBox = await libraryBtn.boundingBox();

    expect(cameraBox).not.toBeNull();
    expect(libraryBox).not.toBeNull();
    expect(cameraBox!.height).toBeGreaterThanOrEqual(44);
    expect(libraryBox!.height).toBeGreaterThanOrEqual(44);

    // Verify no horizontal overflow on mobile
    const hasHorizontalScroll = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
      );
    });

    expect(hasHorizontalScroll).toBe(false);

    // Verify tab switcher to gallery
    const galleryTab = page.getByRole("button", {
      name: /Shared Gallery|Album chung|Memories|Kỷ niệm/i,
    });

    if (await galleryTab.isVisible()) {
      await galleryTab.click();
      await expect(page.locator(".guest-gallery")).toBeVisible();
    }
  });

  test("handles file selection, staging, progress, and warm success state", async ({
    page,
  }) => {
    await page.goto("/e/demo-wedding?is_test=true");

    // 1x1 dummy PNG buffer
    const buffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    );

    // Set input files on hidden multiple file input
    const fileInput = page.locator('input[type="file"][multiple]');

    await fileInput.setInputFiles([
      {
        name: "celebration-moment.png",
        mimeType: "image/png",
        buffer,
      },
    ]);

    // Verify staging tray is visible with 1 thumbnail
    await expect(page.locator(".guest-upload__staging")).toBeVisible();
    await expect(page.locator(".guest-upload__thumb")).toHaveCount(1);

    // Verify submit button is visible and active
    const submitBtn = page.locator(".guest-upload__submit-btn");

    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Verify warm success celebration card appears
    const successCard = page.locator(".guest-upload__success-card");

    await expect(successCard).toBeVisible({ timeout: 10000 });

    // Verify confirmation heading & warm message
    await expect(page.locator(".guest-upload__success-title")).toBeVisible();
    await expect(page.locator(".guest-upload__success-desc")).toBeVisible();

    // Verify "Share more" action button
    const shareMoreBtn = page.getByRole("button", {
      name: /Share more|Chia sẻ thêm/i,
    });

    await expect(shareMoreBtn).toBeVisible();
  });

  test("captures and shares photo via Candid Camera", async ({ page }) => {
    // Provide a mocked video stream for headless browser
    await page.addInitScript(() => {
      if (!navigator.mediaDevices) {
        (navigator as unknown as { mediaDevices: unknown }).mediaDevices = {};
      }

      navigator.mediaDevices.getUserMedia = async () => {
        const canvas = document.createElement("canvas");

        canvas.width = 640;
        canvas.height = 480;

        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(0, 0, 640, 480);
        }

        return canvas.captureStream(30);
      };
    });

    await page.goto("/e/demo-wedding?is_test=true");

    const cameraBtn = page.locator(".guest-upload__btn--camera");

    await expect(cameraBtn).toBeVisible();

    // Tap Candid Camera
    await cameraBtn.click();

    // Verify modal appears
    const modal = page.locator(".candid-camera");

    await expect(modal).toBeVisible();

    // Viewfinder should stay focused on taking an unedited photo.
    await expect(modal.locator(".candid-camera__viewfinder")).toBeVisible();
    await expect(modal.locator(".candid-camera__effects-carousel")).toHaveCount(
      0,
    );

    // Verify event frame is visible by default as a text-free visual signature.
    const frameOverlay = modal.locator(".candid-camera__frame");

    await expect(frameOverlay).toBeVisible();
    await expect(modal.locator(".candid-camera__frame-ornament")).toBeVisible();
    await expect(modal.locator(".candid-camera__frame-title")).toHaveCount(0);

    // Verify event frame toggle works (toggle off and on)
    const frameToggle = modal.locator(".candid-camera__frame-toggle");

    await expect(frameToggle).toBeVisible();
    await frameToggle.click();
    await expect(frameOverlay).toHaveCount(0);
    await frameToggle.click();
    await expect(frameOverlay).toBeVisible();

    // Shutter feedback can be muted without leaving the viewfinder.
    const soundToggle = modal.locator(".candid-camera__sound-toggle");

    await expect(soundToggle).toHaveAttribute("aria-pressed", "true");
    await soundToggle.click();
    await expect(soundToggle).toHaveAttribute("aria-pressed", "false");

    // Press shutter button
    const shutterBtn = modal.locator(".candid-camera__shutter-btn");

    await expect(shutterBtn).toBeVisible();
    await shutterBtn.click();

    // Review screen should appear with captured photo preview
    await expect(modal.locator(".candid-camera__review")).toBeVisible({
      timeout: 5000,
    });
    await expect(modal.locator(".candid-camera__preview-img")).toBeVisible();

    // Verify review actions
    const shareBtn = modal.locator(
      ".candid-camera__review-actions button.candid-camera__btn--primary",
    );

    await expect(shareBtn).toBeVisible();

    // Tap Share
    await shareBtn.click();

    // Modal closes and photo enters upload pipeline
    await expect(modal).toBeHidden();

    // Verify upload success celebration appears
    const successCard = page.locator(".guest-upload__success-card");

    await expect(successCard).toBeVisible({ timeout: 10000 });
  });

  test("handles blocked camera with recovery fallback card", async ({
    page,
  }) => {
    // Mock getUserMedia rejecting with NotAllowedError
    await page.addInitScript(() => {
      if (!navigator.mediaDevices) {
        (navigator as unknown as { mediaDevices: unknown }).mediaDevices = {};
      }

      navigator.mediaDevices.getUserMedia = async () => {
        const error = new Error("Permission denied");

        error.name = "NotAllowedError";
        throw error;
      };
    });

    await page.goto("/e/demo-wedding?is_test=true");

    const cameraBtn = page.locator(".guest-upload__btn--camera");

    await cameraBtn.click();

    const modal = page.locator(".candid-camera");

    await expect(modal).toBeVisible();

    // Permission recovery card should be shown
    const permissionCard = modal.locator(".candid-camera__permission-card");

    await expect(permissionCard).toBeVisible({ timeout: 5000 });
    await expect(
      modal.locator(".candid-camera__permission-title"),
    ).toBeVisible();

    // Test close button
    const closeBtn = modal.getByRole("button", {
      name: /Close camera|Đóng camera/i,
    });

    await closeBtn.click();
    await expect(modal).toBeHidden();
  });

  test("allows removing and retrying failed uploads in the staging tray", async ({
    page,
  }) => {
    // Intercept upload requests to simulate failure
    await page.route("**/api/v1/public/events/**/uploads", async (route) => {
      await route.abort("failed");
    });

    await page.goto("/e/demo-wedding?is_test=true");

    const buffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    );

    const fileInput = page.locator('input[type="file"][multiple]');

    await fileInput.setInputFiles([
      {
        name: "failed-photo-1.png",
        mimeType: "image/png",
        buffer,
      },
      {
        name: "failed-photo-2.png",
        mimeType: "image/png",
        buffer,
      },
    ]);

    await expect(page.locator(".guest-upload__thumb")).toHaveCount(2);

    const submitBtn = page.locator(".guest-upload__submit-btn");

    await submitBtn.click();

    // Verify error state on thumbnails
    await expect(page.locator(".guest-upload__thumb--error")).toHaveCount(2, {
      timeout: 10000,
    });

    // Verify center retry button and remove button exist on thumbnail
    const firstThumb = page.locator(".guest-upload__thumb--error").first();

    await expect(
      firstThumb.locator(".guest-upload__retry-item-btn"),
    ).toBeVisible();
    await expect(firstThumb.locator(".guest-upload__remove-btn")).toBeVisible();

    // Verify error box is visible with both retry and remove failed buttons
    const errorBox = page.locator(".guest-upload__error-box");

    await expect(errorBox).toBeVisible();

    // Verify remove button on single thumbnail works
    const firstRemoveBtn = firstThumb.locator(".guest-upload__remove-btn");

    await firstRemoveBtn.click();

    // Now 1 item remains
    await expect(page.locator(".guest-upload__thumb")).toHaveCount(1);

    // Verify bulk remove failed button works on remaining item
    const removeFailedBtn = page.locator(".guest-upload__btn--danger-outline");

    await expect(removeFailedBtn).toBeVisible();
    await removeFailedBtn.click();

    // Tray becomes empty, returns to initial picker
    await expect(page.locator(".guest-upload__staging")).toHaveCount(0);
    await expect(page.locator(".guest-upload__picker-card")).toBeVisible();
  });
});
