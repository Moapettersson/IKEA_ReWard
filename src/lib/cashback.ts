// The cashback engine. Single source of truth: docs/CASHBACK-MODEL.md.
// Pure functions only; components never calculate scores, tiers or points themselves.
import type {
  BagLine,
  CashbackModel,
  CashbackResult,
  Condition,
  FactorKey,
  Order,
  Product,
  Tier,
  TierRule,
} from './types';

export const FACTOR_KEYS: readonly FactorKey[] = [
  'co2',
  'water',
  'energy',
  'lifespan',
  'transport',
  'repairability',
];

// Guards against floating point results like 69.99999999 being floored to 69.
const EPSILON = 1e-9;

function floorSafe(value: number): number {
  return Math.floor(value + EPSILON);
}

// Raw value per factor. Resource factors are per year of use (section 1).
function rawFactor(product: Product, key: FactorKey): number {
  const i = product.impact;
  switch (key) {
    case 'co2':
      return i.co2Kg / i.lifespanYears;
    case 'water':
      return i.waterL / i.lifespanYears;
    case 'energy':
      return i.energyKWh / i.lifespanYears;
    case 'lifespan':
      return i.lifespanYears;
    case 'transport':
      return i.transportKm;
    case 'repairability':
      return i.repairability;
  }
}

const HIGHER_IS_BETTER: ReadonlySet<FactorKey> = new Set(['lifespan', 'repairability']);

export function factorScores(product: Product, group: Product[]): Record<FactorKey, number> {
  const scores = {} as Record<FactorKey, number>;
  for (const key of FACTOR_KEYS) {
    const values = group.map((p) => rawFactor(p, key));
    const max = Math.max(...values);
    const min = Math.min(...values);
    const value = rawFactor(product, key);
    if (max === min) {
      scores[key] = 50;
    } else if (HIGHER_IS_BETTER.has(key)) {
      scores[key] = (100 * (value - min)) / (max - min);
    } else {
      scores[key] = (100 * (max - value)) / (max - min);
    }
  }
  return scores;
}

function weightedScore(factors: Record<FactorKey, number>, model: CashbackModel): number {
  const totalWeight = FACTOR_KEYS.reduce((sum, key) => sum + model.weights[key], 0);
  if (totalWeight <= 0) {
    throw new Error('At least one factor weight must be greater than 0.');
  }
  const sum = FACTOR_KEYS.reduce((acc, key) => acc + model.weights[key] * factors[key], 0);
  return Math.round(sum / totalWeight);
}

export function sustainabilityScore(
  product: Product,
  group: Product[],
  model: CashbackModel,
): number {
  return weightedScore(factorScores(product, group), model);
}

function sortedTiers(model: CashbackModel) {
  return [...model.tiers].sort((a, b) => b.minScore - a.minScore);
}

function tierRuleFor(score: number, model: CashbackModel): TierRule {
  const tiers = sortedTiers(model);
  // If the lowest threshold is above the score, the lowest tier still applies.
  return tiers.find((t) => score >= t.minScore) ?? tiers[tiers.length - 1]!;
}

export function tierFor(score: number, model: CashbackModel): Tier {
  return tierRuleFor(score, model).tier;
}

export function pointsFor(priceSek: number, pct: number): number {
  return floorSafe((priceSek * pct) / 100);
}

// Avoids values like 12.000000000000002 from margin × share.
function roundPct(value: number): number {
  return Math.round(value * 100) / 100;
}

export interface ScoreInput {
  score: number;
  priceSek: number;
  condition: Condition;
  marginPct: number;
}

const NEUTRAL_FACTORS: Record<FactorKey, number> = {
  co2: 50,
  water: 50,
  energy: 50,
  lifespan: 50,
  transport: 50,
  repairability: 50,
};

export function cashbackFromScore(
  input: ScoreInput,
  model: CashbackModel,
  override?: number | null,
  factors: Record<FactorKey, number> = NEUTRAL_FACTORS,
): CashbackResult {
  const { tier, pct: tierPct } = tierRuleFor(input.score, model);
  const bonusPct = input.condition === 'secondhand' ? model.secondhandBonusPct : 0;
  const maxPct = roundPct(input.marginPct * model.maxShareOfMargin);
  const uncapped = roundPct(tierPct + bonusPct);
  const overridden = override !== undefined && override !== null;
  const capped = !overridden && uncapped > maxPct;
  const finalPct = overridden ? override : Math.min(uncapped, maxPct);
  const points = pointsFor(input.priceSek, finalPct);
  return {
    score: input.score,
    tier,
    tierPct,
    bonusPct,
    maxPct,
    finalPct,
    capped,
    overridden,
    points,
    priceAfterCashback: input.priceSek - points,
    factors,
  };
}

export function cashbackFor(
  product: Product,
  group: Product[],
  model: CashbackModel,
  override?: number | null,
): CashbackResult {
  const factors = factorScores(product, group);
  return cashbackFromScore(
    {
      score: weightedScore(factors, model),
      priceSek: product.priceSek,
      condition: product.condition,
      marginPct: product.marginPct,
    },
    model,
    override,
    factors,
  );
}

// Section 9: compared with the cheapest *new* product in the group.
export function co2AvoidedPerYear(product: Product, group: Product[]): number {
  const newProducts = group.filter((p) => p.condition === 'new');
  if (newProducts.length === 0) return 0;
  const cheapest = newProducts.reduce((a, b) => (b.priceSek < a.priceSek ? b : a));
  if (cheapest.id === product.id) return 0;
  const diff =
    cheapest.impact.co2Kg / cheapest.impact.lifespanYears -
    product.impact.co2Kg / product.impact.lifespanYears;
  return Math.max(0, Math.round(diff * 10) / 10);
}

export function linePoints(quantity: number, unitPoints: number): number {
  return quantity * unitPoints;
}

export interface PricedLine {
  quantity: number;
  unitPriceSek: number;
  unitPoints: number;
}

export function orderSubtotal(lines: PricedLine[]): number {
  return lines.reduce((sum, l) => sum + l.quantity * l.unitPriceSek, 0);
}

// Section 8: points are only earned on the part paid with money, floored per line.
export function lineEarnedPoints(
  line: PricedLine,
  subtotal: number,
  pointsRedeemed: number,
): number {
  if (subtotal <= 0) return 0;
  const paidShare = (subtotal - pointsRedeemed) / subtotal;
  return floorSafe(linePoints(line.quantity, line.unitPoints) * paidShare);
}

export function orderPoints(lines: PricedLine[], pointsRedeemed: number): number {
  const subtotal = orderSubtotal(lines);
  return lines.reduce((sum, line) => sum + lineEarnedPoints(line, subtotal, pointsRedeemed), 0);
}

export interface ModelError {
  field: 'weights' | 'tiers' | 'secondhandBonusPct' | 'maxShareOfMargin';
  message: string;
}

export function validateModel(model: CashbackModel): ModelError[] {
  const errors: ModelError[] = [];
  const weights = FACTOR_KEYS.map((k) => model.weights[k]);
  if (weights.some((w) => !Number.isFinite(w) || w < 0)) {
    errors.push({ field: 'weights', message: 'Weights must be 0 or more.' });
  } else if (weights.every((w) => w === 0)) {
    errors.push({ field: 'weights', message: 'At least one weight must be more than 0.' });
  }

  const tiers = model.tiers;
  if (tiers.some((t) => !Number.isFinite(t.minScore) || t.minScore < 0 || t.minScore > 100)) {
    errors.push({ field: 'tiers', message: 'Minimum scores must be between 0 and 100.' });
  }
  for (let i = 1; i < tiers.length; i++) {
    if (!(tiers[i]!.minScore < tiers[i - 1]!.minScore)) {
      errors.push({
        field: 'tiers',
        message: `Minimum score for tier ${tiers[i]!.tier} must be lower than for tier ${tiers[i - 1]!.tier}.`,
      });
    }
  }
  if (tiers.some((t) => !Number.isFinite(t.pct) || t.pct < 0)) {
    errors.push({ field: 'tiers', message: 'Cashback percentages must be 0 or more.' });
  }
  for (let i = 1; i < tiers.length; i++) {
    if (tiers[i]!.pct > tiers[i - 1]!.pct) {
      errors.push({
        field: 'tiers',
        message: `Cashback for tier ${tiers[i]!.tier} can't be higher than for tier ${tiers[i - 1]!.tier}.`,
      });
    }
  }

  if (!Number.isFinite(model.secondhandBonusPct) || model.secondhandBonusPct < 0) {
    errors.push({ field: 'secondhandBonusPct', message: 'The bonus must be 0 or more.' });
  }
  if (
    !Number.isFinite(model.maxShareOfMargin) ||
    model.maxShareOfMargin < 0 ||
    model.maxShareOfMargin > 1
  ) {
    errors.push({ field: 'maxShareOfMargin', message: 'The share must be between 0 and 100 %.' });
  }
  return errors;
}

export function groupProducts(products: Product[]): Map<string, Product[]> {
  const groups = new Map<string, Product[]>();
  for (const p of products) {
    const group = groups.get(p.comparisonGroup) ?? [];
    group.push(p);
    groups.set(p.comparisonGroup, group);
  }
  return groups;
}

export function computeCatalogue(
  products: Product[],
  model: CashbackModel,
  overrides: Record<string, number | null>,
): Map<string, CashbackResult> {
  const groups = groupProducts(products);
  const results = new Map<string, CashbackResult>();
  for (const p of products) {
    results.set(p.id, cashbackFor(p, groups.get(p.comparisonGroup)!, model, overrides[p.id]));
  }
  return results;
}

// ---------------------------------------------------------------------------
// Bag, order and wallet calculations (sections 8 and 9)

export interface Catalogue {
  products: Map<string, Product>;
  groups: Map<string, Product[]>;
  results: Map<string, CashbackResult>;
}

export function buildCatalogue(
  products: Product[],
  model: CashbackModel,
  overrides: Record<string, number | null>,
): Catalogue {
  return {
    products: new Map(products.map((p) => [p.id, p])),
    groups: groupProducts(products),
    results: computeCatalogue(products, model, overrides),
  };
}

export interface BagSummaryLine {
  product: Product;
  result: CashbackResult;
  quantity: number;
  lineTotalSek: number;
  linePoints: number;
  pointsEarned: number;
  co2AvoidedPerYearKg: number;
}

export interface BagSummary {
  lines: BagSummaryLine[];
  itemCount: number;
  subtotalSek: number;
  pointsRedeemed: number;
  toPaySek: number;
  pointsEarned: number;
  co2AvoidedPerYearKg: number;
}

export function clampRedeem(requested: number, balance: number, subtotalSek: number): number {
  if (!Number.isFinite(requested)) return 0;
  const max = Math.max(0, Math.min(balance, subtotalSek));
  return Math.min(max, Math.max(0, Math.floor(requested)));
}

function roundKg(value: number): number {
  return Math.round(value * 10) / 10;
}

export function summariseBag(
  bag: BagLine[],
  catalogue: Catalogue,
  pointsRedeemed = 0,
): BagSummary {
  const known = bag.filter((l) => catalogue.products.has(l.productId));
  const priced = known.map((l) => {
    const product = catalogue.products.get(l.productId)!;
    const result = catalogue.results.get(l.productId)!;
    return { line: l, product, result };
  });
  const subtotalSek = orderSubtotal(
    priced.map(({ line, product }) => ({
      quantity: line.quantity,
      unitPriceSek: product.priceSek,
      unitPoints: 0,
    })),
  );
  const redeemed = Math.max(0, Math.min(pointsRedeemed, subtotalSek));
  const lines = priced.map(({ line, product, result }) => {
    const pricedLine = {
      quantity: line.quantity,
      unitPriceSek: product.priceSek,
      unitPoints: result.points,
    };
    const perUnitCo2 = co2AvoidedPerYear(product, catalogue.groups.get(product.comparisonGroup)!);
    return {
      product,
      result,
      quantity: line.quantity,
      lineTotalSek: line.quantity * product.priceSek,
      linePoints: linePoints(line.quantity, result.points),
      pointsEarned: lineEarnedPoints(pricedLine, subtotalSek, redeemed),
      co2AvoidedPerYearKg: roundKg(perUnitCo2 * line.quantity),
    };
  });
  return {
    lines,
    itemCount: lines.reduce((n, l) => n + l.quantity, 0),
    subtotalSek,
    pointsRedeemed: redeemed,
    toPaySek: subtotalSek - redeemed,
    pointsEarned: lines.reduce((n, l) => n + l.pointsEarned, 0),
    co2AvoidedPerYearKg: roundKg(lines.reduce((n, l) => n + l.co2AvoidedPerYearKg, 0)),
  };
}

export function buildOrder(summary: BagSummary, id: string, createdAt: string): Order {
  return {
    id,
    createdAt,
    lines: summary.lines.map((l) => ({
      productId: l.product.id,
      quantity: l.quantity,
      unitPriceSek: l.product.priceSek,
      finalPct: l.result.finalPct,
      tier: l.result.tier,
      condition: l.product.condition,
      pointsEarned: l.pointsEarned,
      co2AvoidedPerYearKg: l.co2AvoidedPerYearKg,
    })),
    subtotalSek: summary.subtotalSek,
    pointsRedeemed: summary.pointsRedeemed,
    paidSek: summary.toPaySek,
    pointsEarned: summary.pointsEarned,
    co2AvoidedPerYearKg: summary.co2AvoidedPerYearKg,
  };
}

export function nextOrderId(orders: Order[]): string {
  return `RW-${(122 + orders.length).toString().padStart(6, '0')}`;
}

export interface WalletTotals {
  pointsEarned: number;
  pointsUsed: number;
  co2AvoidedPerYearKg: number;
  secondhandItems: number;
}

export function walletTotals(orders: Order[]): WalletTotals {
  return {
    pointsEarned: orders.reduce((n, o) => n + o.pointsEarned, 0),
    pointsUsed: orders.reduce((n, o) => n + o.pointsRedeemed, 0),
    co2AvoidedPerYearKg: roundKg(orders.reduce((n, o) => n + o.co2AvoidedPerYearKg, 0)),
    secondhandItems: orders.reduce(
      (n, o) =>
        n + o.lines.filter((l) => l.condition === 'secondhand').reduce((q, l) => q + l.quantity, 0),
      0,
    ),
  };
}

// Admin KPIs (SPEC.md section 5.9). Assumes one unit sold of each product.
export interface ModelKpis {
  averageCashbackPct: number;
  shareTierAB: number;
  cappedCount: number;
  overrideCount: number;
  cashbackCostShareOfRevenue: number;
  marginKeptShare: number;
}

export function modelKpis(products: Product[], results: Map<string, CashbackResult>): ModelKpis {
  const rows = products.map((p) => ({ p, r: results.get(p.id)! }));
  const revenue = rows.reduce((n, { p }) => n + p.priceSek, 0);
  const cashback = rows.reduce((n, { r }) => n + r.points, 0);
  const margin = rows.reduce((n, { p }) => n + (p.priceSek * p.marginPct) / 100, 0);
  const count = rows.length;
  return {
    averageCashbackPct: count ? rows.reduce((n, { r }) => n + r.finalPct, 0) / count : 0,
    shareTierAB: count ? rows.filter(({ r }) => r.tier === 'A' || r.tier === 'B').length / count : 0,
    cappedCount: rows.filter(({ r }) => r.capped).length,
    overrideCount: rows.filter(({ r }) => r.overridden).length,
    cashbackCostShareOfRevenue: revenue ? cashback / revenue : 0,
    marginKeptShare: margin ? (margin - cashback) / margin : 0,
  };
}
