import { defaultModel, products } from '../data';
import { buildCatalogue, buildOrder, summariseBag } from '../lib/cashback';
import type { AppState, CashbackModel } from '../lib/types';

export const STARTING_BALANCE = 150;

// SPEC.md section 4.2: one past order with a second-hand and a new item,
// computed with the engine so it always matches the default model.
function pastOrder(model: CashbackModel) {
  const catalogue = buildCatalogue(products, model, {});
  const summary = summariseBag(
    [
      { productId: 'bjorkdal-bedside-sh', quantity: 1 },
      { productId: 'gjuten-pan-28', quantity: 1 },
    ],
    catalogue,
  );
  return buildOrder(summary, 'RW-000122', '2026-09-12T14:20:00.000Z');
}

export function cloneModel(model: CashbackModel): CashbackModel {
  return {
    weights: { ...model.weights },
    tiers: model.tiers.map((t) => ({ ...t })),
    secondhandBonusPct: model.secondhandBonusPct,
    maxShareOfMargin: model.maxShareOfMargin,
  };
}

export function createDefaultState(): AppState {
  const model = cloneModel(defaultModel);
  return {
    version: 1,
    bag: [],
    wallet: { balance: STARTING_BALANCE, orders: [pastOrder(model)] },
    model,
    overrides: {},
  };
}
