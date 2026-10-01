import { formatNumber } from '../lib/format';
import styles from './Price.module.css';

interface PriceProps {
  value: number;
  size?: 'l' | 'm' | 's';
  className?: string;
}

// IKEA Sweden price: bold integer + ":-" suffix on the same baseline.
export function Price({ value, size = 'm', className }: PriceProps) {
  return (
    <span className={[styles.price, styles[size], className].filter(Boolean).join(' ')}>
      <span className="visually-hidden">{`${formatNumber(value)} kronor`}</span>
      <span aria-hidden="true">
        {formatNumber(value)}
        <span className={styles.suffix}>:-</span>
      </span>
    </span>
  );
}
