import { Link } from 'react-router-dom';
import { CONTACT_EMAIL } from '../config';
import styles from './Footer.module.css';

export const DISCLAIMER =
  'IKEA ReWard is a student concept created in the TEK830 Capstone course at Chalmers University of Technology. It is not an IKEA service. All product, price and sustainability data is simulated.';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`page ${styles.inner}`}>
        <nav aria-label="Footer" className={styles.links}>
          <Link to="/">Project website</Link>
          <Link to="/demo">Prototype</Link>
          <Link to="/demo/admin">Admin view</Link>
          <a href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
        </nav>
        <p className={styles.disclaimer}>{DISCLAIMER}</p>
      </div>
    </footer>
  );
}
