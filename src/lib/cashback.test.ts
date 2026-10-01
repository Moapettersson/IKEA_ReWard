import { describe, expect, it } from 'vitest';
import defaultModelJson from '../data/defaultModel.json';
import {
  cashbackFor,
  cashbackFromScore,
  co2AvoidedPerYear,
  computeCatalogue,
  factorScores,
  lineEarnedPoints,
  linePoints,
  orderPoints,
  pointsFor,
  sustainabilityScore,
  tierFor,
  validateModel,
} from './cashback';
import type { CashbackModel, Product } from './types';

const model = defaultModelJson as CashbackModel;

function product(overrides: Partial<Product> & { id: string }): Product {
  return {
    name: overrides.id.toUpperCase(),
    description: 'Test product',
    category: 'storage',
    comparisonGroup: 'test',
    condition: 'new',
    priceSek: 100,
    marginPct: 40,
    image: '/images/products/test.svg',
    materials: 'Wood',
    ...overrides,
    impact: {
      co2Kg: 10,
      waterL: 100,
      energyKWh: 10,
      lifespanYears: 10,
      transportKm: 100,
      repairability: 5,
      ...overrides.impact,
    },
  };
}

describe('factorScores', () => {
  const cheap = product({
    id: 'cheap',
    impact: {
      co2Kg: 40,
      waterL: 400,
      energyKWh: 40,
      lifespanYears: 10,
      transportKm: 1000,
      repairability: 2,
    },
  });
  const good = product({
    id: 'good',
    impact: {
      co2Kg: 20,
      waterL: 200,
      energyKWh: 20,
      lifespanYears: 20,
      transportKm: 200,
      repairability: 8,
    },
  });
  const mid = product({
    id: 'mid',
    impact: {
      co2Kg: 30,
      waterL: 300,
      energyKWh: 30,
      lifespanYears: 15,
      transportKm: 600,
      repairability: 5,
    },
  });
  const group = [cheap, good, mid];

  it('gives 100 to the best and 0 to the worst on every factor', () => {
    expect(factorScores(good, group)).toEqual({
      co2: 100,
      water: 100,
      energy: 100,
      lifespan: 100,
      transport: 100,
      repairability: 100,
    });
    expect(factorScores(cheap, group)).toEqual({
      co2: 0,
      water: 0,
      energy: 0,
      lifespan: 0,
      transport: 0,
      repairability: 0,
    });
  });

  it('divides resource factors by lifespan before normalising', () => {
    // per year: cheap 4, good 1, mid 2 -> mid = (4 - 2) / (4 - 1) = 66.67
    const scores = factorScores(mid, group);
    expect(scores.co2).toBeCloseTo(66.667, 2);
    expect(scores.transport).toBeCloseTo(50, 5);
    expect(scores.lifespan).toBeCloseTo(50, 5);
    expect(scores.repairability).toBeCloseTo(50, 5);
  });

  it('returns 50 for every factor in a single-product group', () => {
    const scores = factorScores(cheap, [cheap]);
    expect(Object.values(scores).every((s) => s === 50)).toBe(true);
  });

  it('returns 50 when all products have identical values', () => {
    const twin = product({ id: 'twin', impact: cheap.impact });
    expect(factorScores(cheap, [cheap, twin]).co2).toBe(50);
  });
});

describe('sustainabilityScore', () => {
  const a = product({ id: 'a', impact: { ...product({ id: 'x' }).impact, co2Kg: 10 } });
  const b = product({
    id: 'b',
    impact: { ...product({ id: 'x' }).impact, co2Kg: 20, repairability: 9 },
  });
  const group = [a, b];

  it('is the rounded weighted average with default weights', () => {
    // a: co2 100, repairability 0, rest 50 -> (30*100 + 20*0 + 50*50) / 100 = 55
    expect(sustainabilityScore(a, group, model)).toBe(55);
    // b: co2 0, repairability 100, rest 50 -> (0 + 2000 + 2500) / 100 = 45
    expect(sustainabilityScore(b, group, model)).toBe(45);
  });

  it('uses custom weights', () => {
    const custom: CashbackModel = {
      ...model,
      weights: { co2: 1, water: 0, energy: 0, lifespan: 0, transport: 0, repairability: 0 },
    };
    expect(sustainabilityScore(a, group, custom)).toBe(100);
    expect(sustainabilityScore(b, group, custom)).toBe(0);
  });

  it('rejects all-zero weights', () => {
    const zero: CashbackModel = {
      ...model,
      weights: { co2: 0, water: 0, energy: 0, lifespan: 0, transport: 0, repairability: 0 },
    };
    expect(() => sustainabilityScore(a, group, zero)).toThrow(/weight/i);
  });
});

describe('tierFor', () => {
  it.each([
    [0, 'E'],
    [19, 'E'],
    [20, 'D'],
    [39, 'D'],
    [40, 'C'],
    [59, 'C'],
    [60, 'B'],
    [79, 'B'],
    [80, 'A'],
    [100, 'A'],
  ])('score %i is tier %s', (score, tier) => {
    expect(tierFor(score, model)).toBe(tier);
  });

  it('falls back to the lowest tier when no threshold matches', () => {
    const strict: CashbackModel = {
      ...model,
      tiers: model.tiers.map((t) => (t.tier === 'E' ? { ...t, minScore: 10 } : t)),
    };
    expect(tierFor(5, strict)).toBe('E');
  });
});

describe('cashbackFromScore', () => {
  it('adds the second-hand bonus only to second-hand products', () => {
    const newResult = cashbackFromScore(
      { score: 65, priceSek: 1000, condition: 'new', marginPct: 50 },
      model,
    );
    const shResult = cashbackFromScore(
      { score: 65, priceSek: 1000, condition: 'secondhand', marginPct: 50 },
      model,
    );
    expect(newResult.bonusPct).toBe(0);
    expect(newResult.finalPct).toBe(6);
    expect(shResult.bonusPct).toBe(5);
    expect(shResult.finalPct).toBe(11);
  });

  it('applies and flags the margin cap', () => {
    const result = cashbackFromScore(
      { score: 90, priceSek: 1000, condition: 'new', marginPct: 20 },
      model,
    );
    expect(result.maxPct).toBe(8);
    expect(result.finalPct).toBe(8);
    expect(result.capped).toBe(true);
  });

  it('lets an override bypass the cap and flags it, keeping the tier from the score', () => {
    const result = cashbackFromScore(
      { score: 90, priceSek: 1000, condition: 'new', marginPct: 20 },
      model,
      20,
    );
    expect(result.finalPct).toBe(20);
    expect(result.overridden).toBe(true);
    expect(result.capped).toBe(false);
    expect(result.tier).toBe('A');
    expect(result.points).toBe(200);
  });

  it('treats a null override as no override', () => {
    const result = cashbackFromScore(
      { score: 90, priceSek: 1000, condition: 'new', marginPct: 50 },
      model,
      null,
    );
    expect(result.overridden).toBe(false);
    expect(result.finalPct).toBe(10);
  });
});

describe('pointsFor', () => {
  it('always rounds down', () => {
    expect(pointsFor(699, 10)).toBe(69);
    expect(pointsFor(499, 1)).toBe(4);
    expect(pointsFor(99, 0)).toBe(0);
  });

  it('is not thrown off by floating point error', () => {
    // 0.1 * 3 style errors must not lose a point
    expect(pointsFor(300, 7)).toBe(21);
    expect(pointsFor(1000, 12.000000000000002)).toBe(120);
  });
});

describe('worked example (CASHBACK-MODEL.md section 10)', () => {
  const rows = [
    {
      name: 'LÅNGSAM',
      input: { score: 35, priceSek: 499, condition: 'new' as const, marginPct: 45 },
      expected: {
        tier: 'D',
        tierPct: 1,
        bonusPct: 0,
        maxPct: 18,
        finalPct: 1,
        capped: false,
        points: 4,
        priceAfterCashback: 495,
      },
    },
    {
      name: 'STADIG',
      input: { score: 82, priceSek: 699, condition: 'new' as const, marginPct: 40 },
      expected: {
        tier: 'A',
        tierPct: 10,
        bonusPct: 0,
        maxPct: 16,
        finalPct: 10,
        capped: false,
        points: 69,
        priceAfterCashback: 630,
      },
    },
    {
      name: 'STADIG (second-hand)',
      input: { score: 91, priceSek: 350, condition: 'secondhand' as const, marginPct: 30 },
      expected: {
        tier: 'A',
        tierPct: 10,
        bonusPct: 5,
        maxPct: 12,
        finalPct: 12,
        capped: true,
        points: 42,
        priceAfterCashback: 308,
      },
    },
  ];

  it.each(rows)('$name', ({ input, expected }) => {
    expect(cashbackFromScore(input, model)).toMatchObject(expected);
  });
});

describe('cashbackFor', () => {
  it('combines factor scores, score and cashback for a product in its group', () => {
    const a = product({ id: 'a', priceSek: 1000, marginPct: 50 });
    const result = cashbackFor(a, [a], model);
    expect(result.score).toBe(50);
    expect(result.tier).toBe('C');
    expect(result.points).toBe(30);
    expect(result.factors.co2).toBe(50);
  });
});

describe('co2AvoidedPerYear', () => {
  const cheap = product({
    id: 'cheap',
    priceSek: 100,
    impact: { ...product({ id: 'x' }).impact, co2Kg: 40, lifespanYears: 10 },
  });
  const good = product({
    id: 'good',
    priceSek: 200,
    impact: { ...product({ id: 'x' }).impact, co2Kg: 30, lifespanYears: 20 },
  });
  const sh = product({
    id: 'sh',
    priceSek: 50,
    condition: 'secondhand',
    impact: { ...product({ id: 'x' }).impact, co2Kg: 3, lifespanYears: 12 },
  });
  const worse = product({
    id: 'worse',
    priceSek: 300,
    impact: { ...product({ id: 'x' }).impact, co2Kg: 60, lifespanYears: 10 },
  });
  const group = [good, cheap, sh, worse];

  it('compares with the cheapest new product, rounded to one decimal', () => {
    // 4 - 1.5 = 2.5
    expect(co2AvoidedPerYear(good, group)).toBe(2.5);
    // 4 - 0.25 = 3.75 -> 3.8
    expect(co2AvoidedPerYear(sh, group)).toBe(3.8);
  });

  it('is 0 for the cheapest product itself and never negative', () => {
    expect(co2AvoidedPerYear(cheap, group)).toBe(0);
    expect(co2AvoidedPerYear(worse, group)).toBe(0);
  });

  it('is 0 when the group has no new product', () => {
    expect(co2AvoidedPerYear(sh, [sh])).toBe(0);
  });
});

describe('order points', () => {
  it('counts line points per unit, then multiplies by quantity', () => {
    // 2 x STADIG = 2 x 69, not floor(1398 * 10 %) = 139
    expect(linePoints(2, 69)).toBe(138);
  });

  it('earns full points when nothing is redeemed', () => {
    const lines = [
      { quantity: 2, unitPriceSek: 699, unitPoints: 69 },
      { quantity: 1, unitPriceSek: 350, unitPoints: 42 },
    ];
    expect(orderPoints(lines, 0)).toBe(180);
  });

  it('earns proportionally on the part paid with money, floored per line', () => {
    const lines = [
      { quantity: 1, unitPriceSek: 800, unitPoints: 80 },
      { quantity: 1, unitPriceSek: 200, unitPoints: 21 },
    ];
    // paid share 800 / 1000 = 0.8 -> floor(64) + floor(16.8) = 80
    expect(orderPoints(lines, 200)).toBe(80);
  });

  it('earns nothing when the whole order is paid with points', () => {
    expect(orderPoints([{ quantity: 1, unitPriceSek: 100, unitPoints: 10 }], 100)).toBe(0);
  });

  it('earns nothing for an empty order', () => {
    expect(orderPoints([], 0)).toBe(0);
  });

  it('earns nothing on a zero-priced line instead of dividing by zero', () => {
    expect(lineEarnedPoints({ quantity: 1, unitPriceSek: 0, unitPoints: 0 }, 0, 0)).toBe(0);
  });
});

describe('validateModel', () => {
  it('accepts the default model', () => {
    expect(validateModel(model)).toEqual([]);
  });

  it('rejects weights that are not numbers', () => {
    expect(validateModel({ ...model, weights: { ...model.weights, co2: NaN } })).toContainEqual(
      expect.objectContaining({ field: 'weights' }),
    );
  });

  it('rejects negative weights and all-zero weights', () => {
    expect(validateModel({ ...model, weights: { ...model.weights, co2: -1 } })).toContainEqual(
      expect.objectContaining({ field: 'weights' }),
    );
    const zero = { co2: 0, water: 0, energy: 0, lifespan: 0, transport: 0, repairability: 0 };
    expect(validateModel({ ...model, weights: zero })).toContainEqual(
      expect.objectContaining({ field: 'weights' }),
    );
  });

  it('rejects thresholds that are not strictly descending', () => {
    const tiers = model.tiers.map((t) => (t.tier === 'B' ? { ...t, minScore: 80 } : t));
    expect(validateModel({ ...model, tiers })).toContainEqual(
      expect.objectContaining({ field: 'tiers' }),
    );
  });

  it('rejects increasing or negative percentages', () => {
    const increasing = model.tiers.map((t) => (t.tier === 'C' ? { ...t, pct: 7 } : t));
    expect(validateModel({ ...model, tiers: increasing })).toContainEqual(
      expect.objectContaining({ field: 'tiers' }),
    );
    const negative = model.tiers.map((t) => (t.tier === 'E' ? { ...t, pct: -1 } : t));
    expect(validateModel({ ...model, tiers: negative })).toContainEqual(
      expect.objectContaining({ field: 'tiers' }),
    );
  });

  it('rejects thresholds outside 0-100', () => {
    const tiers = model.tiers.map((t) => (t.tier === 'A' ? { ...t, minScore: 120 } : t));
    expect(validateModel({ ...model, tiers })).toContainEqual(
      expect.objectContaining({ field: 'tiers' }),
    );
  });

  it('rejects a negative bonus and a margin share outside 0-1', () => {
    expect(validateModel({ ...model, secondhandBonusPct: -2 })).toContainEqual(
      expect.objectContaining({ field: 'secondhandBonusPct' }),
    );
    expect(validateModel({ ...model, maxShareOfMargin: 1.5 })).toContainEqual(
      expect.objectContaining({ field: 'maxShareOfMargin' }),
    );
  });
});

describe('computeCatalogue', () => {
  it('scores each product within its own comparison group and applies overrides', () => {
    const a1 = product({
      id: 'a1',
      comparisonGroup: 'a',
      impact: { ...product({ id: 'x' }).impact, co2Kg: 5 },
    });
    const a2 = product({
      id: 'a2',
      comparisonGroup: 'a',
      impact: { ...product({ id: 'x' }).impact, co2Kg: 50 },
    });
    const b1 = product({ id: 'b1', comparisonGroup: 'b' });
    const results = computeCatalogue([a1, a2, b1], model, { a2: 15, b1: null });
    expect(results.get('a1')?.factors.co2).toBe(100);
    expect(results.get('b1')?.score).toBe(50);
    expect(results.get('a2')?.overridden).toBe(true);
    expect(results.get('a2')?.finalPct).toBe(15);
    expect(results.get('b1')?.overridden).toBe(false);
  });
});
