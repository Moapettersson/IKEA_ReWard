import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PilotBadge } from '../../components/Badges';
import { ProductCard } from '../../components/ProductCard';
import { categories, products } from '../../data';
import type { Condition, Tier } from '../../lib/types';
import { useStore } from '../../state/store';
import { usePageTitle } from '../../usePageTitle';
import { NotFoundPage } from './NotFoundPage';
import styles from './CategoryPage.module.css';
import shop from './Shop.module.css';

type Sort = 'recommended' | 'price' | 'points';
const TIERS: Tier[] = ['A', 'B', 'C', 'D', 'E'];
const CONDITIONS: { value: Condition; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'secondhand', label: 'Second-hand' },
];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function CategoryPage() {
  const { slug } = useParams();
  const category = categories.find((c) => c.slug === slug);
  const { catalogue } = useStore();
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [sort, setSort] = useState<Sort>('recommended');
  usePageTitle(category?.name ?? 'Not found');

  const items = useMemo(() => {
    const list = products
      .filter((p) => p.category === slug)
      .map((p) => ({ p, r: catalogue.results.get(p.id)! }))
      .filter(({ p }) => conditions.length === 0 || conditions.includes(p.condition))
      .filter(({ r }) => tiers.length === 0 || tiers.includes(r.tier));
    if (sort === 'price') list.sort((a, b) => a.p.priceSek - b.p.priceSek);
    if (sort === 'points') list.sort((a, b) => b.r.points - a.r.points);
    return list;
  }, [slug, catalogue, conditions, tiers, sort]);

  if (!category) return <NotFoundPage />;

  const filters = (
    <>
      <fieldset className={styles.fieldset}>
        <legend>Condition</legend>
        {CONDITIONS.map((c) => (
          <label key={c.value} className={styles.check}>
            <input
              type="checkbox"
              checked={conditions.includes(c.value)}
              onChange={() => setConditions((list) => toggle(list, c.value))}
            />
            {c.label}
          </label>
        ))}
      </fieldset>
      <fieldset className={styles.fieldset}>
        <legend>ReWard tier</legend>
        {TIERS.map((t) => (
          <label key={t} className={styles.check}>
            <input
              type="checkbox"
              checked={tiers.includes(t)}
              onChange={() => setTiers((list) => toggle(list, t))}
            />
            Tier {t}
          </label>
        ))}
      </fieldset>
    </>
  );

  return (
    <div className="page">
      <div className={shop.section}>
        <h1 className={`${shop.title} ${styles.title}`}>
          {category.name}
          {category.isPilot && <PilotBadge />}
        </h1>
        <p className={shop.lead}>{category.description}</p>
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Filters">
          <h2 className={styles.filterTitle}>Filter</h2>
          {filters}
        </aside>

        <div>
          <div className={styles.toolbar}>
            <p className={shop.meta} aria-live="polite">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
            <details className={styles.mobileFilters}>
              <summary>Filter</summary>
              <div className={styles.mobileFilterPanel}>{filters}</div>
            </details>
            <label className={styles.sort}>
              <span>Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="recommended">Recommended</option>
                <option value="price">Price: low to high</option>
                <option value="points">Most points</option>
              </select>
            </label>
          </div>

          {items.length === 0 ? (
            <p className={styles.empty}>No products match these filters.</p>
          ) : (
            <div className={styles.grid}>
              {items.map(({ p, r }) => (
                <ProductCard key={p.id} product={p} result={r} headingLevel="h2" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
