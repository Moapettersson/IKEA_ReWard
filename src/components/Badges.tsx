import styles from './Badges.module.css';

export function SecondhandBadge() {
  return <span className={styles.secondhand}>Second-hand</span>;
}

export function PilotBadge() {
  return <span className={styles.pilot}>Pilot category</span>;
}
