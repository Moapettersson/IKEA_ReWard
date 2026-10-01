import { describe, expect, it } from 'vitest';
import { computeCatalogue, groupProducts } from '../lib/cashback';
import type { CashbackModel, Category, Product } from '../lib/types';
import categoriesJson from './categories.json';
import defaultModelJson from './defaultModel.json';
import productsJson from './products.json';

const products = productsJson as Product[];
const categories = categoriesJson as Category[];
const model = defaultModelJson as CashbackModel;
const results = computeCatalogue(products, model, {});

describe('products.json (SPEC.md section 4.1)', () => {
  it('has 24 products, 8 per category, with unique ids', () => {
    expect(products).toHaveLength(24);
    expect(new Set(products.map((p) => p.id)).size).toBe(24);
    for (const c of categories) {
      expect(products.filter((p) => p.category === c.slug)).toHaveLength(8);
    }
  });

  it('gives every comparison group a cheap new, a more sustainable new and a second-hand product', () => {
    for (const group of groupProducts(products).values()) {
      const newOnes = group.filter((p) => p.condition === 'new');
      const cheapest = newOnes.reduce((a, b) => (b.priceSek < a.priceSek ? b : a));
      const cheapestScore = results.get(cheapest.id)!.score;
      expect(newOnes.some((p) => results.get(p.id)!.score > cheapestScore)).toBe(true);
      expect(group.some((p) => p.condition === 'secondhand')).toBe(true);
    }
  });

  it('reproduces the worked example in the bookcase-80 group', () => {
    const row = (id: string) => results.get(id)!;
    expect(row('langsam-bookcase-80')).toMatchObject({ score: 35, tier: 'D', points: 4 });
    expect(row('stadig-bookcase-80')).toMatchObject({ score: 82, tier: 'A', points: 69 });
    expect(row('stadig-bookcase-80-sh')).toMatchObject({
      score: 91,
      tier: 'A',
      finalPct: 12,
      capped: true,
      points: 42,
    });
  });

  it('has at least one capped product with the default model', () => {
    expect([...results.values()].some((r) => r.capped)).toBe(true);
  });

  it('only uses known categories and has a note on every second-hand product', () => {
    const slugs = new Set(categories.map((c) => c.slug));
    for (const p of products) {
      expect(slugs.has(p.category)).toBe(true);
      expect(Number.isInteger(p.priceSek)).toBe(true);
      if (p.condition === 'secondhand') expect(p.secondhandNote).toBeTruthy();
    }
  });
});
