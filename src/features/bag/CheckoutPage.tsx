import { useId, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { InfoBox } from '../../components/InfoBox';
import { useAnnounce } from '../../components/Toast';
import { buildOrder, clampRedeem, nextOrderId, summariseBag } from '../../lib/cashback';
import { formatKg, formatNumber, formatSek } from '../../lib/format';
import { useStore } from '../../state/store';
import { usePageTitle } from '../../usePageTitle';
import shop from '../shop/Shop.module.css';
import styles from './Bag.module.css';

export function CheckoutPage() {
  const { state, catalogue, dispatch } = useStore();
  const announce = useAnnounce();
  const inputId = useId();
  const [usePoints, setUsePoints] = useState(false);
  const [requested, setRequested] = useState('');
  const [placedId, setPlacedId] = useState<string | null>(null);
  usePageTitle('Checkout');

  const balance = state.wallet.balance;
  const plain = useMemo(() => summariseBag(state.bag, catalogue), [state.bag, catalogue]);
  const max = Math.min(balance, plain.subtotalSek);
  const redeem = usePoints ? clampRedeem(Number(requested || 0), balance, plain.subtotalSek) : 0;
  const summary = useMemo(
    () => summariseBag(state.bag, catalogue, redeem),
    [state.bag, catalogue, redeem],
  );

  // After placing the order the bag is empty, so go to the confirmation, not back to the bag.
  if (placedId) return <Navigate to={`/demo/order/${placedId}`} />;
  if (plain.lines.length === 0) return <Navigate to="/demo/bag" replace />;

  const placeOrder = () => {
    const order = buildOrder(summary, nextOrderId(state.wallet.orders), new Date().toISOString());
    setPlacedId(order.id);
    dispatch({ type: 'PLACE_ORDER', order });
    announce(
      `Order placed. You earned ${formatNumber(order.pointsEarned)} points. New balance ${formatNumber(balance - order.pointsRedeemed + order.pointsEarned)} points.`,
      { visual: false },
    );
  };

  return (
    <div className="page">
      <div className={shop.section}>
        <h1 className={shop.title}>Checkout</h1>
        <p className={shop.lead}>Simulated. Nothing is paid or delivered.</p>
      </div>
      <div className={styles.layout}>
        <div className={styles.summary}>
          <InfoBox variant="bordered">
            <h2 className={styles.summaryTitle}>Delivery</h2>
            <p>Delivery to: Maria, Gothenburg</p>
          </InfoBox>

          <InfoBox variant="bordered">
            <div className={styles.redeem}>
              <h2 className={styles.summaryTitle}>Use points</h2>
              <p>
                You have <strong>{formatNumber(balance)} points</strong> (1 point = 1 SEK).
              </p>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={usePoints}
                  onChange={(e) => {
                    setUsePoints(e.target.checked);
                    if (e.target.checked && requested === '') setRequested(String(max));
                  }}
                  disabled={max === 0}
                />
                Use points on this order
              </label>
              {usePoints && (
                <div className={styles.field}>
                  <label htmlFor={inputId}>Points to use (0 to {formatNumber(max)})</label>
                  <input
                    id={inputId}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={max}
                    step={1}
                    value={requested}
                    onChange={(e) => setRequested(e.target.value)}
                    onBlur={() => setRequested(String(redeem))}
                  />
                </div>
              )}
              <p className={styles.hint}>You earn points only on what you pay with money.</p>
            </div>
          </InfoBox>
        </div>

        <InfoBox className={styles.summary}>
          <h2 className={styles.summaryTitle}>Order summary</h2>
          <dl className={styles.rows}>
            <div className={styles.row}>
              <dt>Subtotal ({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'})</dt>
              <dd>{formatSek(summary.subtotalSek)}</dd>
            </div>
            <div className={styles.row}>
              <dt>Points used</dt>
              <dd>−{formatSek(summary.pointsRedeemed)}</dd>
            </div>
            <div className={`${styles.row} ${styles.total}`}>
              <dt>To pay</dt>
              <dd>{formatSek(summary.toPaySek)}</dd>
            </div>
            <div className={`${styles.row} ${styles.pointsRow}`}>
              <dt>Points you'll earn</dt>
              <dd aria-live="polite">{formatNumber(summary.pointsEarned)} points</dd>
            </div>
            <div className={styles.row}>
              <dt>Estimated CO2e avoided per year</dt>
              <dd>{formatKg(summary.co2AvoidedPerYearKg)}</dd>
            </div>
          </dl>
          <Button variant="emphasised" size="l" fullWidth onClick={placeOrder}>
            Place order (simulated)
          </Button>
        </InfoBox>
      </div>
    </div>
  );
}
