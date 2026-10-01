import { formatPct } from '../lib/format';
import type { CashbackResult, Condition } from '../lib/types';

// Customer-facing cashback line. Always the final %, so it matches the points.
// The margin cap is never mentioned to the customer (CASHBACK-MODEL.md section 6).
export function cashbackLabel(result: CashbackResult, condition: Condition): string {
  const base = `Tier ${result.tier} · ${formatPct(result.finalPct)} cashback`;
  if (result.overridden) return `${base} · Campaign`;
  if (condition === 'secondhand' && result.bonusPct > 0) {
    return `${base}, incl. second-hand bonus`;
  }
  return base;
}
