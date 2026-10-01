# Cashback model

This is the single source of truth for how IKEA ReWard calculates rewards. Everything here is implemented as pure functions in `src/lib/cashback.ts` and covered by tests in `src/lib/cashback.test.ts`. The default parameters live in `src/data/defaultModel.json` and can be changed in the admin panel.

## Overview

```
product impact data ──> factor scores (0-100) ──> weighted sustainability score (0-100)
                                                         │
                                                         v
                                               tier (A-E) ──> base cashback %
                                                         │
                                     + second-hand bonus (percentage points)
                                                         │
                                     capped by margin rule (max share of margin)
                                                         │
                                     admin override (optional, per product)
                                                         v
                                  points = floor(price × final % / 100)   (1 point = 1 SEK)
```

## 1. Input data per product

| Field | Unit | Better when |
|---|---|---|
| `co2Kg` | kg CO2e over the full life cycle | lower |
| `waterL` | litres over the life cycle | lower |
| `energyKWh` | kWh over the life cycle (production + use) | lower |
| `lifespanYears` | expected years of use | higher |
| `transportKm` | km from supplier to Swedish store | lower |
| `repairability` | 0-10 (spare parts, tools needed, modularity) | higher |

All values are **simulated** and must be labelled as such in the UI.

The three resource factors (`co2Kg`, `waterL`, `energyKWh`) are divided by `lifespanYears` before scoring, so a product that lasts twice as long gets credit for it. This reflects the Johan persona (durability, see `SPEC.md` section 1.3) and prevents the model from rewarding cheap, short-lived products.

## 2. Factor scores (0-100)

Scores are relative within a **comparison group** (`product.comparisonGroup`, for example `"bookcase-80"`), because comparing a bookcase to a lamp is meaningless.

For each factor `f` and product `p` in group `G`:

```
lower-is-better:   score_f(p) = 100 × (max_G(f) - f(p)) / (max_G(f) - min_G(f))
higher-is-better:  score_f(p) = 100 × (f(p) - min_G(f)) / (max_G(f) - min_G(f))
```

Edge case: if `max_G(f) == min_G(f)` (one product in the group, or identical values), the factor score is `50`.

Known simplification: because scores are relative, the weakest product in a group always lands near 0, and adding a product to a group can change the others' scores. We accept this for the prototype and disclose it on the project site. A real version would score against absolute category benchmarks from IKEA's LCA data.

## 3. Sustainability score (0-100)

Weighted average of the factor scores, rounded to the nearest integer.

```
score(p) = round( Σ weight_f × score_f(p) / Σ weight_f )
```

Default weights (editable in admin, must be ≥ 0, at least one > 0):

| Factor | Default weight |
|---|---|
| CO2 | 30 |
| Repairability | 20 |
| Lifespan | 20 |
| Water | 10 |
| Energy | 10 |
| Transport | 10 |

## 4. Tier and base cashback

| Tier | Score | Base cashback |
|---|---|---|
| A | 80-100 | 10 % |
| B | 60-79 | 6 % |
| C | 40-59 | 3 % |
| D | 20-39 | 1 % |
| E | 0-19 | 0 % |

Thresholds and percentages are editable in admin. Validation: thresholds strictly descending, percentages non-negative and non-increasing from A to E.

## 5. Second-hand bonus

If `product.condition === "secondhand"`, add `secondhandBonusPct` percentage points (default **5**) on top of the tier percentage. This is the main answer to the overconsumption risk: the most rewarded purchase is the one that needs no new production.

## 6. Margin cap

IKEA must not lose money. Each product has `marginPct` (simulated gross margin in %).

```
maxCashbackPct = marginPct × maxShareOfMargin      (default maxShareOfMargin = 0.4)
finalPct       = min(tierPct + bonus, maxCashbackPct)
capped         = (tierPct + bonus) > maxCashbackPct
```

When `capped` is true, the admin panel shows a caution marker on that product. The customer never sees the cap, only the final percentage.

## 7. Admin override

`overrides[productId]: number | null`. If set, it replaces `finalPct` completely (still shown with an "override" marker in admin). Used for campaigns or pilots. The margin cap does **not** apply to overrides, but admin shows a warning if the override exceeds it.

The tier is still computed from the score, so the customer keeps seeing the honest tier badge. The customer-facing percentage line is labelled "Campaign" when `overridden` is true.

## 8. Points

```
points(p)            = floor(price(p) × finalPct(p) / 100)
priceAfterCashback   = price(p) - points(p)
```

- 1 point = 1 SEK.
- Always round **down** so displayed rewards are never overstated.
- Points are credited to the wallet when an order is placed.
- Points can be redeemed at checkout, up to the full order subtotal.
- Points are only earned on the part of the order paid with money. If a customer pays 200 SEK of a 1 000 SEK order with points, points are earned on 800 SEK, distributed proportionally across the lines. This prevents a reward loop.

Rounding per line, so the card, bag and order always agree and never overstate:

```
linePoints(line)  = quantity × points(p)                       // per unit, then × quantity
paidShare         = (subtotal - pointsRedeemed) / subtotal     // 1 when nothing is redeemed
orderPoints       = Σ floor(linePoints(line) × paidShare)
```

Example: 2 × STADIG earns 2 × 69 = 138 points, not floor(1 398 × 10 %) = 139. Earned points can't be used in the same order.

## 9. Impact figures shown to the customer

For a product `p` in group `G`, with `cheapest = the new product in G with the lowest price` (new only: a second-hand product is often the cheapest in its group, and comparing against it would hide the saving):

```
co2AvoidedPerYear(p) = max(0, co2Kg(cheapest)/lifespan(cheapest) - co2Kg(p)/lifespan(p))
```

Shown as "About X kg CO2e less per year of use than the cheapest alternative". Round to one decimal. Do not show the line when the value is 0 or when `p` is the cheapest.

The wallet sums `co2AvoidedPerYear × quantity` over all purchased lines as "Estimated CO2e avoided per year".

## 10. Worked example (default model)

Comparison group `bookcase-80`, three products:

| Product | Price | Condition | Score | Tier | Tier % | Bonus | Margin | Cap | Final % | Points | After cashback |
|---|---|---|---|---|---|---|---|---|---|---|---|
| LÅNGSAM | 499 | new | 35 | D | 1 | 0 | 45 % | 18 % | 1 | 4 | 495 |
| STADIG | 699 | new | 82 | A | 10 | 0 | 40 % | 16 % | 10 | 69 | 630 |
| STADIG (second-hand) | 350 | secondhand | 91 | A | 10 | 5 | 30 % | 12 % | 12 (capped) | 42 | 308 |

The price gap between the cheap and the durable new bookcase shrinks from 200 SEK to 135 SEK, and the second-hand option becomes the cheapest by far. A unit test must reproduce every column from "Tier" onwards exactly, given the score, price, condition and margin as inputs. When writing `products.json`, tune the impact values so these three products land in the same tiers.

In `products.json` the group has a fourth product (BLÄNKA, high gloss, tier E), and the impact values are tuned so the three products above get exactly the scores 35, 82 and 91. `src/data/catalogue.test.ts` checks this.

## 11. Function signatures

```ts
export type FactorKey = 'co2' | 'water' | 'energy' | 'lifespan' | 'transport' | 'repairability';

export function factorScores(product: Product, group: Product[]): Record<FactorKey, number>;
export function sustainabilityScore(product: Product, group: Product[], model: CashbackModel): number;
export function tierFor(score: number, model: CashbackModel): Tier;
export function cashbackFor(product: Product, group: Product[], model: CashbackModel, override?: number | null): CashbackResult;
export function cashbackFromScore(input: { score; priceSek; condition; marginPct }, model: CashbackModel, override?: number | null): CashbackResult;
export function pointsFor(priceSek: number, pct: number): number;
export function co2AvoidedPerYear(product: Product, group: Product[]): number;
export function linePoints(quantity: number, unitPoints: number): number;
export function orderPoints(lines: { quantity; unitPriceSek; unitPoints }[], pointsRedeemed: number): number;
export function validateModel(model: CashbackModel): ModelError[];
```

`cashbackFromScore` exists so the worked example can be tested from the score directly. The same file also holds the bag, order, wallet and admin KPI calculations (`summariseBag`, `buildOrder`, `walletTotals`, `modelKpis`, `clampRedeem`), so no component calculates points itself.

```ts
interface CashbackResult {
  score: number;
  tier: Tier;             // 'A' | 'B' | 'C' | 'D' | 'E'
  tierPct: number;
  bonusPct: number;
  maxPct: number;
  finalPct: number;
  capped: boolean;
  overridden: boolean;
  points: number;
  priceAfterCashback: number;
  factors: Record<FactorKey, number>;
}
```

## 12. Required tests

- Factor normalisation, including the single-product and identical-values edge cases.
- Weighted score with default and custom weights; all-zero weights rejected.
- Tier boundaries: 19/20, 39/40, 59/60, 79/80, 100.
- Second-hand bonus applied only to second-hand products.
- Margin cap applied and flagged; override bypasses cap and is flagged.
- Points always rounded down.
- Line points = quantity × per-unit points (2 × STADIG = 138).
- Proportional earning when points are redeemed, floored per line; full redemption earns 0.
- Override keeps the tier from the score.
- The worked example in section 10, exact values.
