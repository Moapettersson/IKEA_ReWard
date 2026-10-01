import { Leaf, Search, ShoppingBag } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { FEEDBACK_FORM_URL } from '../config';
import { categories, products } from '../data';
import { formatNumber } from '../lib/format';
import { useStore } from '../state/store';
import { Wordmark } from './Wordmark';
import styles from './DemoHeader.module.css';

const NAV = [
  { to: '/demo', label: 'Products', end: true },
  { to: '/demo/rewards', label: 'Rewards', end: true },
  { to: '/demo/rewards#how-it-works', label: 'How it works', end: false },
  { to: '/demo/admin', label: 'Admin', end: true },
];

export function DemoHeader({ showCategories = true }: { showCategories?: boolean }) {
  const { state, bag } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/demo/search?q=${encodeURIComponent(q)}` : '/demo/search');
  };

  return (
    <header>
      <div className={styles.utility}>
        <div className={`page ${styles.utilityInner}`}>
          <p>Student concept for IKEA · simulated data</p>
          <p className={styles.utilityRight}>
            {FEEDBACK_FORM_URL && (
              <a href={FEEDBACK_FORM_URL} target="_blank" rel="noreferrer">
                Give feedback
              </a>
            )}
            <Link to="/demo/rewards">{formatNumber(state.wallet.balance)} points</Link>
          </p>
        </div>
      </div>

      <div className={`page ${styles.main}`}>
        <Wordmark />
        <nav aria-label="Main" className={styles.nav}>
          {NAV.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive && item.label !== 'How it works'
                  ? `${styles.navLink} ${styles.active}`
                  : styles.navLink
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <form role="search" className={styles.search} onSubmit={onSearch}>
          <label htmlFor="site-search" className="visually-hidden">
            Search products
          </label>
          <Search className={styles.searchIcon} size={16} strokeWidth={2} aria-hidden="true" />
          <input
            id="site-search"
            type="search"
            placeholder="What are you looking for?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
        <div className={styles.icons}>
          <Link to="/demo/rewards" className={styles.iconButton} aria-label="Your rewards">
            <Leaf size={24} strokeWidth={2} aria-hidden="true" />
          </Link>
          <Link
            to="/demo/bag"
            className={styles.iconButton}
            aria-label={`Shopping bag, ${bag.itemCount} ${bag.itemCount === 1 ? 'item' : 'items'}`}
          >
            <ShoppingBag size={24} strokeWidth={2} aria-hidden="true" />
            {bag.itemCount > 0 && (
              <span className={styles.count} aria-hidden="true">
                {bag.itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {showCategories && (
        <nav aria-label="Categories" className={`page ${styles.chips}`}>
          {categories.map((c) => {
            const thumb = products.find((p) => p.category === c.slug && p.condition === 'new');
            return (
              <NavLink
                key={c.slug}
                to={`/demo/category/${c.slug}`}
                className={({ isActive }) =>
                  isActive ? `${styles.chip} ${styles.chipActive}` : styles.chip
                }
              >
                {thumb && <img src={thumb.image} alt="" width={24} height={24} />}
                {c.name}
                {c.isPilot && <span className={styles.chipPilot}>Pilot</span>}
              </NavLink>
            );
          })}
        </nav>
      )}
    </header>
  );
}
