import { useParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { InfoBox } from '../../components/InfoBox';
import { formatKg, formatNumber } from '../../lib/format';
import { useStore } from '../../state/store';
import { usePageTitle } from '../../usePageTitle';
import { NotFoundPage } from '../shop/NotFoundPage';
import shop from '../shop/Shop.module.css';
import styles from './Bag.module.css';

export function ConfirmationPage() {
  const { id } = useParams();
  const { state } = useStore();
  const order = state.wallet.orders.find((o) => o.id === id);
  usePageTitle('Thank you');
  if (!order) return <NotFoundPage />;

  return (
    <div className="page">
      <div className={styles.confirm}>
        <div>
          <h1 className={shop.title}>Thank you, Maria</h1>
          <p className={shop.meta}>Order number {order.id}</p>
        </div>
        <p className={styles.bigPoints}>+{formatNumber(order.pointsEarned)} points</p>
        <p className={shop.lead}>
          Your new balance is <strong>{formatNumber(state.wallet.balance)} points</strong>, worth{' '}
          {formatNumber(state.wallet.balance)} SEK on your next purchase.
        </p>
        {order.co2AvoidedPerYearKg > 0 && (
          <InfoBox>
            With this order you avoid about <strong>{formatKg(order.co2AvoidedPerYearKg)} CO2e per
            year</strong> compared with the cheapest new options.
          </InfoBox>
        )}
        <div className={styles.actions}>
          <Button to="/demo/rewards" variant="primary">
            See your rewards
          </Button>
          <Button to="/demo" variant="secondary">
            Keep shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
