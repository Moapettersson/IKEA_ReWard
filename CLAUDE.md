# CLAUDE.md

Instructions for Claude Code (and humans) working in this repo.

## Read first

Before any task, read in this order:

1. `docs/SPEC.md`
2. `docs/CASHBACK-MODEL.md`
3. `docs/DESIGN.md`

If a task conflicts with these docs, stop and ask. Do not silently change the spec. If a decision changes, update the relevant doc in the same PR.

## Project in one paragraph

IKEA ReWard is a TEK830 student prototype for IKEA. Customers earn points (1 point = 1 SEK) when they buy products, and the cashback percentage depends on a sustainability score, not on the amount spent. Second-hand products get a bonus. IKEA controls the model in an admin panel. The same app also contains the course's project website at `/`.

## Hard rules

- **Language:** all code, comments, commit messages, docs and UI copy in English. Prices in SEK, formatted the IKEA way (`1 299:-`).
- **Stack:** Vite + React 18 + TypeScript (strict) + React Router + CSS Modules. No Tailwind, no shadcn/ui, no MUI, no component libraries. Icons: `lucide-react` is allowed, used at 24px with 2px stroke to stay close to IKEA's line icons.
- **Font:** Noto Sans is self-hosted via `@fontsource/noto-sans`; never load it from Google Fonts.
- **Styling:** only use tokens from `src/styles/tokens.css` (defined in `docs/DESIGN.md`). No hardcoded hex values, font sizes or radii in components.
- **No backend.** Data comes from `src/data/*.json`. User state (bag, wallet, admin settings) is stored in `localStorage` under the key `ikea-reward:v1` via the store in `src/state/`. Always handle missing or corrupt storage by falling back to defaults.
- **Business logic lives in `src/lib/cashback.ts`** as pure functions with unit tests. Components never calculate scores, tiers or points themselves.
- **Branding:** never use the IKEA logo, the "Noto IKEA" font, or real IKEA product photos. Use the ReWard wordmark and placeholder product images as described in `docs/DESIGN.md`. Every page footer shows the "student concept, simulated data" disclaimer.
- **Do not make it look AI-generated.** Follow the "Anti-patterns" list in `docs/DESIGN.md`. When unsure, look at how ikea.com does it and copy the pattern, not the brand.
- **Accessibility:** WCAG 2.1 AA. Keyboard-usable, visible focus rings, semantic HTML, alt text, `aria-live` for bag and points updates.

## Folder structure

```
src/
  main.tsx
  App.tsx                # routes
  styles/
    tokens.css           # design tokens (from DESIGN.md)
    global.css           # reset, base typography, focus styles
  components/            # shared UI: Button, Price, TierBadge, PointsLine, Header, Footer, ...
  features/
    site/                # project website sections (/)
    shop/                # listing, product page, compare
    bag/                 # bag + checkout + confirmation
    rewards/             # wallet
    admin/               # admin panel
  lib/
    cashback.ts          # score, tier, points, margin cap (pure)
    cashback.test.ts
    format.ts            # price and number formatting
  state/
    store.tsx            # React context + useReducer
    persistence.ts       # localStorage load/save with versioning
  data/
    products.json
    categories.json
    defaultModel.json    # default weights, tiers, bonus, caps
public/
  images/products/       # placeholder images
  _redirects             # Netlify SPA fallback
```

## Commands

```bash
npm run dev
npm run build
npm run test
npm run lint
npm run typecheck
```

A PR is ready when `lint`, `typecheck`, `test` and `build` all pass.

## Git workflow

- `main` is protected and always deployable. Netlify deploys `main` to production and every PR to a preview URL.
- Branch names: `feat/<short-name>`, `fix/<short-name>`, `docs/<short-name>`.
- Conventional commits: `feat: add tier badge`, `fix: round points down`.
- Moa owns all milestones and may merge her own PRs once `lint`, `typecheck`, `test` and `build` pass. Teammates review when they can. Link the GitHub issue (`Closes #12`).
- One feature per PR. Keep PRs small enough to review in 10 minutes.

## How Claude Code should work here

- Start each task by stating which milestone and acceptance criteria in `docs/SPEC.md` it covers.
- Write or update tests in `src/lib/` before changing calculation logic.
- After UI work, run the dev server and check the page at 375px, 900px and 1440px widths.
- Never add a dependency without saying why in the PR description.
