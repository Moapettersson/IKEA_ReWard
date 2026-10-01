import { productById } from '../data';
import { FACTOR_KEYS, validateModel } from '../lib/cashback';
import type { AppState, BagLine, CashbackModel, Order } from '../lib/types';
import { createDefaultState } from './defaults';

// Bump the key and AppState.version together whenever the stored shape changes.
export const STORAGE_KEY = 'ikea-reward:v1';
export const MAX_QUANTITY = 99;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function parseModel(value: unknown): CashbackModel | null {
  if (!isRecord(value) || !isRecord(value.weights) || !Array.isArray(value.tiers)) return null;
  const weights = value.weights;
  if (!FACTOR_KEYS.every((k) => isNumber(weights[k]))) return null;
  const tiers: unknown[] = value.tiers;
  if (tiers.length !== 5) return null;
  if (!tiers.every((t) => isRecord(t) && isNumber(t.minScore) && isNumber(t.pct))) return null;
  if (!isNumber(value.secondhandBonusPct) || !isNumber(value.maxShareOfMargin)) return null;
  const model = value as unknown as CashbackModel;
  return validateModel(model).length === 0 ? model : null;
}

function parseBag(value: unknown): BagLine[] {
  if (!Array.isArray(value)) return [];
  const lines: BagLine[] = [];
  for (const l of value as unknown[]) {
    if (
      isRecord(l) &&
      typeof l.productId === 'string' &&
      productById.has(l.productId) &&
      isNumber(l.quantity)
    ) {
      lines.push({
        productId: l.productId,
        quantity: Math.min(MAX_QUANTITY, Math.max(1, Math.floor(l.quantity))),
      });
    }
  }
  return lines;
}

function parseOverrides(value: unknown): Record<string, number | null> {
  if (!isRecord(value)) return {};
  const out: Record<string, number | null> = {};
  for (const [id, v] of Object.entries(value)) {
    if (productById.has(id) && isNumber(v) && v >= 0) out[id] = v;
  }
  return out;
}

function parseOrders(value: unknown): Order[] | null {
  if (!Array.isArray(value)) return null;
  const valid = (value as unknown[]).every(
    (o) =>
      isRecord(o) &&
      typeof o.id === 'string' &&
      Array.isArray(o.lines) &&
      isNumber(o.pointsEarned) &&
      isNumber(o.pointsRedeemed),
  );
  return valid ? (value as Order[]) : null;
}

// Never crashes: missing, corrupt or old storage falls back to defaults.
export function parseState(raw: string | null): AppState {
  const defaults = createDefaultState();
  if (!raw) return defaults;
  try {
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data) || data.version !== 1 || !isRecord(data.wallet)) return defaults;
    const model = parseModel(data.model);
    const orders = parseOrders(data.wallet.orders);
    if (!model || !orders || !isNumber(data.wallet.balance)) return defaults;
    return {
      version: 1,
      bag: parseBag(data.bag),
      wallet: { balance: Math.max(0, Math.floor(data.wallet.balance)), orders },
      model,
      overrides: parseOverrides(data.overrides),
    };
  } catch {
    return defaults;
  }
}

export function loadState(): AppState {
  try {
    return parseState(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return createDefaultState();
  }
}

export function saveState(state: AppState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be full or blocked (private mode). The demo keeps working in memory.
  }
}
