import type { AppState, CashbackModel, Order } from '../lib/types';
import { createDefaultState } from './defaults';
import { MAX_QUANTITY } from './persistence';

export type Action =
  | { type: 'ADD_TO_BAG'; productId: string; quantity: number }
  | { type: 'SET_QTY'; productId: string; quantity: number }
  | { type: 'REMOVE_LINE'; productId: string }
  | { type: 'PLACE_ORDER'; order: Order }
  | { type: 'SET_MODEL'; model: CashbackModel }
  | { type: 'SET_OVERRIDE'; productId: string; value: number | null }
  | { type: 'RESET_DEMO' };

function clampQty(quantity: number): number {
  return Math.min(MAX_QUANTITY, Math.max(1, Math.floor(quantity)));
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TO_BAG': {
      const existing = state.bag.find((l) => l.productId === action.productId);
      const bag = existing
        ? state.bag.map((l) =>
            l.productId === action.productId
              ? { ...l, quantity: clampQty(l.quantity + action.quantity) }
              : l,
          )
        : [...state.bag, { productId: action.productId, quantity: clampQty(action.quantity) }];
      return { ...state, bag };
    }
    case 'SET_QTY':
      return {
        ...state,
        bag: state.bag.map((l) =>
          l.productId === action.productId ? { ...l, quantity: clampQty(action.quantity) } : l,
        ),
      };
    case 'REMOVE_LINE':
      return { ...state, bag: state.bag.filter((l) => l.productId !== action.productId) };
    case 'PLACE_ORDER':
      return {
        ...state,
        bag: [],
        wallet: {
          balance: state.wallet.balance - action.order.pointsRedeemed + action.order.pointsEarned,
          orders: [action.order, ...state.wallet.orders],
        },
      };
    case 'SET_MODEL':
      return { ...state, model: action.model };
    case 'SET_OVERRIDE': {
      const overrides = { ...state.overrides };
      if (action.value === null) delete overrides[action.productId];
      else overrides[action.productId] = action.value;
      return { ...state, overrides };
    }
    case 'RESET_DEMO':
      return createDefaultState();
  }
}
