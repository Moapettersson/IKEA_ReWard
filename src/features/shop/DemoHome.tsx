import { Link } from 'react-router-dom';
import { PilotBadge } from '../../components/Badges';
import { Button } from '../../components/Button';
import { InfoBox } from '../../components/InfoBox';
import { ProductCard } from '../../components/ProductCard';
import { ProductGrid } from '../../components/ProductGrid';
import { useAnnounce } from '../../components/Toast';
import { categories, products } from '../../data';
import { formatNumber } from '../../lib/format';
import { useStore } from '../../state/store';
import { usePageTitle } from '../../usePageTitle';
import styles from './Shop.module.css';

export function DemoHome() {
  const { state, catalogue, dispatch } = useStore();
  const announce = useAnnounce();
  usePageTitle('Prototype');

  // Tier A or second-hand, most points back first (SPEC.md 5.2).
  const highest = products
    .map((p) => ({ p, r: catalogue.results.get(p.id)! }))
    .filter(({ p, r }) => r.tier === 'A' || p.condition === 'secondhand')
    .sort((a, b) => b.r.finalPct - a.r.finalPct || b.r.points - a.r.points)
    .slice(0, 4);

  const reset = () => {
    dispatch({ type: 'RESET_DEMO' });
    announce('The demo has been reset. You have 150 points again.');
  };

  return (
    <div className="page">
      <section className={styles.section} aria-labelledby="intro-title">
        <h1 id="intro-title" className="visually-hidden">
          IKEA ReWard prototype
        </h1>
        <InfoBox>
          <div className={styles.intro}>
            <p>
              You are Maria. You have <strong>{formatNumber(state.wallet.balance)} points</strong>.
              Find a bookcase for the kids' room.
            </p>
            <Button to="/demo/category/storage" variant="primary">
              Start in Storage &amp; organisation
            </Button>
          </div>
        </InfoBox>
      </section>

      <section className={styles.section} aria-labelledby="categories-title">
        <h2 id="categories-title" className={styles.subtitle}>
          Shop by category
        </h2>
        <ul role="list" className={styles.categoryList}>
          {categories.map((c) => {
            const thumb = products.find((p) => p.category === c.slug && p.condition === 'new');
            return (
              <li key={c.slug}>
                <Link to={`/demo/category/${c.slug}`} className={styles.categoryTile}>
                  {thumb && <img src={thumb.image} alt="" width={96} height={96} />}
                  <span>
                    <span className={styles.categoryName}>
                      {c.name}
                      {c.isPilot && <PilotBadge />}
                    </span>
                    <span className={styles.categoryText}>{c.description}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="highest-title">
        <h2 id="highest-title" className={styles.subtitle}>
          Highest rewards right now
        </h2>
        <ProductGrid>
          {highest.map(({ p, r }) => (
            <ProductCard key={p.id} product={p} result={r} />
          ))}
        </ProductGrid>
      </section>

      <div className={styles.resetRow}>
        <Button variant="secondary" onClick={reset}>
          Reset demo
        </Button>
        <p>Empties your bag, restores 150 points and the default cashback model.</p>
      </div>
    </div>
  );
}
