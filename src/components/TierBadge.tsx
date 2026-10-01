import type { Tier } from '../lib/types';
import styles from './TierBadge.module.css';

interface TierBadgeProps {
  tier: Tier;
  /** Show "Tier A" next to the square. Otherwise the text is only for screen readers. */
  showLabel?: boolean;
}

// Never colour alone: the letter is always visible and the full label is always read out.
export function TierBadge({ tier, showLabel = false }: TierBadgeProps) {
  return (
    <span className={styles.wrap}>
      <span className={`${styles.badge} ${styles[`tier${tier}`]}`} aria-hidden="true">
        {tier}
      </span>
      {showLabel ? (
        <span className={styles.label}>Tier {tier}</span>
      ) : (
        <span className="visually-hidden">Tier {tier}</span>
      )}
    </span>
  );
}
