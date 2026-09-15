# CandidCrowd frontend

Next.js frontend, Better Auth host identity provider, and the public marketing/product skeleton. Messaging is wedding-first while the event domain remains generic.

## Run

Requires Node.js 22 (`nvm use`) and pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm migrate:auth
pnpm dev
```

Start the backend PostgreSQL, Redis, and Mailpit dependencies first. Open http://localhost:3000; local verification/reset email is visible at http://localhost:8025. Production: run the auth migration during deployment, then `pnpm build` and `pnpm start`.

## Included

- Twelve-part responsive homepage: header, interactive hero, guest demo, problem, how it works, participation concept, event lifecycle, privacy, event types, pricing, final CTA and footer.
- Functional QR pointing to the current origin’s guest demo, with a no-scan alternative. Cross-device scanning requires a deployed or network-accessible origin; localhost only works on the originating device.
- Local guest preview: choose up to six JPG/PNG/WebP photos, 10 MB per file; validate decoded images; simulate progress, interruption and retry; view the updated gallery and lightbox; reset. Object URLs are released on reset/unmount. Photos never leave the browser and disappear on reload. Video upload is not implemented.
- `/create` is protected by the Better Auth session and creates a generic event through the authenticated Gin API.
- `/login`, `/register`, `/verify-email`, `/forgot-password`, and `/reset-password` use Better Auth. Passwords and session management never pass through Gin. Google/Apple controls are enabled only when their credentials and public feature flags are configured.
- The browser exchanges its HttpOnly Better Auth session for a short-lived JWT just before calling Gin. The JWT stays in memory and is not written to localStorage/sessionStorage.
- Keyboard navigation, Base UI focus-managed dialogs, reduced motion and responsive layouts. Simulated upload timers pause when offscreen or the tab is hidden.

## Architecture and dependencies

Next.js 16 App Router, React and TypeScript. Marketing sections are server components; interactive demos, navigation, dialogs and selectors are leaf client components. Tailwind CSS 4 and semantic CSS tokens provide styling; shadcn-compatible Base UI Button/Dialog primitives are customized to the editorial identity. Motion uses lazy-loaded DOM features, Lucide supplies icons, and `qrcode` is imported near the demo.

The hero now uses real Three.js geometry, lighting and a perspective camera. Move a mouse over the scene for subtle parallax; press **Share a memory** to send a photo from the phone into the gallery. The renderer is dynamically imported after the initial HTML preview. It renders on demand, pauses offscreen/hidden and disposes GPU resources on unmount. Textures are capped at 1024px and device pixel ratio at 1.5. Reduced motion, Save-Data, detected low-resource devices and WebGL failures retain the CSS/HTML fallback. No R3F, post-processing or external 3D models are needed. Implementation: `hero-three.tsx` (lifecycle), `hero-three-renderer.ts` (scene) and `hero-three.css` (layout).

```text
src/app/(marketing)/page.tsx       Homepage composition
src/app/create/                   Authenticated event creation route
src/app/(auth)/                   Host auth, verification and recovery routes
src/app/api/auth/                 Better Auth route handler
src/features/auth/components/     Auth/recovery forms and BEM styles
src/features/marketing/components/Section components and previews
src/features/marketing/data/      Photos, copy, plans, illustrative metrics
src/features/marketing/hooks/     Simulated upload state machine
src/components/ui/                Base UI / shadcn-compatible primitives
src/components/shared/            Lazy motion and reveal
src/lib/auth.ts                   Better Auth server and JWT/JWKS configuration
src/lib/api-client.ts             In-memory JWT bridge to the Gin API
src/lib/                          Event validation and shared utilities
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

Browser tests cover desktop/mobile interactions, responsive layouts, axe WCAG checks, registration consent, safe redirects, credential-storage safety, email-link verification, and password recovery. These checks do not constitute a complete accessibility certification or field performance measurement.

## Current boundaries

English copy; fictional sample event; illustrative participation numbers. Essential and Plus are configuration-driven planned tiers, without approved prices or checkout. Privacy and terms require legal review before launch.

Host email/password authentication, verification, reset, logout, JWT exchange, Gin profile sync, consent audit, and event creation are connected. QA still needs injected domain, SMTP, Google, and Apple credentials; none are hard-coded. Payment and the complete guest gallery/moderation/realtime/download UI remain outside this milestone.

The backend already exposes anonymous guest sessions and authorized browser-to-private-R2 presigned uploads. The next frontend milestone is the guest event/upload/gallery experience. Keep expiring URLs out of durable media metadata; pricing, legal copy, OAuth provider setup, and production security still need deployment review.

## Image sources

Illustrative Unsplash photographs, not customer testimonials: `1519741497674-611481863552` (celebration), `1511285560929-80b456fea0bc` (couple), `1511795409834-ef04bbd61622` (table), `1519225421980-715cb0215aed` (flowers), `1515934751635-c81c6bc9a2d8` (rings), `1523438885200-e635ba2c371e` (venue), `1532712938310-34cb3982ef74` (countryside). Review final licensed photography before launch.
