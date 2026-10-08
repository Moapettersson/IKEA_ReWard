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
  /** The SusAF topic within the dimension, e.g. Privacy or Trust. */
  topic: string;
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
    topic: 'Agency',
    text: 'Budget shoppers can afford the sustainable choice.',
    likelihood: 'High',
    impact: 'Large positive',
  },
  {
    code: 'I2',
    dimension: 'Individual',
    order: 'Enabling',
    topic: 'Lifelong learning',
    text: 'People learn what makes a product last.',
    likelihood: 'Medium',
    impact: 'Small positive',
  },
  {
    code: 'I3',
    dimension: 'Individual',
    order: 'Structural',
    topic: 'Privacy',
    text: 'Purchase data needs clear consent.',
    likelihood: 'Medium',
    impact: 'Small negative',
  },
  {
    code: 'S1',
    dimension: 'Social',
    order: 'Immediate',
    topic: 'Inclusiveness',
    text: 'The same rules for everyone.',
    likelihood: 'High',
    impact: 'Small positive',
  },
  {
    code: 'S2',
    dimension: 'Social',
    order: 'Enabling',
    topic: 'Trust',
    text: 'An open score builds trust.',
    likelihood: 'Medium',
    impact: 'Small positive',
  },
  {
    code: 'S3',
    dimension: 'Social',
    order: 'Structural',
    topic: 'Equity',
    text: 'Sustainable choices are no longer only for some.',
    likelihood: 'Low',
    impact: 'Large positive',
  },
  {
    code: 'En1',
    dimension: 'Environmental',
    order: 'Immediate',
    topic: 'Materials and resources',
    text: 'Purchases shift to durable and second-hand products.',
    likelihood: 'High',
    impact: 'Large positive',
  },
  {
    code: 'En2',
    dimension: 'Environmental',
    order: 'Enabling',
    topic: 'Waste',
    text: 'Furniture is used longer, so less is produced.',
    likelihood: 'Medium',
    impact: 'Large positive',
  },
  {
    code: 'En3',
    dimension: 'Environmental',
    order: 'Structural',
    topic: 'Materials and resources',
    text: 'Cashback may make people buy more overall.',
    likelihood: 'Medium',
    impact: 'Large negative',
  },
  {
    code: 'Ec1',
    dimension: 'Economic',
    order: 'Immediate',
    topic: 'Value',
    text: 'Customers get points to spend at IKEA.',
    likelihood: 'High',
    impact: 'Small positive',
  },
  {
    code: 'Ec2',
    dimension: 'Economic',
    order: 'Enabling',
    topic: 'CRM',
    text: 'Loyal customers return and spend more (Accenture, 2016).',
    likelihood: 'Medium',
    impact: 'Large positive',
  },
  {
    code: 'Ec3',
    dimension: 'Economic',
    order: 'Structural',
    topic: 'Governance',
    text: `Lower margins, capped at ${cap} of the margin.`,
    likelihood: 'Medium',
    impact: 'Small negative',
  },
  {
    code: 'T1',
    dimension: 'Technical',
    order: 'Immediate',
    topic: 'Maintainability',
    text: 'Builds on IKEA Family, no new app.',
    likelihood: 'High',
    impact: 'Small positive',
  },
  {
    code: 'T2',
    dimension: 'Technical',
    order: 'Enabling',
    topic: 'Adaptability',
    text: 'IKEA tunes the model without new code.',
    likelihood: 'High',
    impact: 'Small positive',
  },
  {
    code: 'T3',
    dimension: 'Technical',
    order: 'Structural',
    topic: 'Scalability',
    text: 'Needs life-cycle data for every product.',
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
  { feature: 'Built on IKEA Family accounts', steps: ['T1', 'I3'] },
];
