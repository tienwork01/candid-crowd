# CandidCrowd homepage overrides

Generated through the installed UI UX Pro Max CLI on 2026-09-14, then reviewed against AGENTS.md and the supplied briefs. This file overrides MASTER.md for the public homepage.

## Search review

- Design system: `premium consumer event photography editorial`; retry `event photo sharing warm`. Neither completely fits: Liquid Glass, black/gold, playful wellness fonts, and testimonial carousel are rejected. Generated VHS/shake effects are rejected.
- Style: `editorial photography minimal elegant` → Minimalism & Swiss Style. Adopt whitespace, hierarchy, restrained transitions; keep editorial serif photography rather than enterprise styling.
- Typography: `editorial serif readable sans`, retry `elegant serif sans luxury` → Cormorant/Montserrat. Retain existing Cormorant Garamond + DM Sans: editorial expression with readable UI, no extra fonts.
- Colors: `warm lifestyle neutral`, retry `wellness natural warm` → documentation/florist palettes. No verified product match; retain established ivory/charcoal olive/moss/sage from product direction.
- Landing: `hero hierarchy conversion demo` → Product Demo + Features. Adopt explicit controls, static readable state, no autoplay.
- UX: `upload progress feedback`, `heading wrapping mobile`, `focus not obscured`, `reduced motion`. Apply progress/steps, balanced reflow, sticky-header clearance, reduced motion, pause offscreen/hidden.

## Page rules

- Exact order: Header → Hero → Guest demo → Problem → How it works → Participation → Before/During/After → Privacy → Event types → Pricing → Final CTA → Footer.
- Width 1240px, 1360px at 1920px. Gutters 20px phone / 32px tablet / 56px desktop. Section rhythm 64 / 88 / 112px.
- Tokens: ivory #f8f7f2, card #fffefa, ink #2d352b, primary #46533a, hover #303e28, muted text #606458, line #dcded2, sage #e4e8db. Use semantic CSS/Tailwind tokens.
- Mobile body 16px; UI 14–16px; supporting labels 12px. Tiny text allowed only inside illustrative devices/printed cards, not primary controls. Headings use bounded balanced wrapping; verify zoom.
- Radius: buttons 6px, cards 12px, image tiles 4px, physical phones 30px. Restrained shadows on physical devices and previews only.
- Hero: SSR-rendered phone + gallery fallback, enhanced with a lazy Three.js WebGL scene as explicitly requested. Real rounded phone geometry, lighting, perspective camera, pointer parallax and a photo travelling to the gallery. Accessible HTML share/replay controls stay outside the canvas. CTA above fold at 375×812.
- Demo: QR to current origin + accessible bypass; Open → Select → Simulated upload → Success, retry/reset/lightbox. Fictional event, local-only media.
- Motion: lazy domAnimation, 200–400ms transform/opacity, no loops. User-triggered simulated upload ~2.2s, pauses offscreen/hidden.
- Participation: compact concept dashboard; all figures from config, visibly illustrative, no social-proof claims.
- Pricing: Free preview; Essential/Plus planned. No invented commercial prices, quotas, or checkout.
- Existing `/create` draft remains CTA destination. Log in/legal use accessible preview notices.
- Check screenshots/browser at 375, 390, 430, 768, 1024, 1440, 1920px, landscape, keyboard, reduced motion, text scaling.

## Delivery audit — 2026-09-14

- Final UX search: `excessive motion touch targets focus`; retained restrained transitions and mobile-sized controls.
- `pnpm lint`, route type generation, `pnpm typecheck`, and `pnpm build` passed. Homepage and create route prerender successfully.
- 16 Playwright tests passed across desktop and mobile Chromium, including axe, keyboard dialogs, local file validation, interrupted upload/retry, reset cancellation, reduced-motion console errors, 200% text scaling and draft persistence.
- Screenshot review: hero at all seven requested widths; full homepage and demo layouts at phone/desktop. No horizontal overflow at 375, 390, 430, 768, 1024, 1440 or 1920px. Images load after scrolling; initial gallery remains visible in SSR output.
- Reproduce screenshots with a running server: `node scripts/visual-audit.mjs`. Generated files are in ignored `test-results/visual/`.
- Limitations: browser coverage uses Chromium with mobile emulation, not physical iOS/Android devices. No field Core Web Vitals, backend security audit or full accessibility certification. Replace illustrative photography with the final licensed candid-event collection before launch.

## Requested 3D enhancement

### More visible depth and interaction

- Review finding: the old gallery used one flat texture, small pointer angles and no entrance, so the scene was easy to mistake for a static illustration. Replace the two gallery photos with individually raised paper meshes and increase the transfer's depth and rotation.
- A single 1.6-second unfolding entrance makes depth apparent when the scene first enters view. This is an intentional exception to the earlier 200-400ms guideline for small transitions. The upload itself remains user-triggered; there is no looping animation. Starting an upload or rotating the view completes the entrance immediately.
- Add bounded left/right rotation controls using the existing Base UI Button, Lucide icons, accessible labels and hover titles. They work with touch and keyboard, use 44px targets, and disappear with the WebGL fallback.
- Use one 512px shadow map with restrained soft shadows on desktop; disable shadows and extra prints on compact scenes. Phone screen feedback follows the sharing state. Keep the shared requestAnimationFrame lifecycle and explicit GPU disposal.
- Skill searches: `animation entrance duration` supports context-specific timing and avoiding infinite decorative loops; `shadow performance mobile` supplies selective shadow guidance. Broad 3D style suggestions do not fit the photographic brand, so retain existing tokens and typography. Reference: [Three.js shadow tradeoffs](https://threejs.org/manual/en/shadows.html).
- Verification now covers entrance completion, view controls including keyboard activation, idle settling, offscreen pause, context loss and reduced motion. Visual audit captures entrance, resting, rotated, in-flight and completed views at all seven widths, checks canvas pixels and detects horizontal overflow.
- Narrower `3D hyperrealism` style search supports layered depth, photographic textures and lighting; retain the project's existing palette and avoid the suggested immersive full-site treatment. Final validation: 20 Playwright tests, lint and TypeScript pass. Seven-width pixel/screenshot audit passes; left and right rotation screenshots reviewed on desktop and mobile emulation.

- Additional effects: pointer-driven depth offsets on the two paper prints, restrained directional-light movement, a small lift during photo transfer and a brief settling motion at arrival. All effects share the demand-rendered loop, stop offscreen/hidden and use the existing reduced-motion fallback. Reset removes the transferred photo immediately instead of flying it backwards.

- Follow-up review: reran the design-system, style, typography, color, reduced-motion and Three.js searches. Broad system/color results still do not match the product; preserve the reviewed MASTER instead of persisting unrelated generated palettes. Serif/sans hierarchy and demand rendering remain applicable.
- Add two photographic paper prints and a backing sheet for physical depth. Hide the extra prints below 480px scene width and cap compact DPR at 1.25. No looping motion; the phone progress bar and transfer move only during the share interaction.
- Resolve the destination from gallery-local coordinates so the transferred print rests over the receiving tile. Use elapsed frame time for consistent settling across refresh rates.
- Follow-up validation: lint and TypeScript pass; all four desktop/mobile WebGL lifecycle and reduced-motion tests pass. `node scripts/hero-three-audit.mjs` checks nonblank canvas pixels, changed pixels after sharing, screenshots and horizontal overflow at 375, 390, 430, 768, 1024, 1440 and 1920px. Outputs: ignored `test-results/hero-three/`. Desktop and mobile screenshots reviewed; physical-device performance remains unmeasured.

- Focused UI UX Pro Max query: `render demand dispose textures --stack threejs`. Adopt explicit texture/geometry/material disposal and requestAnimationFrame rendering only while changes settle.
- Import Three.js after the initial hero paints; reserve the existing scene height. Texture canvases are at most 1024px; DPR capped at 1.5; no post-processing, continuous spin or external models.
- Offscreen/hidden scenes stop rendering. Reduced motion, Save-Data, detected low-memory/low-core devices, module/image errors or context loss keep the DOM fallback and working share button.
- Sources: [Three.js rendering on demand](https://threejs.org/manual/en/rendering-on-demand.html), [GPU resource disposal](https://threejs.org/manual/en/how-to-dispose-of-objects.html).
