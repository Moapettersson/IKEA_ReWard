import { Link } from 'react-router-dom';
import styles from './Wordmark.module.css';

// Plain text wordmark (DESIGN.md section 7). Never recreate the IKEA logo.
export function Wordmark({ to = '/demo' }: { to?: string }) {
  return (
    <Link to={to} className={styles.wordmark}>
      IKEA <span className={styles.reward}>ReWard</span>
    </Link>
  );
}
