import type { ReactNode } from 'react';
import styles from './InfoBox.module.css';

interface InfoBoxProps {
  children: ReactNode;
  variant?: 'grey' | 'bordered';
  className?: string;
}

export function InfoBox({ children, variant = 'grey', className }: InfoBoxProps) {
  return (
    <div className={[styles.box, styles[variant], className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
