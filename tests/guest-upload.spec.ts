import { expect, test } from "@playwright/test";

test.describe("Guest Upload UI & Mobile Ergonomics", () => {
  test.use({ viewport: { width: 375, height: 667 } }); // Mobile iPhone SE viewport

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

    // Viewfinder and effects carousel should be visible
    await expect(modal.locator(".candid-camera__viewfinder")).toBeVisible();
    await expect(
      modal.locator(".candid-camera__effects-carousel"),
    ).toBeVisible();

    // Verify effects pills (at least 6 looks)
    const effectPills = modal.locator(".candid-camera__effect-pill");

    await expect(effectPills).toHaveCount(6);

    // Switch to Film effect
    await effectPills.nth(1).click();
    await expect(effectPills.nth(1)).toHaveClass(
      /candid-camera__effect-pill--active/,
    );

    // Verify event frame is visible by default with photobooth styling
    const frameOverlay = modal.locator(".candid-camera__frame");

    await expect(frameOverlay).toBeVisible();
    await expect(modal.locator(".candid-camera__frame-badge")).toBeVisible();
    await expect(modal.locator(".candid-camera__frame-title")).toBeVisible();

    // Verify event frame toggle works (toggle off and on)
    const frameToggle = modal.locator(".candid-camera__frame-toggle");

    await expect(frameToggle).toBeVisible();
    await frameToggle.click();
    await expect(frameOverlay).toHaveCount(0);
    await frameToggle.click();
    await expect(frameOverlay).toBeVisible();

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
});
