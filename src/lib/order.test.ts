import { describe, expect, it } from 'vitest';
import defaultModelJson from '../data/defaultModel.json';
import productsJson from '../data/products.json';
import {
  buildCatalogue,
  buildOrder,
  clampRedeem,
  modelKpis,
  nextOrderId,
  summariseBag,
  walletTotals,
} from './cashback';
import type { CashbackModel, Product } from './types';

const products = productsJson as Product[];
const model = defaultModelJson as CashbackModel;
const catalogue = buildCatalogue(products, model, {});

describe('clampRedeem', () => {
  it('clamps to 0..min(balance, subtotal) and to whole points', () => {
    expect(clampRedeem(100, 150, 699)).toBe(100);
    expect(clampRedeem(500, 150, 699)).toBe(150);
    expect(clampRedeem(500, 1000, 300)).toBe(300);
    expect(clampRedeem(-5, 150, 699)).toBe(0);
    expect(clampRedeem(10.7, 150, 699)).toBe(10);
    expect(clampRedeem(Number.NaN, 150, 699)).toBe(0);
    expect(clampRedeem(10, 150, 0)).toBe(0);
  });
});

describe('summariseBag', () => {
  it('sums lines, points per unit x quantity and CO2e', () => {
    const summary = summariseBag(
      [
        { productId: 'stadig-bookcase-80', quantity: 2 },
        { productId: 'stadig-bookcase-80-sh', quantity: 1 },
      ],
      catalogue,
    );
    expect(summary.subtotalSek).toBe(2 * 699 + 350);
    expect(summary.lines[0]!.linePoints).toBe(138);
    expect(summary.pointsEarned).toBe(138 + 42);
    expect(summary.itemCount).toBe(3);
    expect(summary.toPaySek).toBe(1748);
    expect(summary.co2AvoidedPerYearKg).toBeGreaterThan(0);
  });

  it('earns points only on the part paid with money', () => {
    const summary = summariseBag([{ productId: 'stadig-bookcase-80', quantity: 1 }], catalogue, 100);
    // 69 x 599/699 = 59.1 -> 59
    expect(summary.pointsEarned).toBe(59);
    expect(summary.toPaySek).toBe(599);
  });

  it('never redeems more than the subtotal and ignores unknown products', () => {
    const summary = summariseBag(
      [
        { productId: 'steklatt-pan-28', quantity: 1 },
        { productId: 'does-not-exist', quantity: 3 },
      ],
      catalogue,
      1000,
    );
    expect(summary.lines).toHaveLength(1);
    expect(summary.pointsRedeemed).toBe(149);
    expect(summary.pointsEarned).toBe(0);
  });

  it('handles an empty bag', () => {
    const summary = summariseBag([], catalogue, 50);
    expect(summary.subtotalSek).toBe(0);
    expect(summary.pointsRedeemed).toBe(0);
  });
});

describe('buildOrder and walletTotals', () => {
  it('creates an order from a bag summary and totals the wallet', () => {
    const summary = summariseBag(
      [
        { productId: 'stadig-bookcase-80-sh', quantity: 2 },
        { productId: 'gjuten-pan-28', quantity: 1 },
      ],
      catalogue,
      50,
    );
    const order = buildOrder(summary, 'RW-000123', '2026-10-01T10:00:00.000Z');
    expect(order.lines[0]).toMatchObject({
      productId: 'stadig-bookcase-80-sh',
      unitPriceSek: 350,
      finalPct: 12,
      tier: 'A',
      condition: 'secondhand',
    });
    expect(order.paidSek).toBe(summary.subtotalSek - 50);
    const totals = walletTotals([order, { ...order, pointsRedeemed: 0 }]);
    expect(totals.secondhandItems).toBe(4);
    expect(totals.pointsUsed).toBe(50);
    expect(totals.pointsEarned).toBe(order.pointsEarned * 2);
  });

  it('numbers orders from RW-000122', () => {
    expect(nextOrderId([])).toBe('RW-000122');
  });
});

describe('modelKpis', () => {
  it('summarises the catalogue assuming one unit of each product', () => {
    const kpis = modelKpis(products, catalogue.results);
    expect(kpis.cappedCount).toBeGreaterThan(0);
    expect(kpis.shareTierAB).toBeGreaterThan(0);
    expect(kpis.shareTierAB).toBeLessThan(1);
    expect(kpis.marginKeptShare).toBeGreaterThan(0.7);
    expect(kpis.overrideCount).toBe(0);
  });

  it('counts overrides', () => {
    const withOverride = buildCatalogue(products, model, { 'langsam-bookcase-80': 20 });
    expect(modelKpis(products, withOverride.results).overrideCount).toBe(1);
  });

  it('returns zeros for an empty catalogue', () => {
    expect(modelKpis([], new Map())).toEqual({
      averageCashbackPct: 0,
      shareTierAB: 0,
      cappedCount: 0,
      overrideCount: 0,
      cashbackCostShareOfRevenue: 0,
      marginKeptShare: 0,
    });
  });
});
