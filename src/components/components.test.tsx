import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { defaultModel, products } from '../data';
import { buildCatalogue } from '../lib/cashback';
import { NBSP } from '../lib/format';
import { PointsLine } from './PointsLine';
import { Price } from './Price';
import { TierBadge } from './TierBadge';

const catalogue = buildCatalogue(products, defaultModel, {});
const stadig = catalogue.results.get('stadig-bookcase-80')!;
const stadigSh = catalogue.results.get('stadig-bookcase-80-sh')!;

describe('Price', () => {
  it('renders the IKEA price format and a spoken version', () => {
    const { container } = render(<Price value={1299} />);
    expect(container.textContent).toContain(`1${NBSP}299:-`);
    expect(screen.getByText('1 299 kronor')).toBeInTheDocument();
  });
});

describe('TierBadge', () => {
  it('never relies on colour alone', () => {
    render(<TierBadge tier="A" />);
    expect(screen.getByText('Tier A')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('can show the label visibly', () => {
    render(<TierBadge tier="C" showLabel />);
    expect(screen.getByText('Tier C')).not.toHaveClass('visually-hidden');
  });
});

// Testing Library normalises the non-breaking spaces to plain spaces when matching text.
describe('PointsLine', () => {
  it('shows points and the final percentage for a new product', () => {
    render(<PointsLine result={stadig} condition="new" />);
    expect(screen.getByText('69 points')).toBeInTheDocument();
    expect(screen.getByText('Tier A · 10 % cashback')).toBeInTheDocument();
  });

  it('shows the final, capped percentage with the bonus note for second-hand', () => {
    render(<PointsLine result={stadigSh} condition="secondhand" />);
    expect(screen.getByText('42 points')).toBeInTheDocument();
    expect(
      screen.getByText('Tier A · 12 % cashback, incl. second-hand bonus'),
    ).toBeInTheDocument();
  });

  it('labels an override as a campaign and keeps the tier from the score', () => {
    const withOverride = buildCatalogue(products, defaultModel, { 'langsam-bookcase-80': 20 });
    render(
      <PointsLine result={withOverride.results.get('langsam-bookcase-80')!} condition="new" />,
    );
    expect(screen.getByText('Tier D · 20 % cashback · Campaign')).toBeInTheDocument();
  });

  it('multiplies points by quantity', () => {
    render(<PointsLine result={stadig} condition="new" quantity={2} />);
    expect(screen.getByText('138 points')).toBeInTheDocument();
  });
});
