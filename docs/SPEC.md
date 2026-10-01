# Technical specification: IKEA ReWard

Version 1.1, 2026-09-30 (decisions from the spec review folded in). Owner: Group 12, TEK830 Capstone, Chalmers.

## 1. Context

### 1.1 The challenge
IKEA Challenge 1: *Make sustainable affordability the engine of growth.* Problem statement: "How can IKEA make sustainable choices the most affordable choice while continuing to grow and reducing total climate impact?"

### 1.2 The idea
A cashback system paid out as points (1 point = 1 SEK). The cashback percentage is set by the product's **sustainability score**, not by the amount spent. Second-hand products get a bonus on top, so reuse is always the most rewarded choice. IKEA tunes the model (weights, tiers, bonus, margin cap) in an admin panel so it stays profitable.

### 1.3 Primary user
**Maria, single mother of two.** Lives on a tight budget and cares about the environment because she wants a good future for her children. She needs new furniture and goes to IKEA, but has to find something that is good quality, doesn't take her whole budget, and is sustainable. Today the cheapest option usually wins. ReWard should make her see, at the moment of choosing, that the more sustainable option costs less than she thought, and that second-hand costs the least. (Same persona as in our pitch.)

Secondary persona: **Johan**, buys once and keeps things for a long time; cares about durability and repairability. He is why resource factors are divided by lifespan in the model (`CASHBACK-MODEL.md` section 1).

Secondary user: **IKEA category/commercial manager** who sets the cashback model in the admin panel and needs to see margin impact.

### 1.4 Course deliverables this repo covers

| Course requirement | Where |
|---|---|
| Working software prototype, at least one interactive core feature | `/demo` (shop flow) and `/demo/admin` |
| Simulated or sample data | `src/data/*.json`, labelled as simulated |
| Project website: problem, solution, features, how users interact | `/` |
| Final slides + short pitch video | `/` section "Pitch" (embedded) |
| Embedded prototype or demo video | `/` section "Try the prototype" (link + demo video) |
| Summary, team info, contact, references, GenAI statement | `/` sections |
| "Show what's real vs conceptual" | "Simulated" note in the prototype section and disclaimer on every page |

## 2. Scope

### In scope (v1)
- Project website at `/`.
- Customer demo: category listing, product page, bag, checkout with points redemption, order confirmation, rewards wallet.
- Admin panel: edit model parameters, per-product overrides, see scores/tiers/caps and aggregate impact.
- Deterministic calculation engine with unit tests.
- Deploy to Netlify, public URL.

### Out of scope (v1)
- Chrome extension (dropped; mentioned as a future integration on the project site).
- Real IKEA data, real accounts, login, payments, backend, database.
- Swedish language version.
- Side-by-side compare view (backlog, see section 11).

## 3. Architecture

```
Browser (single-page app, Vite build, static hosting on Netlify)
│
├── React Router
│   ├── /                    Project website (features/site)
│   └── /demo/*              Prototype (features/shop, bag, rewards, admin)
│
├── State: React Context + useReducer (state/store.tsx)
│   └── persisted to localStorage "ikea-reward:v1" (state/persistence.ts)
│
├── Logic: lib/cashback.ts (pure, tested), lib/format.ts
│
└── Data: data/products.json, categories.json, defaultModel.json (bundled at build time)
```

- **Stack:** Vite, React 18, TypeScript (strict), React Router v6, CSS Modules, Vitest + React Testing Library, ESLint + Prettier, `lucide-react`.
- No backend. Everything is computed in the browser from bundled JSON plus the admin model in state.
- Cashback results are derived with `useMemo` from `(products, model, overrides)`; never stored.

## 4. Data model

```ts
type Condition = 'new' | 'secondhand';
type Tier = 'A' | 'B' | 'C' | 'D' | 'E';

interface Category {
  slug: string;              // 'storage'
  name: string;              // 'Storage & organisation'
  description: string;
  isPilot: boolean;          // true for 'storage', shown as "Pilot category"
}

interface Product {
  id: string;                // 'stadig-bookcase-80-sh'
  name: string;              // 'STADIG' (invented, uppercase)
  description: string;       // 'Bookcase, white, 80x28x202 cm'
  category: string;          // Category.slug
  comparisonGroup: string;   // 'bookcase-80'
  condition: Condition;
  priceSek: number;          // integer
  marginPct: number;         // simulated gross margin, 0-100
  image: string;             // '/images/products/stadig-bookcase-80.svg'
  impact: {
    co2Kg: number;
    waterL: number;
    energyKWh: number;
    lifespanYears: number;
    transportKm: number;
    repairability: number;   // 0-10
  };
  materials: string;         // 'Solid pine, water-based lacquer'
  secondhandNote?: string;   // 'Small scratch on the left side. Checked and cleaned by IKEA.'
}

interface CashbackModel {
  weights: Record<FactorKey, number>;
  tiers: { tier: Tier; minScore: number; pct: number }[];   // A..E
  secondhandBonusPct: number;
  maxShareOfMargin: number;                                 // 0-1
}

interface BagLine { productId: string; quantity: number; }

interface Order {
  id: string;                 // 'RW-000123'
  createdAt: string;          // ISO
  lines: (BagLine & {
    unitPriceSek: number;
    finalPct: number;
    tier: Tier;
    condition: Condition;          // for the wallet's second-hand count
    pointsEarned: number;
    co2AvoidedPerYearKg: number;
  })[];
  subtotalSek: number;
  pointsRedeemed: number;
  paidSek: number;
  pointsEarned: number;
  co2AvoidedPerYearKg: number;
}

interface AppState {
  version: 1;
  bag: BagLine[];
  wallet: { balance: number; orders: Order[] };
  model: CashbackModel;
  overrides: Record<string, number | null>;
}
```

### 4.1 Catalogue (products.json)

24 products, 3 categories, 8 per category: **2 comparison groups of 4 products each**. Every group contains a cheap new product, a more sustainable new product, a second-hand version of the sustainable one, and a new product that looks good but scores poorly (high gloss, glass, velvet, shipped far). The fourth product means the cheap one isn't automatically the weakest in its group, so it lands in tier C/D like the worked example.

| Category | Comparison groups |
|---|---|
| Storage & organisation (**pilot**) | bookcase-80, chest-of-drawers |
| Bedroom | bed-frame-160, bedside-table |
| Kitchen & dining | dining-table-4, frying-pan |

(3 groups × 3 products per category would need 9 products, which contradicts 8 per category. A second-hand duvet was also dropped for hygiene reasons.)

Rules:
- Invented Swedish-sounding product names (not real IKEA names) so nobody mistakes simulated data for real LCA figures.
- Prices realistic for IKEA Sweden.
- The `bookcase-80` group must reproduce the worked example in `CASHBACK-MODEL.md` section 10.
- At least one product must hit the margin cap with the default model, so the admin demo can show it.
- Second-hand impact values cover only the **remaining life**: `co2Kg`, `waterL`, `energyKWh` are refurbishment + transport only (roughly 10-20 % of the new version), `lifespanYears` is the remaining expected life (roughly 60 % of new), `repairability` is unchanged.
- Scores are relative within a comparison group (see `CASHBACK-MODEL.md` section 2). This is a known simplification of the prototype.
- A second-hand product reuses the SVG image of its new version.

### 4.2 Default wallet
A fresh demo starts with **150 points** and one past order, so the wallet and redemption are demoable immediately. "Reset demo" restores this.

The past order contains one second-hand and one new product, so every wallet total (points, CO2e, second-hand items) is non-zero on first view. Its lines, points and CO2e are computed with the engine and the default model when defaults are built, not hardcoded.

## 5. Routes and screens

All `/demo/*` screens share the demo header and footer (see `DESIGN.md` section 5).

### 5.1 `/` Project website

Single long page with anchor navigation, sections in this order. Copy in English, IKEA tone of voice. **Keep text short:** one or two sentences per point (team feedback 2026-10-01).

1. **Hero:** centred. Product name, one-line value proposition, one large blue "Try the prototype" button → `/demo`, and a small "Watch the pitch" text link → #pitch (one button only, to avoid the "centred hero with two buttons" anti-pattern).
2. **The problem:** the challenge question and Maria's situation in two sentences.
3. **Our solution:** 3 steps (score → cashback → points), the worked example table, and three short sustainability points (less climate impact, reuse first, still profitable).
4. **Try the prototype:** two sentences + "simulated data" note, screenshot, links to `/demo` and `/demo/admin`, and two feature screenshots (customer and IKEA) with one line each.
5. **Pitch:** slides (Canva embed) and pitch video only, no text. Required by the course. `id="pitch"`.
6. **Team:** 5 members (Moa Pettersson, Sofia Nguyen, Isak Treptow, Sara Salam, Max Fägersten): photo and name only. Missing photos show a grey square with initials.
7. **References:** numbered list of sources.
8. **Use of generative AI:** one short paragraph: Claude helped with code, brainstorming and correcting text; the team reviewed everything. Required by the course.
9. **Contact:** moapett@chalmers.se + footer disclaimer.

Removed on 2026-10-01 to keep the focus: separate Features, Sustainability impact, Real vs simulated, Process and Next steps sections. Sustainability now lives in "Our solution", and "simulated" is stated in the prototype section, the demo utility bar and the footer.

Content comes from the team's worksheet and pitch script. Nothing is invented: claims we cannot back up are marked TODO in the source until the team confirms them.

### 5.2 `/demo` Demo home
- Short intro box: "You are Maria. You have 150 points. Find a bookcase for the kids' room." (sets up the user test task).
- Category chips (3 categories, storage marked "Pilot").
- "Highest rewards right now": 4 product cards with tier A or second-hand.
- "Reset demo" secondary button.

### 5.3 `/demo/category/:slug` Listing
- Title, item count, simple filters on the left from 900px (Condition: new/second-hand; Tier: A-E; checkboxes), sort (Recommended, Price low-high, Most points).
- Product cards as in `DESIGN.md` 5 "Product card", in a plain grid like IKEA.
- Clicking the blue circle adds 1 to bag with a toast "Added to bag · +69 points".

### 5.4 `/demo/product/:id` Product page
Two-column layout from 900px (image left ~60 %, buy box right), stacked below.

Buy box, top to bottom:
1. Second-hand badge if relevant.
2. Name (16/700) + description.
3. Price (`--t-price-l`), line under it: "630:- after cashback".
4. Tier badge + "Sustainability score 82/100".
5. Quantity stepper + blue "Add to shopping bag" (56px).
6. **ReWard points line** (see `DESIGN.md`).
7. Info box "Other options in this group": the other products in the same comparison group, each with price, price after cashback and tier, sorted by price after cashback. If a second-hand version exists, show it first. The option with the highest cashback percentage (if higher than this product's) is flagged "Highest cashback". (Not "Most points back": a cheaper second-hand product can earn fewer points in absolute terms, e.g. 42 vs 69.)

The points line always shows the **final** percentage, so it matches the points: "Tier A · 12 % cashback, incl. second-hand bonus". The margin cap is never mentioned to the customer. If an admin override is set, the tier badge still shows the tier from the score, and the line shows "20 % cashback · Campaign".

Below, accordion rows:
- **Sustainability breakdown:** six horizontal bars (0-100) for each factor score with the raw value next to it ("CO2e: 38 kg over 25 years"), and the line "About X kg CO2e less per year of use than the cheapest alternative".
- **How your cashback is calculated:** score → tier → % → points, in plain words, with this product's numbers.
- **Materials** and, for second-hand, the condition note.
- Every panel ends with "Simulated data for this prototype."

### 5.5 `/demo/bag` Bag
- Lines with image, name, price, tier, points per line, quantity stepper, remove.
- Summary box: subtotal, "Points you'll earn", "Estimated CO2e avoided per year".
- Blue "Continue to checkout".
- Empty state: "Your bag is empty" + link back to categories.

### 5.6 `/demo/checkout` Checkout
- No personal data fields (nothing to fill in, it's a simulation). Show a fixed "Delivery to: Maria, Gothenburg" info box.
- **Use points:** toggle + input (0 to min(balance, subtotal)), default off.
- Summary: subtotal, points used (−), to pay, points earned (recalculated per `CASHBACK-MODEL.md` section 8).
- Blue "Place order (simulated)". Creates an `Order`, clears bag, updates wallet, navigates to confirmation.

### 5.7 `/demo/order/:id` Confirmation
- "Thank you, Maria" + order number.
- Big but calm figure: "+123 points" and new balance.
- CO2e avoided per year for this order.
- Links: "See your rewards", "Keep shopping".

### 5.8 `/demo/rewards` Wallet
- Balance (large number + "= 1 240 SEK to use on your next purchase").
- Totals: points earned all time, points used, estimated CO2e avoided per year, number of second-hand items bought.
- Order history table: date, order no, items, paid, points earned/used.
- "How ReWard works" explainer (tiers table with current model percentages, second-hand bonus), with `id="how-it-works"`. The "How it works" nav link points to `/demo/rewards#how-it-works`.

### 5.9 `/demo/admin` Admin panel
Label at top: "Admin view: how IKEA would manage ReWard". No login.

Layout: left column settings, right column live results. From 1200px side by side, stacked below.

**Settings**
- Factor weights: 6 sliders 0-50 with number input, and the normalised share shown ("CO2 30 → 30 %").
- Tiers: table with min score and cashback % per tier, validated as in `CASHBACK-MODEL.md` section 4 (inline error, save disabled when invalid).
- Second-hand bonus (percentage points), max share of margin (0-100 %).
- Buttons: black "Save model", secondary "Restore defaults". Unsaved changes are a draft local to the admin page: the results column previews them with a note "Preview, not saved". The shop only uses the saved model.

**Results**
- KPI row: average cashback %, share of catalogue in tier A/B, number of capped products, estimated cashback cost as % of revenue, average share of gross margin kept after cashback (both assume one unit sold of each product; label the assumption).
- Product table: name, condition, price, margin, score, tier, tier %, bonus, cap, final %, points, flags (capped / override). Sortable by column, filter by category.
- Per-row override: number input, empty = no override. Warning icon + text when override > cap.

### 5.10 Shared demo elements
- Utility bar with disclaimer and current balance on every `/demo` page.
- Footer disclaimer (DESIGN.md section 7) on every page including `/`.
- `aria-live="polite"` region announcing "Added to bag" and points changes.
- 404 page in IKEA tone: "We can't find that page" + link to `/demo`.
- "Give feedback" link in the utility bar to the team's Google Form (URL in one config constant), opens in a new tab. Used during the weekly user tests; can be removed before the final deploy.

### 5.11 `/demo/search?q=` Search
- The header search field submits here. Case-insensitive match on product name and description across all products.
- Same card grid as the listing, title "Results for “q”" + count. Empty state: "We couldn't find anything for “q”" + category chips.

### 5.12 `/demo/styleguide` Styleguide
- Shows the M1 components with their variants. Included in the production build but not linked from any navigation.

## 6. State and persistence

- One `StoreProvider` wrapping the app. Actions: `ADD_TO_BAG`, `SET_QTY`, `REMOVE_LINE`, `PLACE_ORDER`, `SET_MODEL`, `SET_OVERRIDE`, `RESET_DEMO`.
- Save to `localStorage` on every state change (debounced 300 ms). Key `ikea-reward:v1`, value `AppState` as JSON.
- On load: parse inside try/catch; if missing, invalid or `version !== 1`, start from defaults. Never crash on bad storage.
- On load, also sanitise: drop bag lines and overrides whose product ID no longer exists in `products.json`. Bump `version` (and the storage key) whenever the shape of `AppState` or `defaultModel.json` changes, so old storage falls back to defaults.
- The admin and the shop share the same saved model. Saving in admin changes points in the shop immediately (switch tab to show it). This is a key demo moment. Unsaved admin edits never reach the shop.

## 7. Non-functional requirements

| Area | Requirement |
|---|---|
| Accessibility | WCAG 2.1 AA: contrast, keyboard navigation, visible focus (2px solid `--c-black`, 2px offset), labels on all inputs, alt text, tier never conveyed by colour alone |
| Responsive | Works at 375, 600, 900, 1200, 1440 px. No horizontal scroll |
| Performance | Lighthouse performance ≥ 90 on `/demo` desktop. Images are SVG or ≤ 150 kB WebP |
| Browsers | Latest Chrome, Safari, Firefox, Edge; iOS Safari |
| Reliability | Demo works offline after first load is nice-to-have, not required. No runtime network calls except embedded video and slides. Fonts are self-hosted via `@fontsource/noto-sans` (400 and 700, latin), not loaded from Google |
| Code quality | TypeScript strict, no `any`, ESLint clean, calculation logic 100 % branch coverage |

## 8. Deployment

- Netlify connected to the GitHub repo. Build `npm run build`, publish `dist`.
- `public/_redirects` with `/* /index.html 200` for client-side routing.
- `main` → production URL (for the course and IKEA). PRs → deploy previews, link posted in the PR.
- Suggested site name: `ikea-reward-team12.netlify.app` (follows naming from previous years).

## 9. Testing

- **Unit:** `lib/cashback.test.ts` per `CASHBACK-MODEL.md` section 12; `lib/format.test.ts` (`1299` → `1 299:-` with NBSP).
- **Component:** Price, TierBadge, PointsLine render correct values; checkout redeem input clamps to min(balance, subtotal).
- **Flow (RTL):** add product → bag → checkout with 100 points → confirmation shows correct points earned → wallet balance updated.
- **Manual before each user test:** run through the Maria task on phone and desktop.

## 10. Milestones

Owner of all milestones: Moa Pettersson. Teammates review when they can.

**First website deadline: 2026-10-08.** Live on that date: M0, the tokens and global styles from M1, and the project website (M5) with all 9 sections. Sections without content yet show clearly marked placeholders, and "Try the prototype" says "Coming soon". The engine, demo and admin (M2-M4) follow after. Later course dates: TODO.

| # | Milestone | Done when | Target |
|---|---|---|---|
| M0 | Repo setup | Vite + TS + router + ESLint/Prettier + Vitest + Netlify deploy of "hello" page; branch protection on | 2026-10-08 |
| M1 | Design foundation | `tokens.css`, `global.css`, Noto Sans, Button, Price, TierBadge, SecondhandBadge, InfoBox, Accordion, Header, Footer built and shown on `/demo/styleguide` (tokens + global styles by 2026-10-08) | partly 2026-10-08 |
| M2 | Engine + data | `cashback.ts` with all tests green, `products.json` (24 products) matching section 4.1 rules | TODO |
| M3 | Customer flow | 5.2 to 5.8, 5.11 working end to end with persistence | TODO |
| M4 | Admin | 5.9 working, saved changes reflected in shop | TODO |
| M5 | Project website | All 9 sections of 5.1 with real content, video and slides embedded | first version 2026-10-08 |
| M6 | Polish | Accessibility pass, responsive pass, anti-pattern check (`DESIGN.md` section 9), first user test done and fixes merged | TODO |

Create one GitHub issue per screen/component with the acceptance criteria copied from this spec.

## 11. Backlog (not v1)

- Compare view: cheapest vs most sustainable side by side with the price gap before and after cashback.
- Swedish UI via i18n.
- Chrome extension that overlays ReWard on ikea.com.
- Real data import (CSV upload of LCA values in admin).
- Points expiry and redemption rules for IKEA Family integration.

## 12. Open questions

1. Course deadlines after 2026-10-08 (prototype, final website, final pitch).
2. Final pitch video: where it will be hosted (unlisted YouTube suggested). Slides are in Canva ("First Pitch_Team12"); the design must be shared as "Anyone with the link" to embed it.
3. Team photos.
4. Google Form URL for the feedback link.

Resolved on 2026-09-30: product images are flat SVG silhouettes; contact is moapett@chalmers.se; there is a feedback link in the demo.
