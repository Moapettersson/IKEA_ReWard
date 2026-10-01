import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { InfoBox } from '../../components/InfoBox';
import { Price } from '../../components/Price';
import { ProductImage } from '../../components/ProductImage';
import { QuantityStepper } from '../../components/QuantityStepper';
import { TierBadge } from '../../components/TierBadge';
import { useAnnounce } from '../../components/Toast';
import { formatKg, formatNumber, formatSek } from '../../lib/format';
import { useStore } from '../../state/store';
import { usePageTitle } from '../../usePageTitle';
import shop from '../shop/Shop.module.css';
import styles from './Bag.module.css';

export function BagPage() {
  const { bag, dispatch } = useStore();
  const announce = useAnnounce();
  usePageTitle('Shopping bag');

  if (bag.lines.length === 0) {
    return (
      <div className="page">
        <div className={shop.section}>
          <h1 className={shop.title}>Shopping bag</h1>
          <div className={styles.empty}>
            <p>Your bag is empty.</p>
            <Button to="/demo" variant="primary">
              Browse products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className={shop.section}>
        <h1 className={shop.title}>Shopping bag</h1>
      </div>
      <div className={styles.layout}>
        <ul role="list" className={styles.lines} aria-label="Products in your bag">
          {bag.lines.map((line) => {
            const { product, result } = line;
            const name = `${product.name}${product.condition === 'secondhand' ? ' (second-hand)' : ''}`;
            return (
              <li key={product.id} className={styles.line}>
                <ProductImage product={product} />
                <div className={styles.lineInfo}>
                  <div className={styles.lineTop}>
                    <p className={styles.lineName}>
                      <Link to={`/demo/product/${product.id}`}>{name}</Link>
                    </p>
                    <Price value={line.lineTotalSek} size="s" />
                  </div>
                  <p className={styles.lineDesc}>{product.description}</p>
                  <p className={styles.lineReward}>
                    <TierBadge tier={result.tier} />
                    <strong>+{formatNumber(line.linePoints)} points</strong>
                    <span>
                      {line.quantity > 1 ? `${formatSek(product.priceSek)} each · ` : ''}
                      {formatSek(result.priceAfterCashback)} after cashback
                    </span>
                  </p>
                  <div className={styles.lineActions}>
                    <QuantityStepper
                      value={line.quantity}
                      label={`Quantity of ${name}`}
                      onChange={(quantity) => {
                        dispatch({ type: 'SET_QTY', productId: product.id, quantity });
                        announce(`${name}: quantity ${quantity}`, { visual: false });
                      }}
                    />
                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() => {
                        dispatch({ type: 'REMOVE_LINE', productId: product.id });
                        announce(`Removed ${name} from your bag`);
                      }}
                    >
                      Remove<span className="visually-hidden"> {name}</span>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <InfoBox className={styles.summary}>
          <h2 className={styles.summaryTitle}>Order summary</h2>
          <dl className={styles.rows}>
            <div className={styles.row}>
              <dt>Subtotal</dt>
              <dd>{formatSek(bag.subtotalSek)}</dd>
            </div>
            <div className={`${styles.row} ${styles.pointsRow}`}>
              <dt>Points you'll earn</dt>
              <dd aria-live="polite">{formatNumber(bag.pointsEarned)} points</dd>
            </div>
            <div className={styles.row}>
              <dt>Estimated CO2e avoided per year</dt>
              <dd>{formatKg(bag.co2AvoidedPerYearKg)}</dd>
            </div>
          </dl>
          <Button to="/demo/checkout" variant="emphasised" size="l" fullWidth>
            Continue to checkout
          </Button>
        </InfoBox>
      </div>
    </div>
  );
}
