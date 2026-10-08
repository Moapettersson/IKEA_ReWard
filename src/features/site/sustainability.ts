// Sustainability effects of ReWard, following the Sustainability Awareness Framework (SusAF).
// The texts build on the five dimensions from the first version of the site.
// TODO(team): confirm the effects and the likelihood and impact ratings.
import { defaultModel } from '../../data';
import { formatPct } from '../../lib/format';

export type Dimension = 'Individual' | 'Social' | 'Environmental' | 'Economic' | 'Technical';
export type Order = 'Immediate' | 'Enabling' | 'Structural';
export type Likelihood = 'Low' | 'Medium' | 'High';
export type Impact = 'Large positive' | 'Small positive' | 'Small negative' | 'Large negative';

export interface Effect {
  code: string;
  dimension: Dimension;
  order: Order;
  text: string;
  likelihood: Likelihood;
  impact: Impact;
}

export const DIMENSIONS: Dimension[] = [
  'Individual',
  'Social',
  'Environmental',
  'Economic',
  'Technical',
];
export const ORDERS: Order[] = ['Immediate', 'Enabling', 'Structural'];
export const LIKELIHOODS: Likelihood[] = ['Low', 'Medium', 'High'];
export const IMPACTS: Impact[] = [
  'Large positive',
  'Small positive',
  'Small negative',
  'Large negative',
];

const cap = formatPct(defaultModel.maxShareOfMargin * 100);

export const EFFECTS: Effect[] = [
  {
    code: 'I1',
    dimension: 'Individual',
    order: 'Immediate',
    text: 'People on a tight budget can afford the sustainable option, because the price after cashback is shown when they choose.',
    likelihood: 'High',
    impact: 'Large positive',
  },
  {
    code: 'I2',
    dimension: 'Individual',
    order: 'Enabling',
    text: 'The open score teaches people what makes a product last.',
    likelihood: 'Medium',
    impact: 'Small positive',
  },
  {
    code: 'I3',
    dimension: 'Individual',
    order: 'Structural',
    text: 'Purchases are linked to a loyalty account. Without clear consent this is a privacy risk.',
    likelihood: 'Medium',
    impact: 'Small negative',
  },
  {
    code: 'S1',
    dimension: 'Social',
    order: 'Immediate',
    text: 'Everyone can use it with the same rules, so no group is left out.',
    likelihood: 'High',
    impact: 'Small positive',
  },
  {
    code: 'S2',
    dimension: 'Social',
    order: 'Enabling',
    text: "Showing the score and the calculation openly builds trust in IKEA's sustainability claims.",
    likelihood: 'Medium',
    impact: 'Small positive',
  },
  {
    code: 'S3',
    dimension: 'Social',
    order: 'Structural',
    text: 'The sustainable choice stops being something only some households can afford.',
    likelihood: 'Low',
    impact: 'Large positive',
  },
  {
    code: 'En1',
    dimension: 'Environmental',
    order: 'Immediate',
    text: 'Purchases shift towards products with lower impact per year of use, and towards second-hand.',
    likelihood: 'High',
    impact: 'Large positive',
  },
  {
    code: 'En2',
    dimension: 'Environmental',
    order: 'Enabling',
    text: 'Products are used for longer and more furniture is reused, so less new is produced.',
    likelihood: 'Medium',
    impact: 'Large positive',
  },
  {
    code: 'En3',
    dimension: 'Environmental',
    order: 'Structural',
    text: 'Cashback is an incentive to buy more in general. The reward follows the score, not the amount, and second-hand always gives the most back.',
    likelihood: 'Medium',
    impact: 'Large negative',
  },
  {
    code: 'Ec1',
    dimension: 'Economic',
    order: 'Immediate',
    text: 'Customers get value back as points, which can only be spent at IKEA.',
    likelihood: 'High',
    impact: 'Small positive',
  },
  {
    code: 'Ec2',
    dimension: 'Economic',
    order: 'Enabling',
    text: 'Customers come back more often. Loyalty members spend more than non-members (Accenture, 2016).',
    likelihood: 'Medium',
    impact: 'Large positive',
  },
  {
    code: 'Ec3',
    dimension: 'Economic',
    order: 'Structural',
    text: `Lower margin on some products. Cashback never takes more than ${cap} of a product's margin.`,
    likelihood: 'Medium',
    impact: 'Small negative',
  },
  {
    code: 'T1',
    dimension: 'Technical',
    order: 'Immediate',
    text: 'It is an add-on to the IKEA Family points system, not a new app to maintain.',
    likelihood: 'High',
    impact: 'Small positive',
  },
  {
    code: 'T2',
    dimension: 'Technical',
    order: 'Enabling',
    text: 'IKEA can change weights, tiers and caps in the admin view without new code.',
    likelihood: 'High',
    impact: 'Small positive',
  },
  {
    code: 'T3',
    dimension: 'Technical',
    order: 'Structural',
    text: 'It needs reliable life-cycle data for every product, and points worth money must be protected against fraud.',
    likelihood: 'Medium',
    impact: 'Small negative',
  },
];

export function isRisk(effect: Effect) {
  return effect.impact.endsWith('negative');
}

export function effect(code: string): Effect {
  const found = EFFECTS.find((e) => e.code === code);
  if (!found) throw new Error(`Unknown effect ${code}`);
  return found;
}

/** Chains of effects: a ReWard feature and the effects it leads to, in order. */
export const CHAINS: { feature: string; steps: string[] }[] = [
  { feature: 'Cashback follows the sustainability score', steps: ['I1', 'En1', 'En2', 'S3'] },
  { feature: 'Points can only be spent at IKEA', steps: ['Ec1', 'Ec2', 'En3'] },
  { feature: 'The score and the calculation are shown openly', steps: ['I2', 'S2'] },
  { feature: 'IKEA sets the model in the admin view', steps: ['T2', 'Ec3'] },
  { feature: 'Built on IKEA Family accounts', steps: ['T1', 'I3'] },
];
