# CandidCrowd frontend

Public marketing homepage and local product prototype. Wedding-first messaging, generic event domain.

## Run

Requires Node.js 22 (`nvm use`) and pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:3000. Production: `pnpm build` then `pnpm start`.

## Included

- Twelve-part responsive homepage: header, interactive hero, guest demo, problem, how it works, participation concept, event lifecycle, privacy, event types, pricing, final CTA and footer.
- Functional QR pointing to the current origin’s guest demo, with a no-scan alternative. Cross-device scanning requires a deployed or network-accessible origin; localhost only works on the originating device.
- Local guest preview: choose up to six JPG/PNG/WebP photos, 10 MB per file; validate decoded images; simulate progress, interruption and retry; view the updated gallery and lightbox; reset. Object URLs are released on reset/unmount. Photos never leave the browser and disappear on reload. Video upload is not implemented.
- `/create` saves one editable generic event draft in localStorage. This is not a live event or host account.
- `/login` and `/register` provide host authentication UI: email/password, full name and required terms on registration, password visibility, and Google/Apple buttons. Actions show availability notices only; no credentials are sent or saved. Better Auth integration is deferred.
- Keyboard navigation, Base UI focus-managed dialogs, reduced motion and responsive layouts. Simulated upload timers pause when offscreen or the tab is hidden.

## Architecture and dependencies

Next.js 16 App Router, React and TypeScript. Marketing sections are server components; interactive demos, navigation, dialogs and selectors are leaf client components. Tailwind CSS 4 and semantic CSS tokens provide styling; shadcn-compatible Base UI Button/Dialog primitives are customized to the editorial identity. Motion uses lazy-loaded DOM features, Lucide supplies icons, and `qrcode` is imported near the demo.

The hero now uses real Three.js geometry, lighting and a perspective camera. Move a mouse over the scene for subtle parallax; press **Share a memory** to send a photo from the phone into the gallery. The renderer is dynamically imported after the initial HTML preview. It renders on demand, pauses offscreen/hidden and disposes GPU resources on unmount. Textures are capped at 1024px and device pixel ratio at 1.5. Reduced motion, Save-Data, detected low-resource devices and WebGL failures retain the CSS/HTML fallback. No R3F, post-processing or external 3D models are needed. Implementation: `hero-three.tsx` (lifecycle), `hero-three-renderer.ts` (scene) and `hero-three.css` (layout).

```text
src/app/(marketing)/page.tsx       Homepage composition
src/app/create/                   Local event draft route
src/app/(auth)/                   Login/register routes and shared photo layout
src/features/auth/components/     UI-only auth form and BEM styles
src/features/marketing/components/Section components and previews
src/features/marketing/data/      Photos, copy, plans, illustrative metrics
src/features/marketing/hooks/     Simulated upload state machine
src/components/ui/                Base UI / shadcn-compatible primitives
src/components/shared/            Lazy motion and reveal
src/lib/                          Generic event validation and utilities
design-system/candidcrowd/        Reviewed design system and page overrides
public/images/                    Locally served illustrative photography
tests/                            Playwright and axe checks
```

## Checks

```sh
pnpm lint
pnpm exec next typegen
pnpm typecheck
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

Browser tests cover desktop/mobile interactions, seven widths (375–1920px), landscape, axe WCAG checks, reduced motion, 200% text scaling, validation, retry/reset and draft persistence. These checks do not constitute a complete accessibility certification or field performance measurement.

## Explicit prototype boundaries

English copy; fictional sample event; illustrative participation numbers. Free means local preview. Essential and Plus are configuration-driven planned tiers, without approved prices or checkout. Login opens the UI-only authentication page. Privacy, terms and password reset use availability notices, not published legal documents or working account services.

No backend, public event creation, authentication, payment, R2 storage, cloud gallery, moderation, realtime or downloads. Privacy/original-quality claims describe the intended product, not a connected production service. No secrets or environment variables are needed for this prototype.

Next: host authentication → generic event API → anonymous guest session → authorized browser-to-private-R2 presigned PUT upload → completion verification → gallery. Keep storage behind an interface, validate and authorize on the server, and never store expiring URLs as media metadata. Pricing, legal copy and production security need review before launch.

## Image sources

Illustrative Unsplash photographs, not customer testimonials: `1519741497674-611481863552` (celebration), `1511285560929-80b456fea0bc` (couple), `1511795409834-ef04bbd61622` (table), `1519225421980-715cb0215aed` (flowers), `1515934751635-c81c6bc9a2d8` (rings), `1523438885200-e635ba2c371e` (venue), `1532712938310-34cb3982ef74` (countryside). Review final licensed photography before launch.
