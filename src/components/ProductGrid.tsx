import type { ReactNode } from 'react';
import styles from './ProductGrid.module.css';

export function ProductGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}
