import { describe, expect, it } from 'vitest';
import { createDefaultState, STARTING_BALANCE } from './defaults';
import { loadState, parseState, saveState, STORAGE_KEY } from './persistence';
import { reducer } from './reducer';

describe('default state', () => {
  it('starts with 150 points and one past order with a second-hand and a new item', () => {
    const state = createDefaultState();
    expect(state.wallet.balance).toBe(STARTING_BALANCE);
    expect(state.wallet.orders).toHaveLength(1);
    const conditions = state.wallet.orders[0]!.lines.map((l) => l.condition);
    expect(conditions).toContain('secondhand');
    expect(conditions).toContain('new');
    expect(state.wallet.orders[0]!.pointsEarned).toBeGreaterThan(0);
  });
});

describe('parseState', () => {
  it('falls back to defaults on missing, corrupt or old storage', () => {
    const defaults = createDefaultState();
    expect(parseState(null)).toEqual(defaults);
    expect(parseState('{not json')).toEqual(defaults);
    expect(parseState('"a string"')).toEqual(defaults);
    expect(parseState(JSON.stringify({ ...defaults, version: 0 }))).toEqual(defaults);
    expect(parseState(JSON.stringify({ ...defaults, model: { weights: {} } }))).toEqual(defaults);
    expect(
      parseState(JSON.stringify({ ...defaults, wallet: { balance: 'x', orders: [] } })),
    ).toEqual(defaults);
  });

  it('rejects a stored model that fails validation', () => {
    const defaults = createDefaultState();
    const bad = {
      ...defaults,
      model: { ...defaults.model, weights: { ...defaults.model.weights, co2: -5 } },
    };
    expect(parseState(JSON.stringify(bad)).model).toEqual(defaults.model);
  });

  it('drops bag lines and overrides for products that no longer exist', () => {
    const stored = {
      ...createDefaultState(),
      bag: [
        { productId: 'stadig-bookcase-80', quantity: 2.7 },
        { productId: 'removed-product', quantity: 1 },
        { productId: 'gjuten-pan-28', quantity: 500 },
        { nonsense: true },
      ],
      overrides: { 'stadig-bookcase-80': 15, 'removed-product': 20, 'gjuten-pan-28': 'x' },
    };
    const state = parseState(JSON.stringify(stored));
    expect(state.bag).toEqual([
      { productId: 'stadig-bookcase-80', quantity: 2 },
      { productId: 'gjuten-pan-28', quantity: 99 },
    ]);
    expect(state.overrides).toEqual({ 'stadig-bookcase-80': 15 });
  });

  it('round-trips through localStorage', () => {
    const state = reducer(createDefaultState(), {
      type: 'ADD_TO_BAG',
      productId: 'stadig-bookcase-80',
      quantity: 1,
    });
    saveState(state);
    expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(loadState().bag).toEqual(state.bag);
  });
});

describe('reducer', () => {
  it('adds, updates, removes and resets', () => {
    let state = createDefaultState();
    state = reducer(state, { type: 'ADD_TO_BAG', productId: 'stadig-bookcase-80', quantity: 1 });
    state = reducer(state, { type: 'ADD_TO_BAG', productId: 'stadig-bookcase-80', quantity: 2 });
    expect(state.bag).toEqual([{ productId: 'stadig-bookcase-80', quantity: 3 }]);
    state = reducer(state, { type: 'SET_QTY', productId: 'stadig-bookcase-80', quantity: 0 });
    expect(state.bag[0]!.quantity).toBe(1);
    state = reducer(state, { type: 'SET_OVERRIDE', productId: 'stadig-bookcase-80', value: 20 });
    expect(state.overrides['stadig-bookcase-80']).toBe(20);
    state = reducer(state, { type: 'SET_OVERRIDE', productId: 'stadig-bookcase-80', value: null });
    expect(state.overrides).toEqual({});
    state = reducer(state, { type: 'REMOVE_LINE', productId: 'stadig-bookcase-80' });
    expect(state.bag).toEqual([]);
    state = reducer(state, { type: 'RESET_DEMO' });
    expect(state).toEqual(createDefaultState());
  });
});
