export type Condition = 'new' | 'secondhand';
export type Tier = 'A' | 'B' | 'C' | 'D' | 'E';
export type FactorKey = 'co2' | 'water' | 'energy' | 'lifespan' | 'transport' | 'repairability';

export interface Category {
  slug: string;
  name: string;
  description: string;
  isPilot: boolean;
}

export interface Impact {
  co2Kg: number;
  waterL: number;
  energyKWh: number;
  lifespanYears: number;
  transportKm: number;
  repairability: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  comparisonGroup: string;
  condition: Condition;
  priceSek: number;
  marginPct: number;
  image: string;
  impact: Impact;
  materials: string;
  secondhandNote?: string;
}

export interface TierRule {
  tier: Tier;
  minScore: number;
  pct: number;
}

export interface CashbackModel {
  weights: Record<FactorKey, number>;
  tiers: TierRule[];
  secondhandBonusPct: number;
  maxShareOfMargin: number;
}

export interface CashbackResult {
  score: number;
  tier: Tier;
  tierPct: number;
  bonusPct: number;
  maxPct: number;
  finalPct: number;
  capped: boolean;
  overridden: boolean;
  points: number;
  priceAfterCashback: number;
  factors: Record<FactorKey, number>;
}

export interface BagLine {
  productId: string;
  quantity: number;
}

export interface OrderLine extends BagLine {
  unitPriceSek: number;
  finalPct: number;
  tier: Tier;
  condition: Condition;
  pointsEarned: number;
  co2AvoidedPerYearKg: number;
}

export interface Order {
  id: string;
  createdAt: string;
  lines: OrderLine[];
  subtotalSek: number;
  pointsRedeemed: number;
  paidSek: number;
  pointsEarned: number;
  co2AvoidedPerYearKg: number;
}

export interface Wallet {
  balance: number;
  orders: Order[];
}

export interface AppState {
  version: 1;
  bag: BagLine[];
  wallet: Wallet;
  model: CashbackModel;
  overrides: Record<string, number | null>;
}
