import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import styles from './Accordion.module.css';

interface AccordionProps {
  id?: string;
  title: string;
  children: ReactNode;
  open?: boolean;
  onToggle?: (open: boolean) => void;
}

// IKEA PDP "Product details" rows. Native <details> keeps it keyboard and screen reader friendly.
export function Accordion({ id, title, children, open, onToggle }: AccordionProps) {
  return (
    <details
      id={id}
      className={styles.row}
      open={open}
      onToggle={(e) => onToggle?.((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary className={styles.summary}>
        <span>{title}</span>
        <ChevronRight className={styles.chevron} size={24} strokeWidth={2} aria-hidden="true" />
      </summary>
      <div className={styles.panel}>{children}</div>
    </details>
  );
}
