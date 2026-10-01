import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { NBSP } from '../lib/format';
import { renderApp } from '../test/renderApp';

describe('customer flow (SPEC.md section 9)', () => {
  it('adds a product, checks out with 100 points and updates the wallet', async () => {
    const user = userEvent.setup();
    renderApp('/demo/product/stadig-bookcase-80');

    expect(await screen.findByRole('heading', { level: 1, name: 'STADIG' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add to shopping bag' }));
    expect(screen.getByRole('link', { name: 'Shopping bag, 1 item' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Shopping bag, 1 item' }));
    expect(await screen.findByRole('heading', { name: 'Shopping bag' })).toBeInTheDocument();
    expect(screen.getByText('69 points')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Continue to checkout' }));
    await user.click(await screen.findByLabelText('Use points on this order'));
    const input = screen.getByLabelText('Points to use (0 to 150)');
    await user.clear(input);
    await user.type(input, '100');

    // 69 x (699 - 100) / 699 = 59.1 -> 59
    const summary = screen.getByRole('heading', { name: 'Order summary' }).parentElement!;
    expect(within(summary).getByText('59 points')).toBeInTheDocument();
    expect(within(summary).getByText('599:-')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Place order (simulated)' }));
    expect(await screen.findByRole('heading', { name: 'Thank you, Maria' })).toBeInTheDocument();
    expect(screen.getByText('+59 points')).toBeInTheDocument();
    // 150 - 100 + 59 = 109
    expect(screen.getByRole('link', { name: '109 points' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'See your rewards' }));
    expect(await screen.findByText('109 points', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('RW-000123')).toBeInTheDocument();
  });

  it('clamps the redeem input to min(balance, subtotal)', async () => {
    const user = userEvent.setup();
    renderApp('/demo/product/steklatt-pan-28');
    await user.click(await screen.findByRole('button', { name: 'Add to shopping bag' }));
    await user.click(screen.getByRole('link', { name: /Shopping bag/ }));
    await user.click(await screen.findByRole('link', { name: 'Continue to checkout' }));
    await user.click(await screen.findByLabelText('Use points on this order'));
    const input = screen.getByLabelText('Points to use (0 to 149)');
    await user.clear(input);
    await user.type(input, '500');
    await user.tab();
    expect(input).toHaveValue(149);
    const summary = screen.getByRole('heading', { name: 'Order summary' }).parentElement!;
    expect(within(summary).getByText('0 points')).toBeInTheDocument();
  });
});

describe('admin changes reach the shop only when saved', () => {
  it('previews a new bonus, then saves it', async () => {
    const user = userEvent.setup();
    renderApp('/demo/admin');
    const bonus = await screen.findByLabelText('Second-hand bonus (percentage points)');
    await user.clear(bonus);
    await user.type(bonus, '0');
    expect(screen.getByText('Preview, not saved. The shop still uses the saved model.')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Products' }));
    await user.click((await screen.findAllByRole('link', { name: /Storage & organisation/ }))[0]!);
    // Still the saved model: second-hand STADIG earns 42 points.
    expect(await screen.findByText('+42 points')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Admin' }));
    const bonusAgain = await screen.findByLabelText('Second-hand bonus (percentage points)');
    await user.clear(bonusAgain);
    await user.type(bonusAgain, '0');
    await user.click(screen.getByRole('button', { name: 'Save model' }));
    expect(screen.getByText('Saved. The shop uses this model.')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Products' }));
    await user.click((await screen.findAllByRole('link', { name: /Storage & organisation/ }))[0]!);
    // Without the bonus: 10 % of 350 = 35 points.
    expect(await screen.findByText('+35 points')).toBeInTheDocument();
  });

  it('blocks saving an invalid tier table', async () => {
    const user = userEvent.setup();
    renderApp('/demo/admin');
    const minB = await screen.findByLabelText('Minimum score for tier B');
    await user.clear(minB);
    await user.type(minB, '90');
    expect(screen.getByRole('button', { name: 'Save model' })).toBeDisabled();
    expect(screen.getByText(/Minimum score for tier B must be lower than for tier A/)).toBeInTheDocument();
  });
});

describe('search and 404', () => {
  it('finds products by name or description', async () => {
    renderApp('/demo/search?q=bookcase');
    expect(await screen.findByRole('heading', { name: `Results for “bookcase”` })).toBeInTheDocument();
    expect(screen.getByText('4 items')).toBeInTheDocument();
  });

  it('shows the IKEA-style 404', async () => {
    renderApp('/demo/nothing-here');
    expect(await screen.findByRole('heading', { name: "We can't find that page" })).toBeInTheDocument();
  });

  it('renders the project website with the worked example', async () => {
    renderApp('/');
    expect(await screen.findByRole('heading', { level: 1, name: 'IKEA ReWard' })).toBeInTheDocument();
    expect(screen.getByText(/shrinks from 200:- to 135:-/)).toBeInTheDocument();
    expect(screen.getAllByText(/student concept/i).length).toBeGreaterThan(0);
    expect(NBSP).toBe(' ');
  });
});
