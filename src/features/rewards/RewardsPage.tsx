import { productById } from '../../data';
import { InfoBox } from '../../components/InfoBox';
import { TierBadge } from '../../components/TierBadge';
import { walletTotals } from '../../lib/cashback';
import { formatDate, formatKg, formatNumber, formatPct, formatSek } from '../../lib/format';
import { useStore } from '../../state/store';
import { usePageTitle } from '../../usePageTitle';
import shop from '../shop/Shop.module.css';
import styles from './RewardsPage.module.css';

export function RewardsPage() {
  const { state } = useStore();
  const { balance, orders } = state.wallet;
  const totals = walletTotals(orders);
  const model = state.model;
  usePageTitle('Your rewards');

  return (
    <div className="page">
      <div className={shop.section}>
        <h1 className={shop.title}>Your rewards</h1>
      </div>

      <section className={styles.balance} aria-labelledby="balance-title">
        <h2 id="balance-title" className="visually-hidden">
          Balance
        </h2>
        <p className={styles.balanceNumber}>{formatNumber(balance)} points</p>
        <p className={styles.balanceText}>
          = {formatSek(balance)} to use on your next purchase
        </p>
      </section>

      <section className={shop.section} aria-labelledby="totals-title">
        <h2 id="totals-title" className={shop.subtitle}>
          So far
        </h2>
        <dl className={styles.totals}>
          <div>
            <dt>Points earned</dt>
            <dd>{formatNumber(totals.pointsEarned)}</dd>
          </div>
          <div>
            <dt>Points used</dt>
            <dd>{formatNumber(totals.pointsUsed)}</dd>
          </div>
          <div>
            <dt>Estimated CO2e avoided per year</dt>
            <dd>{formatKg(totals.co2AvoidedPerYearKg)}</dd>
          </div>
          <div>
            <dt>Second-hand items bought</dt>
            <dd>{formatNumber(totals.secondhandItems)}</dd>
          </div>
        </dl>
      </section>

      <section className={shop.section} aria-labelledby="history-title">
        <h2 id="history-title" className={shop.subtitle}>
          Order history
        </h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Order</th>
                <th scope="col">Items</th>
                <th scope="col" className={styles.num}>
                  Paid
                </th>
                <th scope="col" className={styles.num}>
                  Points earned
                </th>
                <th scope="col" className={styles.num}>
                  Points used
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{formatDate(o.createdAt)}</td>
                  <td>{o.id}</td>
                  <td>
                    {o.lines
                      .map((l) => {
                        const p = productById.get(l.productId);
                        const name = p ? p.name : l.productId;
                        const sh = l.condition === 'secondhand' ? ' (second-hand)' : '';
                        return `${l.quantity > 1 ? `${l.quantity} × ` : ''}${name}${sh}`;
                      })
                      .join(', ')}
                  </td>
                  <td className={styles.num}>{formatSek(o.paidSek)}</td>
                  <td className={styles.num}>+{formatNumber(o.pointsEarned)}</td>
                  <td className={styles.num}>
                    {o.pointsRedeemed ? `−${formatNumber(o.pointsRedeemed)}` : '0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="how-it-works" className={shop.section} aria-labelledby="how-title">
        <h2 id="how-title" className={shop.subtitle}>
          How ReWard works
        </h2>
        <div className={styles.how}>
          <div className={styles.howText}>
            <p>
              Every product gets a sustainability score from 0 to 100. We compare it with similar
              products on climate, water, energy, lifespan, transport and repairability.
            </p>
            <p>
              The score decides the tier, and the tier decides how much cashback you get as
              points. It's about how sustainable the product is, not how much you spend.
            </p>
            <p>
              Second-hand gives you the most back: you get{' '}
              <strong>{formatPct(model.secondhandBonusPct)} extra</strong> on top of the tier,
              because nothing new had to be made.
            </p>
            <p>1 point = 1 SEK. Use your points at checkout on your next purchase.</p>
          </div>
          <InfoBox variant="bordered">
            <table className={styles.table}>
              <caption className="visually-hidden">Cashback per tier</caption>
              <thead>
                <tr>
                  <th scope="col">Tier</th>
                  <th scope="col">Score</th>
                  <th scope="col" className={styles.num}>
                    Cashback
                  </th>
                </tr>
              </thead>
              <tbody>
                {model.tiers.map((t, i) => {
                  const upper = i === 0 ? 100 : model.tiers[i - 1]!.minScore - 1;
                  return (
                    <tr key={t.tier}>
                      <td>
                        <TierBadge tier={t.tier} showLabel />
                      </td>
                      <td>
                        {t.minScore}–{upper}
                      </td>
                      <td className={styles.num}>{formatPct(t.pct)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </InfoBox>
        </div>
      </section>
    </div>
  );
}
