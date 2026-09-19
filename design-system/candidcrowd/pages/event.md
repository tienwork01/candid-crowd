# CandidCrowd Event UI System

Reviewed against [AGENTS.md](../../AGENTS.md), [MASTER.md](../MASTER.md), and ui-ux-pro-max guidelines.

## 1. Visual Direction & Hierarchy
- **Atmosphere**: Editorial Photography × Premium Consumer product.
- **Palette**: Warm ivory canvas (`#f8f7f2`), dark olive ink (`#2d352b`), moss green brand actions (`#46533a`), soft sage accents (`#e4e8db`), hairline borders (`#dcded2`).
- **Typography Pairing**: *Cormorant Garamond* for emotional event headlines × *DM Sans* for clean, legible product UI.
- **Tone**: Human, understated, celebratory. Never generic enterprise SaaS.

## 2. Event Modes (5 Distinct Contexts)
1. **Silent Mode**: Ceremony & quiet rituals. Zero intrusive prompts, live wall disabled, respectful message honoring the solemnity of the moment.
2. **Soft Mode**: Cocktail hour & seated dinner. Gentle QR CTA, quiet photo contribution.
3. **Social Mode**: Reception & celebration. Full live wall, reactions enabled, real-time shared gallery.
4. **Party Mode**: Dance floor & late night. Playful photo missions, candid energy.
5. **After-event Mode**: Morning after. Recovery prompt generator, 1-click link to gather camera rolls before memories are forgotten.

## 3. Participation Engine & QR Touchpoints
- **Participation Metric**: Measured as `contributors / expected_guests`, emphasizing real human contribution over raw photo volume.
- **Touchpoint Attribution**: Separate tracking for Entrance, Tables, Bar, Dance Floor, Screen, and Invitations.

## 4. Accessibility & Touch Standards
- Phosphor Icons exclusively (`@phosphor-icons/react`).
- Min 44px touch targets on mobile.
- Keyboard navigation (Esc, ArrowLeft, ArrowRight) in Lightbox and Live Wall.
- BEM class naming across all components (`event-hub`, `event-gallery`, `event-analytics`, `event-mode-bar`, `event-lightbox`, `event-live-wall`).
- Full i18n parity across all 7 supported locales.
