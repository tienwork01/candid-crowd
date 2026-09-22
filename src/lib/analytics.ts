export type GuestAnalyticsEvent =
  | "guest_event_opened"
  | "guest_upload_cta_clicked"
  | "guest_files_selected"
  | "guest_upload_started"
  | "guest_upload_completed"
  | "guest_upload_failed"
  | "guest_upload_retried"
  | "guest_gallery_opened"
  | "guest_share_more_clicked"
  | "guest_candid_camera_opened"
  | "guest_camera_opened"
  | "guest_camera_closed"
  | "guest_camera_permission_granted"
  | "guest_camera_permission_denied"
  | "guest_camera_effect_changed"
  | "guest_camera_effect_selected"
  | "guest_camera_frame_toggled"
  | "guest_camera_frame_selected"
  | "guest_camera_flipped"
  | "guest_camera_shutter_pressed"
  | "guest_camera_timer_started"
  | "guest_camera_sound_toggled"
  | "guest_camera_photo_captured"
  | "guest_camera_retake"
  | "guest_camera_photo_retaken"
  | "guest_camera_add_more"
  | "guest_camera_photo_kept"
  | "guest_camera_shared"
  | "guest_camera_upload_started"
  | "guest_camera_upload_completed"
  | "guest_camera_upload_failed";

export type AnalyticsPayload = Record<
  string,
  string | number | boolean | undefined | null
>;

/**
 * Dispatches lightweight, client-safe analytics events without tracking personally identifiable info.
 */
export function trackEvent(
  event: GuestAnalyticsEvent,
  payload?: AnalyticsPayload,
) {
  if (typeof window === "undefined") return;

  if (process.env.NODE_ENV === "development") {
    console.debug(`[Analytics] ${event}`, payload);
  }

  try {
    window.dispatchEvent(
      new CustomEvent("candidcrowd:analytics", {
        detail: { event, payload, timestamp: Date.now() },
      }),
    );
  } catch {
    // Graceful fallback if CustomEvent is not supported
  }
}
