import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export const DISCLAIMER =
  'IKEA ReWard is a student concept created in the course TEK830 Sustainable digitalization in practice at Chalmers University of Technology. It is not an IKEA service. All product, price and sustainability data is simulated.';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`page ${styles.inner}`}>
        <nav aria-label="Footer" className={styles.links}>
          <Link to="/">Project website</Link>
          <Link to="/demo">Prototype</Link>
          <Link to="/demo/admin">Admin view</Link>
          <Link to="/#contact">Contact</Link>
        </nav>
        <p className={styles.disclaimer}>{DISCLAIMER}</p>
      </div>
    </footer>
  );
}
