# i18n migration plan

## Objective

Move every application-owned, user-facing string out of TypeScript/TSX and into the JSON dictionaries in `messages/`. English is canonical; all supported locale files must have the same key structure.

User-generated values (event names, captions, host-entered messages, file names and API-provided user content) are intentionally excluded and must remain unmodified.

## Completion rules

- UI components use semantic `next-intl` keys (`useTranslations` in client components, `getTranslations` in server components).
- Data used to render UI (marketing plans, event type labels, preview notices) uses IDs and dictionary lookups, not display copy in TypeScript.
- API error codes are mapped by the frontend to `common.errors.*`; backend-provided prose is never rendered as system UI.
- Dates, numbers, percentages and currency use `useFormatter`, `getFormatter`, or `Intl` with the resolved locale.
- Every locale contains every English key; `node scripts/validate-locales.mjs` must pass.
- A source scan has no remaining application-owned visible text literals. Brand identifiers, route segments, CSS classes, test fixtures and user-generated values are allowed.

## Work log and checklist

### 0. Foundation — complete

- [x] Install and configure `next-intl`.
- [x] Add canonical locale configuration and browser language normalization.
- [x] Add locale-prefixed marketing routing plus neutral app/guest routing.
- [x] Add cookie persistence and reusable language switcher.
- [x] Add JSON validation for locale file existence, JSON validity and key parity.
- [x] Localize root metadata, document language, skip link, marketing header and hero.

### 1. Shared primitives and error mapping — complete

- [x] `src/components/shared/brand.tsx` — `common.brandHome`
- [x] `src/components/ui/dialog.tsx` close control — `common.actions.close`
- [x] `src/lib/errors.ts`, validation and API-error adapters — `common.errors.*`
- [x] Add a reusable locale-aware date/number/currency utility — `src/i18n/format.ts`

### 2. Authentication — complete

- [x] `src/features/auth/components/auth-form.tsx` — (`auth.ui.*`, `auth.signIn.*`, `auth.register.*`)
- [x] `src/features/auth/components/account-recovery.tsx` — (`auth.recovery.*`)
- [x] `src/features/auth/components/logout-button.tsx` — (`auth.ui.logOut`)
- [x] Auth page titles and auth layout — (`auth.layout.*`, `auth.pages.*`)

### 3. Host event creation and workspace — complete

- [x] `src/features/event/components/event-draft-form.tsx` — (`event.setup.*`, `event.types.*`)
- [x] Event validation and event-type labels — (`event.types.*`, `src/features/event/types/event.ts`)
- [x] `src/features/host/components/host-shell.tsx` — (`host.shell.*`)
- [x] `src/features/host/components/host-account-menu.tsx` — (`host.accountMenu.*`)
- [x] Create, events, profile and billing pages — (`host.pages.*`)

### 4. Marketing data and static sections — complete

- [x] Move display strings from `src/features/marketing/data/marketing.ts` to JSON.
- [x] How it works, problem, privacy, pricing, event types and final CTA.
- [x] Footer, lifecycle, participation preview and preview notice.
- [x] Localize image alt text without changing media assets.

### 5. Interactive marketing demo — complete

- [x] Guest demo and upload preview states.
- [x] Demo QR, gallery and hero scene controls.
- [x] ARIA labels, empty/error/success states and dynamic interpolation.

### 6. Legal and final audit — complete

- [x] Legal table of contents and legal pages.
- [x] Add a source-literal audit script with explicit allowlist.
- [x] Run locale validation, lint, TypeScript and memory-limited production compile.
- [x] Record all intentional exceptions in this document.

## Update protocol

After each completed checklist item, update this file in the same change set with:

1. the component/file completed;
2. the translation namespace introduced or changed;
3. the validation commands run and their result; and
4. any intentionally retained non-UI literal.

### Latest update

Completed Section 6 (Legal and final audit) and full project migration:

1. Components/files completed:
   - `src/features/legal/components/table-of-contents.tsx`: Localized `TableOfContents` (title, dynamic ICU plural for section counts, sidebar aria) and `BackToTop` (label, aria-label).
   - `src/app/(marketing)/privacy/page.tsx`: Localized page metadata, hero badge, title, subtitle, location, compliance tag, TOC title, summary callout card (title, lead, item labels & values), all 24 section headers, and footer navigation links.
   - `src/app/(marketing)/terms/page.tsx`: Localized page metadata, hero badge, title, subtitle, location, effective date, TOC title, summary callout card (title, lead, item labels & values), all 25 section headers, and footer navigation links.
   - `src/features/marketing/components/hero.tsx`: Localized eyebrow badge, "See how it works" inline link, and trust indicators ("No app", "Private", "Original quality").
   - `src/features/marketing/components/mobile-nav.tsx`: Localized mobile drawer trigger open/close aria-labels, menu aria-label, log in link, and create event button.
   - `src/features/marketing/components/demo-gallery.tsx`, `guest-demo.tsx`, and `participation-preview.tsx`: Refactored to type-safe dictionary lookups, removing all explicit `any` casts.
   - `scripts/audit-source-literals.mjs`: Implemented AST-based scanner inspecting JSX text and attributes across all 48 TSX files, integrated as `pnpm audit:literals`.
2. Translation namespaces introduced/updated across all 7 locales (`en`, `vi`, `es`, `fr`, `de`, `it`, `pt-BR`):
   - `legal.toc.*` (`title`, `sectionsCount`, `backToTop`, `backToTopAria`, `sidebarAria`)
   - `legal.privacy.*` (`metaTitle`, `metaDescription`, `heroBadge`, `heroTitle`, `lastUpdated`, `location`, `compliance`, `heroLead`, `tocTitle`, `calloutTitle`, `calloutLead`, `calloutItems.*`, `sections.*`, `viewTerms`)
   - `legal.terms.*` (`metaTitle`, `metaDescription`, `heroBadge`, `heroTitle`, `lastUpdated`, `location`, `effective`, `heroLead`, `tocTitle`, `calloutTitle`, `calloutLead`, `calloutItems.*`, `sections.*`, `viewPrivacy`)
   - `marketing.hero.*` (`eyebrow`, `seeHowItWorks`, `trustNoApp`, `trustPrivate`, `trustOriginalQuality`)
   - `marketing.navigation.*` (`open`, `close`, `mobile`)
3. Validation commands & results:
   - `pnpm validate:locales`: 7 locale files verified with 100% key parity against `en.json` (0 missing, 0 extra keys).
   - `pnpm audit:literals`: Scanned 48 TSX files, found 0 unlocalized literals.
   - `pnpm typecheck`: Passed with 0 errors.
   - `pnpm lint`: Passed with 0 errors and 0 warnings.
   - `pnpm build`: 16/16 routes compiled and statically generated successfully.
4. Intentionally retained non-UI literals & exceptions:
   - Legal agreement contract clauses: In `privacy/page.tsx` and `terms/page.tsx`, the governing contract clauses remain in canonical English, while all UI chrome, metadata, headings, badges, and TOC elements are fully localized.
   - Brand tokens: `CandidCrowd`, `candidcrowd`, `candidcrowd.`, `Clerk`, `Cloudflare`, `Google`, `Apple`.
   - Fictional/demo mock entities: `Emma & James`, `May 24, 2026`, `24/05/2026`, `IMG_4821.jpg`, `DSC_0042.jpg`, `PXL_9012.jpg`, `MVI_1082.mp4`, `table-04`, `entrance`, `bar`, `dj_booth`, `reception`.
   - Punctuation, symbols, numbers, math, currency: `•`, `©`, `—`, `–`, `&rarr;`, `&ldquo;`, `&rdquo;`, `&apos;`, `USD 100`.
   - Technical values: MIME types (`image/*`), route paths (`/terms`, `/privacy`, `/login`), email addresses (`support@candidcrowd.com`), CSS classes, and Three.js fallback tokens.
5. Dead Key Elimination Rule & Tooling:
   - Rule added to `AGENTS.md`: Whenever code edits cause a translation key to become unused, it must immediately be purged from all `messages/*.json` files.
   - Automated audit scanner: `scripts/audit-unused-keys.mjs` integrated as `pnpm audit:unused-keys`.
   - Cleaned up 5 dead keys across all 7 locales (`marketing.qr.*`, `marketing.participation.conceptPill`, `illustrativeData`, `sharingMemories`, `perspectiveCounts`).
