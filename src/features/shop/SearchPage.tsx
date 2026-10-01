import { Link, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../../components/ProductCard';
import { ProductGrid } from '../../components/ProductGrid';
import { categories, products } from '../../data';
import { useStore } from '../../state/store';
import { usePageTitle } from '../../usePageTitle';
import shop from './Shop.module.css';
import styles from './SearchPage.module.css';

// SPEC.md 5.11: case-insensitive match on name and description.
export function SearchPage() {
  const [params] = useSearchParams();
  const q = (params.get('q') ?? '').trim();
  const { catalogue } = useStore();
  usePageTitle(q ? `Results for ${q}` : 'Search');

  const needle = q.toLowerCase();
  const matches = needle
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) || p.description.toLowerCase().includes(needle),
      )
    : [];

  return (
    <div className="page">
      <div className={shop.section}>
        <h1 className={shop.title}>{q ? <>Results for “{q}”</> : 'Search'}</h1>
        {q && (
          <p className={shop.meta} aria-live="polite">
            {matches.length} {matches.length === 1 ? 'item' : 'items'}
          </p>
        )}
      </div>
      <div className={shop.section}>
        {matches.length > 0 ? (
          <ProductGrid>
            {matches.map((p) => (
              <ProductCard key={p.id} product={p} result={catalogue.results.get(p.id)!} headingLevel="h2" />
            ))}
          </ProductGrid>
        ) : (
          <div className={styles.empty}>
            <p>
              {q
                ? `We couldn't find anything for “${q}”.`
                : 'Type what you are looking for in the search field, for example "bookcase".'}
            </p>
            <p>Try one of our categories instead:</p>
            <ul role="list" className={styles.links}>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link to={`/demo/category/${c.slug}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
