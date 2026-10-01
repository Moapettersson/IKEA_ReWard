# Design system

The goal: it should look like it belongs on ikea.com, not like a generic AI-built app. Every value below was **measured from ikea.com/se/en on 2026-09-30** (home page, a category listing and a product page) by reading IKEA's own CSS custom properties and computed styles. Where a value was not measured but chosen by us, it is marked *(chosen)*.

We copy IKEA's **patterns** (spacing, type scale, colours, shapes, layout). We do **not** copy IKEA's **brand assets**: no IKEA logo, no "Noto IKEA" font, no IKEA product photos.

## 1. Colour

IKEA's UI is mostly black, white and grey. Blue and yellow are accents, not backgrounds. Keep it that way.

### Neutrals and text

| Token | Hex | IKEA name | Use |
|---|---|---|---|
| `--c-white` | `#FFFFFF` | neutral-1 | Page background |
| `--c-grey-50` | `#F5F5F5` | neutral-2 | Image backgrounds, info boxes, search field, secondary button bg |
| `--c-grey-200` | `#DFDFDF` | neutral-3 | Dividers, borders |
| `--c-grey-300` | `#CCCCCC` | neutral-4 | Disabled bg |
| `--c-grey-500` | `#929292` | neutral-5 | Input and outline borders |
| `--c-grey-700` | `#484848` | neutral-6 | Body text |
| `--c-black` | `#111111` | neutral-7 | Headings, product names, prices, primary button |
| `--c-text-1` | `#111111` | text-and-icon-1 | Strong text |
| `--c-text-2` | `#484848` | text-and-icon-2 | Body text (default) |
| `--c-text-3` | `#767676` | text-and-icon-3 | Meta text, captions |

### Brand and semantic

| Token | Hex | IKEA name | Use in ReWard |
|---|---|---|---|
| `--c-blue` | `#0058A3` | ikea-brand-blue / interactive-emphasised | The one main action per view (Add to bag, Place order), ReWard wordmark, links in points line |
| `--c-blue-hover` | `#004F93` | emphasised hover | |
| `--c-blue-pressed` | `#003E72` | emphasised pressed | |
| `--c-yellow` | `#FFDB00` | ikea-brand-yellow | Points icon, "best value after cashback" highlight, and on the project site: section title bars, step numbers, the hero tag and highlighted key line. Never large surfaces or full backgrounds |
| `--c-family-blue` | `#007CC1` | ikea-family | Not used (reserved for IKEA Family, avoid confusion) |
| `--c-green` | `#0A8A00` | semantic-positive | Stock dots, tier A, success |
| `--c-sustainability` | `#37B886` | campaign-sustainability | Tier B, sustainability section accents |
| `--c-orange` | `#F26A2F` | semantic-caution | Tier D, margin-cap warnings in admin |
| `--c-orange-text` | `#CA5008` | semantic-caution-text | Caution text on white |
| `--c-red` | `#E00751` | semantic-negative | Errors, "Best seller" style badge |
| `--c-price-red` | `#CC0008` | commercial-message-new-lower-price | "New lower price" label and strike-through |

### Interactive states

| Component | Default | Hover | Pressed |
|---|---|---|---|
| Primary (black) | `#111111` | `#333333` | `#000000` |
| Emphasised (blue) | `#0058A3` | `#004F93` | `#003E72` |
| Secondary bg | `#F5F5F5` | `#DFDFDF` | `#CCCCCC` |
| Subtle/outline border | `#929292` | `#111111` | `#111111` |
| Disabled | bg `#CCCCCC`, text `#929292` | | |

## 2. Typography

- **Font:** `"Noto Sans", system-ui, sans-serif`, self-hosted via `@fontsource/noto-sans` (latin subset), weights **400 and 700 only**. No Google Fonts request, so no visitor data goes to Google. IKEA uses "Noto IKEA", a proprietary cut of Noto Sans; plain Noto Sans is the closest open equivalent.
- **Only two weights.** No 500, no 600, no italics.
- **Sentence case** for every heading and button ("How to get it", "Add to shopping bag"). Never Title Case, never ALL CAPS except product names.
- Product names are written in capitals in the data itself (`STADIG`), not via `text-transform`.
- Left aligned everywhere, except numbers in tables (right aligned).

| Token | Size / line-height | Weight | Measured on | Use |
|---|---|---|---|---|
| `--t-display` | 40 / 50 | 700 | Home hero h1 | Project site hero only |
| `--t-h1` | 24 / 30 | 700 | Section headings ("Customer reviews") | Page and section titles |
| `--t-h2` | 20 / 28 | 700 | *(chosen, between measured 16 and 24)* | Sub-sections |
| `--t-h3` | 16 / 24 | 700 | PDP product name block | Card and box titles |
| `--t-lead` | 20 / 32 | 400 | PDP overview paragraph | Intro paragraphs on project site |
| `--t-body-l` | 16 / 24 | 400 | Search field, lists | Larger body |
| `--t-body` | 14 / 22 | 400 | `body` default | Default text |
| `--t-body-strong` | 14 / 18 | 700 | Product name, labels | Product names, labels |
| `--t-caption` | 12 / 16 | 400 / 700 | Badges, VAT line | Meta, badges |
| `--t-price-l` | 32 / 40 | 700 | PDP price | Product page price |
| `--t-price-m` | 28 / 28 | 700 | Listing price | Product card price |
| `--t-price-suffix` | 14 | 700 | `:-` on listing | Currency suffix |

### Price format

IKEA Sweden prints prices as `699:-` and `3 495:-`:

- Integer in `--t-price-m` or `--t-price-l`, bold, `--c-black`.
- `:-` as a separate span in 14px bold, same baseline.
- Thousands separator is a **non-breaking space** (` `).
- Old price: 12px, strikethrough in `--c-price-red`, above the new price.
- Small print under price: 12px `--c-text-3` (for example "Previous lowest price 799:-", or in our case "630:- after cashback").
- Implement once as `<Price value={699} size="m" />` and `formatSek()` in `src/lib/format.ts`.

## 3. Shape (corner radius)

This is the single biggest "does it look like IKEA" signal. IKEA is **square by default** and **fully round for actions**. Nothing in between except info boxes.

| Token | Value | Used by IKEA for |
|---|---|---|
| `--r-none` | 0 | Product images, product cards, hero tiles, badges, article-number chip, tabs |
| `--r-s` | 4px | Inputs, checkboxes, filter chips, quantity stepper |
| `--r-m` | 8px | Info boxes ("Available services" grey box) |
| `--r-pill` | 64px | All buttons, search field, category chips, "All media" overlay button |
| `--r-circle` | 50% | Icon buttons (favourite, add-to-cart on cards), 40×40 |

Never use radius 12, 16 or 24 on cards. Never round images.

## 4. Spacing and layout

- Spacing scale *(chosen, matches measured paddings of 4, 6, 8, 11, 16, 24, 48)*: `4, 8, 12, 16, 24, 32, 40, 48, 64, 80` as `--s-1` … `--s-10`.
- Breakpoints (measured from IKEA media queries): **600px** (37.5em), **900px** (56.25em), **1200px** (75em).
- Page side gutter: 20px below 600, 32px 600-1199, 48px from 1200 *(approx, measured ~42-48px at desktop)*.
- IKEA is full-width with gutters. We cap content at `max-width: 1600px` *(chosen)* so it holds up on large demo screens.
- Product grid: 2 columns < 600, 3 columns 600-1199, 4 columns ≥ 1200 (listing page has a 220px filter column on the left from 900px). Column gap 16px, row gap 48px.
- Product images: 1:1, object-fit contain, on `--c-grey-50` background.

## 5. Components (IKEA pattern → ReWard use)

### Buttons
| Variant | Look | Height | Use |
|---|---|---|---|
| Emphasised | Blue bg, white 14px/700 text, pill | 56px (large), 48px | One per view: "Add to shopping bag", "Place order" |
| Primary | Black bg, white text, pill | 48px | Other strong actions: "Save model", "Continue" |
| Secondary | Transparent, 1px `--c-grey-500` border, black text, pill | 48px | "Compare", "Reset demo" |
| Tertiary | Text link, underlined, 14px | - | "Learn more", "How it works" |
| Icon | 40×40 circle, white or `--c-grey-50`, 24px line icon | 40px | Favourite, bag icon, stepper |
| Card add-to-bag | 40×40 blue circle with white bag+ icon | 40px | Product card |

Horizontal padding 24px. Transition: `background-color 200ms cubic-bezier(0.4, 0, 0.4, 1)` (measured).

### Header (demo)
1. Utility bar, 40px, `--c-black`, 12px white text: left "Student concept for IKEA · simulated data", right "Give feedback" link and points balance "1 240 points".
2. Main header, white: wordmark left, nav links (14px/700: Products, Rewards, How it works → `/demo/rewards#how-it-works`, Admin), search field (submits to `/demo/search?q=`) (48px pill, `--c-grey-50`, magnifier icon at 16px inset), icons right (rewards, bag with blue count bubble).
3. Category chips row: pill chips on `--c-grey-50`, 14px/700, 40px high, with small square thumbnail.

### Product card (listing)
Top to bottom, no card border, no shadow:
1. Square image on grey, optional badge top-left (square, 12px/700, padding 4px 6px). No heart/favourite icon: favourites are out of scope, and a dead button fails accessibility and user tests.
2. Commercial line if any ("New lower price" in red 14/700).
3. **Product name** 14/700 black, description 14/400 `--c-text-1` ("Bookcase, white, 80x28x202 cm").
4. Price (`--t-price-m`).
5. **ReWard line** *(new)*: tier badge + "+69 points" 12/700 + "630:- after cashback" 12/400 `--c-text-3`.
6. Add-to-bag blue circle to the right of name/price, like IKEA.

### ReWard points line (product page)
Mirror IKEA's existing "Collect 13 points with IKEA Family" row, which sits under the Add to bag button:
- 24px yellow (`--c-yellow`) circle with black 16px icon (leaf).
- "Earn **69 points** with **ReWard**" 14px, "ReWard" bold in `--c-blue`.
- Second line: the tier and the **final** percentage, e.g. "Tier A · 10 % cashback", "Tier A · 12 % cashback, incl. second-hand bonus", or "Tier B · 20 % cashback · Campaign" for an override. Then the tertiary link "Why this product?" that scrolls to the sustainability panel.

### Tier badge *(new)*
Square, 24×24, radius 0, letter 14/700 centred. Scale borrows the familiar energy-label logic:

| Tier | Bg | Text |
|---|---|---|
| A | `#0A8A00` | white (verify ≥ 4.5:1, darken to `#087500` if not) |
| B | `#37B886` | `#111111` |
| C | `#FFDB00` | `#111111` |
| D | `#F26A2F` | `#111111` |
| E | `#DFDFDF` | `#484848` |

Always pair with text ("Tier A"), never colour alone.

### Second-hand badge *(new)*
Styled like IKEA's article-number chip: `--c-black` bg, white 12/700, padding 3px 11px, radius 0. Text: "Second-hand".

### Info box
`--c-grey-50` bg, radius 8, padding 16, 14px text. Bordered variant: white bg, 1px `--c-grey-200`, radius 8.

### Accordion / section rows
Like IKEA PDP "Product details": full-width rows, 1px `--c-grey-200` divider, 16/700 title, chevron-right 24px, 64px row height. Used for "Sustainability breakdown", "Materials", "How ReWard works".

### Tabs
14px text, active tab has 2px `--c-black` bottom border, inactive `--c-text-2`.

### Inputs (admin)
48px high, 1px `--c-grey-500` border, radius 4, 16px text, label 14/700 above. Sliders: native `<input type="range">` styled with black thumb and grey track.

## 6. Imagery and icons

- **Product images:** no IKEA photos. Simple flat SVG silhouettes in `--c-grey-500` on `--c-grey-50`, one style across all products. A second-hand product reuses its new version's SVG.
- **Project site:** team photos, process photos (sticky notes, user tests), our own diagrams. No stock photos of smiling families.
- **Icons:** `lucide-react`, 24px, stroke 2, colour `currentColor`. Only line icons.

## 7. Wordmark

- "IKEA ReWard" set as plain text in Noto Sans 700, 20px, `--c-blue`, with "ReWard" in `--c-black`. *(chosen)*
- Never place it in a yellow oval or a blue rectangle, and never recreate the IKEA logo. That would imitate IKEA's trademark.
- Footer on every page: "IKEA ReWard is a student concept created in the TEK830 Capstone course at Chalmers University of Technology. It is not an IKEA service. All product, price and sustainability data is simulated."

## 8. Tone of voice

IKEA writes short, warm, practical sentences in second person. Copy from IKEA pages: "How to get it", "It's OK to change your mind".

- Do: "Earn 69 points when you choose this one." "Second-hand gives you the most back."
- Don't: "Unlock sustainable savings!" "Revolutionize your shopping experience." "Empower your green journey."

## 9. Anti-patterns (the "looks like AI" list)

Reject a PR if it contains any of these:

- Gradients, glassmorphism, blurred colour blobs, glowing borders.
- Drop shadows on cards or tiles. (Shadows only on overlays: modal, dropdown, toast.)
- Rounded cards or rounded images (radius 12-24). See section 3.
- Fonts other than Noto Sans, or weights other than 400/700.
- Emoji or sparkle icons anywhere in the UI.
- Icons in coloured rounded squares ("feature grid" look).
- Centred paragraphs, centred hero with two buttons side by side.
- Purple, teal, indigo or any colour not in section 1.
- Title Case headings.
- Animated number counters, confetti, parallax, bounce easing.
- Dark mode.
- Placeholder copy like "Lorem ipsum" or buzzwords (see section 8).

## 10. `src/styles/tokens.css`

```css
/* Font: import '@fontsource/noto-sans/latin-400.css' and 'latin-700.css' in main.tsx */

:root {
  /* colour: neutrals */
  --c-white: #ffffff;
  --c-grey-50: #f5f5f5;
  --c-grey-200: #dfdfdf;
  --c-grey-300: #cccccc;
  --c-grey-500: #929292;
  --c-grey-700: #484848;
  --c-black: #111111;
  --c-text-1: #111111;
  --c-text-2: #484848;
  --c-text-3: #767676;
  --c-text-inverse: #ffffff;

  /* colour: brand + semantic */
  --c-blue: #0058a3;
  --c-blue-hover: #004f93;
  --c-blue-pressed: #003e72;
  --c-yellow: #ffdb00;
  --c-green: #0a8a00;
  --c-sustainability: #37b886;
  --c-orange: #f26a2f;
  --c-orange-text: #ca5008;
  --c-red: #e00751;
  --c-price-red: #cc0008;

  /* colour: interactive */
  --c-primary: #111111;
  --c-primary-hover: #333333;
  --c-primary-pressed: #000000;
  --c-secondary-bg: #f5f5f5;
  --c-secondary-bg-hover: #dfdfdf;
  --c-secondary-bg-pressed: #cccccc;
  --c-border-subtle: #929292;
  --c-border-subtle-hover: #111111;
  --c-disabled-bg: #cccccc;
  --c-disabled-text: #929292;

  /* tiers */
  --c-tier-a: #0a8a00;
  --c-tier-b: #37b886;
  --c-tier-c: #ffdb00;
  --c-tier-d: #f26a2f;
  --c-tier-e: #dfdfdf;

  /* typography */
  --font: 'Noto Sans', system-ui, sans-serif;
  --fw-regular: 400;
  --fw-bold: 700;
  --t-display: 700 40px/50px var(--font);
  --t-h1: 700 24px/30px var(--font);
  --t-h2: 700 20px/28px var(--font);
  --t-h3: 700 16px/24px var(--font);
  --t-lead: 400 20px/32px var(--font);
  --t-body-l: 400 16px/24px var(--font);
  --t-body: 400 14px/22px var(--font);
  --t-body-strong: 700 14px/18px var(--font);
  --t-caption: 400 12px/16px var(--font);
  --t-caption-strong: 700 12px/16px var(--font);
  --t-price-l: 700 32px/40px var(--font);
  --t-price-m: 700 28px/28px var(--font);
  --t-price-suffix: 700 14px/14px var(--font);

  /* radius */
  --r-none: 0;
  --r-s: 4px;
  --r-m: 8px;
  --r-pill: 64px;
  --r-circle: 50%;

  /* spacing */
  --s-1: 4px;
  --s-2: 8px;
  --s-3: 12px;
  --s-4: 16px;
  --s-5: 24px;
  --s-6: 32px;
  --s-7: 40px;
  --s-8: 48px;
  --s-9: 64px;
  --s-10: 80px;

  /* sizes */
  --control-l: 56px;
  --control-m: 48px;
  --control-s: 40px;
  --icon: 24px;
  --content-max: 1600px;
  --gutter: 20px;
  --filter-column: 220px;

  /* overlays only (toast, dropdown): never on cards */
  --shadow-overlay: 0 4px 16px rgba(17, 17, 17, 0.2);
  --z-overlay: 50;

  /* motion */
  --ease: cubic-bezier(0.4, 0, 0.4, 1);
  --dur: 200ms;
}

@media (min-width: 600px) { :root { --gutter: 32px; } }
@media (min-width: 1200px) { :root { --gutter: 48px; } }
```

Breakpoints cannot be CSS variables inside media queries; use the literal values `600px`, `900px`, `1200px` and keep them in sync with this doc.
