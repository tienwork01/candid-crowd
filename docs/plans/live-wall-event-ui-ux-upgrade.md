# Live Wall — Event Presentation UI/UX Upgrade Plan

**Status:** Proposed
**Scope:** Public player at `/live-wall/[token]` and the host controls that affect it
**Product goal:** Make Live Wall feel like a polished shared-event experience on a TV or projector—not a web gallery projected at a larger size.

## 1. Outcome

The screen must make people want to contribute, while keeping the host in control:

```text
Guest sees a beautiful invitation to share
→ scans an easily readable QR code
→ uploads a memory
→ their photo arrives naturally on the shared screen
→ the host can intervene without touching the projector
```

The visual direction is **cinematic editorial photography**: deep ink surroundings, warm ivory typography, one restrained champagne accent, generous negative space, and media as the primary subject. It must support weddings first without hard-coding wedding-only domain concepts.

## 2. Current gaps

| Area                | Current behaviour                                                     | Event-ready target                                                                      |
| ------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| First impression    | Text-only empty state can feel unfinished                             | Branded welcome/QR scene that explains the value in seconds                             |
| Event identity      | Generic `Live Venue Wall` chrome                                      | Event name, optional date/tagline and theme-aware presentation                          |
| Media composition   | `object-fit: contain` leaves dead space around portrait media         | Portrait media gets a blurred/dimmed same-image canvas; landscape uses the stage fully  |
| Motion              | Single entry animation only                                           | Calm media handoff, CTA transition and resilient loading states                         |
| QR conversion       | QR appears only on CTA/empty state, with no guaranteed visual reserve | Large, high-contrast QR with a stable reserved frame and scan-safe quiet zone           |
| Operator experience | Public player has minimal visual state feedback                       | Operator controls remain in dashboard; player has unobtrusive live/reconnect indication |
| Theme cohesion      | Guest customization does not consistently reach the wall              | Presentation tokens inherit the selected event theme within safe contrast limits        |

## 3. Design principles and guardrails

1. **Media wins.** No persistent control bars, cards, dashboards, or decorative UI may compete with a memory.
2. **Readable from the back of the room.** Essential QR, heading, and status text use high contrast and projector-safe sizes.
3. **One accent, not a wedding template.** Use warm champagne/ivory by default; event theme can influence accents, never reduce contrast or recolor guest media.
4. **Motion communicates arrival.** Use opacity and transform only; 1–2 visual elements animate at once; honour `prefers-reduced-motion`.
5. **No blank states.** Loading, empty, reconnecting, media failure, and ended states all have an intentional scene.
6. **The public player is passive.** Host-only controls stay in the dashboard. Keyboard controls remain available for accessibility and operators.

## 4. Presentation state system

### A. Arrival / waiting for first memory

- Event name in the display serif, balanced to a short 2-line measure.
- One friendly line such as “Share the moments on your phone.”
- QR at 280–360px on 1080p, white surface, 16–24px quiet zone, with a short URL fallback.
- Subtle static photographic/mosaic backdrop at low opacity; do not animate texture continuously.
- Clear response after a guest upload: retain the CTA until the image is decoded, then crossfade into media.

### B. Media presentation

- Minimal header: event name on the left, a small semantic live/reconnecting status on the right. Fade it after 5 seconds of no interaction; restore on new media, reconnect, or keyboard activity.
- Landscape media: fit within a 16:9 safe frame, preserving full image edges.
- Portrait/square media: fill the stage with a duplicated, enlarged, blurred/dim backdrop behind the sharp original. Do not crop the original image.
- Optional short caption/guest credit appears only when supplied and fades before the next item.
- The photo transition: 600–750ms crossfade with a maximum `translateY(18px)` and `scale(0.985 → 1)`; video uses only a fade.

### C. CTA intermission

- Display after an empty playlist, after a configurable number of images, or when no new eligible media has arrived for a configurable interval.
- QR remains the strongest visual element; event name and prompt are secondary.
- Transition in/out uses opacity only, avoiding a bright flash on projectors.

### D. Blackout, reconnecting, ending, error

- **Blackout:** pure black—no status text or residual chrome.
- **Reconnecting:** keep the last valid image visible; show a small non-blocking status only after a short delay.
- **Asset failure:** keep the previous frame while the next eligible item is prepared; never expose a broken image glyph.
- **Ended:** gratitude/after-event QR scene that allows guests to contribute after the programme.

## 5. Theme and visual tokens

Define a local `.live-wall-player` token layer rather than using raw colors across child rules:

```css
--live-wall-canvas: #0c0d0c;
--live-wall-surface: rgba(12, 13, 12, 0.72);
--live-wall-text: #fffaf0;
--live-wall-muted: rgba(255, 250, 240, 0.76);
--live-wall-accent: #d6b46a;
--live-wall-shadow: rgba(0, 0, 0, 0.52);
```

- Map host theme colors only to `--live-wall-accent` and opening/CTA decoration after contrast validation.
- Preserve ink canvas and ivory text on all themes, avoiding bright pink/purple full-screen backgrounds.
- Use existing display serif and clean sans body fonts; do not add a decorative script typeface that hurts projector readability.
- Use an 8px spacing rhythm and `clamp()` for all presentation typography.

## 6. Implementation phases

### Phase 1 — Event-ready visual foundation

1. Create a `LiveWallStage` component that owns media, backdrop, and enter/exit transitions.
2. Rework empty and CTA screens into one `LiveWallInvitation` component with an always-reserved QR frame.
3. Add the token layer and replace raw player colors.
4. Render portrait backdrop safely with a separate decorative image (`aria-hidden`) and an untouched foreground image.
5. Reduce player chrome to the event name and semantic connection status; add timed fade/restore behaviour.
6. Keep current motion implementation, but apply a fade-only variant for video and reduced motion.

**Done when:** At 1920×1080, empty, portrait, landscape, and end states all read as deliberate event scenes; every full-size original remains uncropped.

### Phase 2 — Presentation rhythm and conversion

1. Add presentation settings: CTA cadence by media count and idle interval, event tagline, and a theme accent selector.
2. Persist settings under a generic event presentation configuration; no wedding-specific fields.
3. Surface a small live preview in host controls using the same stage components rather than duplicating styles.
4. Add a QR scan source of `screen` and measure scans/conversions during CTA windows.
5. Add optional “new memory” indicator that is subtle and never blocks the active image.

**Done when:** A host can set an event-appropriate cadence and verify QR conversion without reconfiguring the projector.

### Phase 3 — Operator confidence

1. Dashboard operator strip: currently-on-screen thumbnail, next item, media queue depth, connection health.
2. Add explicit host actions: show invitation, skip, pause, blackout, end, and content policy switch, all with confirmations for destructive transitions.
3. Add a safe fallback when media URLs fail or expire: refresh snapshot, retry once, then advance with telemetry.
4. Add a presentation diagnostics panel visible only to host: player connected, last media time, last SSE event, and reconnect count.

**Done when:** An operator can handle an event from a phone/laptop without interacting with the projector or losing the current frame.

## 7. Accessibility and performance acceptance criteria

- Text and meaningful controls meet 4.5:1 contrast; focus rings meet 3:1 against their surrounding surface.
- All public-player UI works at 1366×768, 1920×1080, 3840×2160, and mobile landscape without clipping.
- QR is scannable from a phone photo of a 1080p display at a realistic venue distance.
- `prefers-reduced-motion` disables slideshow transitions and auto-advance; player remains operable with keyboard controls.
- No animation changes width, height, layout, or triggers continuous blur/filter animation.
- Next item is preloaded without downloading large video files eagerly; a failed asset cannot stall the wall.
- Chrome and CTA reserve space before QR/image loading to avoid layout shift.

## 8. Verification plan

### Visual regression

- Playwright screenshots at 1366×768, 1920×1080, 390×844 and landscape mobile for all presentation states.
- Fixtures: zero media, one portrait, one landscape, mixed sequence, video, hidden current media, and expired signed URL.
- Manual projector/TV pass: dark room and bright venue light; scan QR from a phone.

### Behavioural checks

- New media arrives without replacing the currently visible media mid-frame.
- A reconnect maintains the last valid frame and later resyncs to the correct playlist/state.
- Content policy change updates player eligibility predictably.
- Blackout has no accidental visual residue; ending shows the after-event invitation.

### Repository gates

```text
pnpm.cmd typecheck
pnpm.cmd lint
pnpm.cmd validate:locales
pnpm.cmd audit:unused-keys
go test ./...
go vet ./...
```

## 9. Explicit non-goals

- Synchronised music/audio with venue AV.
- Per-frame synchronization between multiple projectors.
- Heavy particles, parallax, animated grain, or colour filters over guest media.
- AI selection, facial recognition, and complex automatic curation.
- Wedding-only data models or a separate wedding-only player.
