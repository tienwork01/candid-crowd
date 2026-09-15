# CandidCrowd Design System

Official Design System architecture and token specifications for **CandidCrowd**.

Derived from product direction in [AGENTS.md](../../AGENTS.md) and established editorial standards:
- **Visual Direction**: Editorial photography × premium consumer product
- **Atmosphere**: Warm ivory paper, dark olive typography, moss green actions, soft tactile depth
- **Typography Pairing**: *Cormorant Garamond* (Display / Emotional Headlines) × *DM Sans* (Clean Product UI)
- **Token Model**: Three-layer token architecture (Primitive → Semantic → Component)

---

## 1. Primitive Tokens (Base Values)

Foundational design constants. Do not use directly in feature components; reference through semantic tokens.

### 1.1 Color Palette Primitives

```css
:root {
  /* Neutrals & Paper Base */
  --primitive-color-ivory: #f8f7f2;       /* Warm paper canvas */
  --primitive-color-surface: #fffefa;     /* Elevated card / surface */
  --primitive-color-white: #ffffff;       /* Pure white (polaroid/badges) */
  --primitive-color-sand: #eceee4;        /* Soft sand container */
  --primitive-color-sage: #e4e8db;        /* Secondary sage accent */
  --primitive-color-line: #dcded2;        /* Hairline border */
  --primitive-color-line-hover: #b4b8a8;  /* Subtle hover line */

  /* Inks & Text Tones */
  --primitive-color-ink: #2d352b;         /* Dark charcoal olive (body/headings) */
  --primitive-color-ink-deep: #181e17;    /* Deep carbon (Apple auth / dark cards) */
  --primitive-color-muted: #606458;       /* Secondary neutral text */
  --primitive-color-subtle: #8a8e80;      /* Captions, hints, placeholders */

  /* Brand Moss Green */
  --primitive-color-moss-500: #46533a;    /* Primary brand action */
  --primitive-color-moss-600: #303e28;    /* Primary hover */
  --primitive-color-moss-700: #24301e;    /* Primary active / pressed */
  --primitive-color-moss-100: #eef1e8;    /* Subtle moss tint / tag background */

  /* Status & Accents */
  --primitive-color-crimson: #a33428;     /* Error / destructive */
  --primitive-color-amber: #b87b28;       /* Warning / caution */
  --primitive-color-emerald: #2e6945;     /* Success / confirmed */
}
```

### 1.2 Typography Primitives

```css
:root {
  /* Font Families */
  --primitive-font-serif: var(--font-serif), Georgia, "Times New Roman", serif;
  --primitive-font-sans: var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* Font Weights */
  --primitive-weight-light: 300;
  --primitive-weight-regular: 400;
  --primitive-weight-medium: 500;
  --primitive-weight-semibold: 600;
  --primitive-weight-bold: 700;

  /* Font Sizes */
  --primitive-text-2xs: 11px;
  --primitive-text-xs: 12px;
  --primitive-text-sm: 13px;
  --primitive-text-base: 15px;
  --primitive-text-md: 16px;
  --primitive-text-lg: 18px;
  --primitive-text-xl: 22px;
  --primitive-text-2xl: 28px;
  --primitive-text-3xl: 34px;
  --primitive-text-4xl: 42px;
  --primitive-text-5xl: 56px;
  --primitive-text-hero: clamp(40px, 5.5vw, 68px);

  /* Line Heights */
  --primitive-leading-tight: 1.08;
  --primitive-leading-snug: 1.25;
  --primitive-leading-normal: 1.55;
  --primitive-leading-relaxed: 1.7;

  /* Letter Spacing (Tracking) */
  --primitive-tracking-tight: -0.02em;
  --primitive-tracking-normal: 0em;
  --primitive-tracking-wide: 0.06em;
  --primitive-tracking-caps: 0.12em;
}
```

### 1.3 Radii Primitives

```css
:root {
  --primitive-radius-none: 0px;
  --primitive-radius-xs: 4px;     /* Polaroid inner media, micro chips */
  --primitive-radius-sm: 6px;     /* Secondary controls, standard button base */
  --primitive-radius-md: 8px;     /* Form inputs, social buttons, polaroid card */
  --primitive-radius-lg: 12px;    /* Cards, dropdowns, dialogs */
  --primitive-radius-xl: 16px;    /* Floating preview cards */
  --primitive-radius-2xl: 24px;   /* Section cards, showcase frames */
  --primitive-radius-3xl: 32px;   /* Hero photo frame, editorial containers */
  --primitive-radius-full: 9999px;/* Pills, status badges, avatars */
}
```

### 1.4 Spacing Primitives (4px / 8px scale)

```css
:root {
  --primitive-space-1: 4px;
  --primitive-space-2: 8px;
  --primitive-space-3: 12px;
  --primitive-space-4: 16px;
  --primitive-space-5: 20px;
  --primitive-space-6: 24px;
  --primitive-space-8: 32px;
  --primitive-space-10: 40px;
  --primitive-space-12: 48px;
  --primitive-space-16: 64px;
  --primitive-space-20: 80px;
  --primitive-space-24: 96px;
  --primitive-space-32: 128px;
}
```

### 1.5 Elevation & Shadow Primitives

```css
:root {
  --primitive-shadow-none: none;
  --primitive-shadow-subtle: 0 1px 2px rgba(20, 30, 15, 0.04);
  --primitive-shadow-card: 0 4px 14px rgba(35, 45, 30, 0.06);
  --primitive-shadow-raised: 0 12px 30px -6px rgba(35, 45, 30, 0.12);
  --primitive-shadow-floating: 0 24px 44px -8px rgba(22, 32, 18, 0.28);
  --primitive-shadow-hero: 0 32px 72px -16px rgba(24, 34, 20, 0.24), 0 10px 28px -6px rgba(24, 34, 20, 0.08);
}
```

---

## 2. Semantic Tokens (Purpose-Based Aliases)

Map foundational primitives to product intentions.

```css
:root {
  /* Surfaces & Backgrounds */
  --background: var(--primitive-color-ivory);
  --surface: var(--primitive-color-surface);
  --surface-raised: var(--primitive-color-white);
  --soft: var(--primitive-color-sand);
  --sage: var(--primitive-color-sage);

  /* Typography & Foregrounds */
  --ink: var(--primitive-color-ink);
  --muted: var(--primitive-color-muted);
  --subtle: var(--primitive-color-subtle);
  --on-primary: var(--primitive-color-surface);
  --on-dark-muted: #dde1d4;

  /* Interactive / Brand Actions */
  --primary: var(--primitive-color-moss-500);
  --primary-hover: var(--primitive-color-moss-600);
  --primary-active: var(--primitive-color-moss-700);

  /* Structural Lines & Dividers */
  --line: var(--primitive-color-line);
  --line-hover: var(--primitive-color-line-hover);
  --line-focus: var(--primitive-color-ink);

  /* Feedback */
  --error: var(--primitive-color-crimson);
  --warning: var(--primitive-color-amber);
  --success: var(--primitive-color-emerald);

  /* Universal Layout Tokens */
  --radius: var(--primitive-radius-sm);
  --radius-input: var(--primitive-radius-md);
  --radius-card: var(--primitive-radius-lg);
  --radius-pill: var(--primitive-radius-full);
  --header-height: 88px;
}
```

---

## 3. Component Token Specifications

### 3.1 Buttons (`.button`, `.auth-form__social-btn`)

| Variant | Background | Border | Text | Hover State | Height | Radius |
|---|---|---|---|---|---|---|
| **Primary** | `var(--primary)` | None | `#fffefa` | `var(--primary-hover)`, translateY(-1px) | 48px | 8px |
| **Secondary / Outline** | `transparent` | `1px solid var(--line)` | `var(--ink)` | `rgba(70,83,58,0.06)`, border `var(--line-hover)` | 44px | 8px |
| **Ghost** | `transparent` | None | `var(--muted)` | `var(--ink)` | 44px | 8px |
| **Google Auth** | `#ffffff` | `1px solid var(--line)` | `#374151` | `#fafaf7`, lift + soft shadow | 44px | 8px |
| **Apple Auth** | `#181e17` | `1px solid #181e17` | `#ffffff` | `#252e24`, lift + dark shadow | 44px | 8px |

### 3.2 Text Inputs (`.auth-form__field input`)

- **Height**: 46px desktop / 44px mobile.
- **Font Size**: 15px desktop, strictly **16px on mobile** (prevents iOS auto-zoom).
- **Background**: `var(--surface)` (`#fffefa`).
- **Resting Border**: `1px solid var(--line)` (`#dcded2`).
- **Hover Border**: `1px solid var(--primitive-color-subtle)` (`#8a8e80`).
- **Focus State**: `border-color: var(--ink)` (`#2d352b`), `outline: none !important; box-shadow: none !important;` (pure, crisp contrast).
- **Radius**: `var(--radius-input)` (8px).

### 3.3 Cards & Floating Elements

| Component | Radius | Background | Border | Shadow |
|---|---|---|---|---|
| **Standard Card** | 12px | `var(--surface)` | `1px solid var(--line)` | Subtle 1px |
| **Hero Photo Frame** | 32px | Dark carbon | `1px solid rgba(255,255,255,0.5)` | Deep ambient multi-stop shadow |
| **Polaroid Photo** | 8px | `#ffffff` paper | `1px solid rgba(0,0,0,0.05)` | Realistic paper drop shadow |
| **Glassmorphic Badge**| 9999px | `rgba(255,254,250,0.92)` | `1px solid rgba(220,222,210,0.85)` | Blur 16px + soft elevation |

---

## 4. Responsive Breakpoints

| Breakpoint | Target | Key Architectural Behavior |
|---|---|---|
| **Mobile (`≤ 480px`)** | Small/Standard Phones | Form takes 100% viewport; input text 16px; decorative photo hidden; **zero vertical scrolling** |
| **Tablet (`≤ 900px`)** | Tablets & Foldables | Single-column form mode; full viewport height |
| **Desktop (`> 900px`)** | Laptops & Desktops | Split screen layout: Form on left, Layered Editorial Gallery on right |
| **Wide (`≥ 1600px`)** | Large Displays | Content padded gracefully; max hero frame width 480px |

---

## 5. CSS Class Naming Rules (BEM Standard)

Per [AGENTS.md](../../AGENTS.md), all custom styling must follow the BEM convention:
- **Block**: `auth-page`, `auth-form`, `hero-scene`, `site-header`
- **Element**: `auth-page__visual`, `auth-form__social-btn`, `auth-form__field` (single underscore depth only: `block__element`, never `block__elem__subelem`)
- **Modifier**: `auth-form__social-btn--google`, `hero-scene--3d`

