import { describe, expect, it } from 'vitest';
import { CHAINS, DIMENSIONS, EFFECTS, ORDERS, effect } from './sustainability';

describe('sustainability effects', () => {
  it('has exactly one effect per dimension and order', () => {
    for (const d of DIMENSIONS) {
      for (const o of ORDERS) {
        expect(EFFECTS.filter((e) => e.dimension === d && e.order === o)).toHaveLength(1);
      }
    }
  });

  it('uses unique codes', () => {
    expect(new Set(EFFECTS.map((e) => e.code)).size).toBe(EFFECTS.length);
  });

  it('only chains effects that exist', () => {
    for (const chain of CHAINS) {
      for (const code of chain.steps) expect(effect(code).code).toBe(code);
    }
  });
});
