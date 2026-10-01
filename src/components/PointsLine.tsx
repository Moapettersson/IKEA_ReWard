import { Leaf } from 'lucide-react';
import { formatNumber } from '../lib/format';
import type { CashbackResult, Condition } from '../lib/types';
import { cashbackLabel } from './rewardText';
import styles from './PointsLine.module.css';

interface PointsLineProps {
  result: CashbackResult;
  condition: Condition;
  quantity?: number;
  onWhy?: () => void;
}

// Mirrors IKEA's "Collect points with IKEA Family" row under the Add to bag button.
export function PointsLine({ result, condition, quantity = 1, onWhy }: PointsLineProps) {
  const points = result.points * quantity;
  return (
    <div className={styles.line}>
      <span className={styles.icon} aria-hidden="true">
        <Leaf size={16} strokeWidth={2} />
      </span>
      <div>
        <p className={styles.main}>
          Earn <strong>{formatNumber(points)} points</strong> with{' '}
          <strong className={styles.brand}>ReWard</strong>
        </p>
        <p className={styles.sub}>
          {cashbackLabel(result, condition)}
          {onWhy && (
            <>
              {' · '}
              <button type="button" className={styles.link} onClick={onWhy}>
                Why this product?
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
