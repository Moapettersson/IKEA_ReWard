import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAddToBag } from '../features/bag/useAddToBag';
import { formatNumber, formatSek } from '../lib/format';
import type { CashbackResult, Product } from '../lib/types';
import { SecondhandBadge } from './Badges';
import { Price } from './Price';
import { ProductImage } from './ProductImage';
import { TierBadge } from './TierBadge';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  result: CashbackResult;
  headingLevel?: 'h2' | 'h3';
}

// IKEA listing card: no border, no shadow, square image on grey.
export function ProductCard({ product, result, headingLevel = 'h3' }: ProductCardProps) {
  const addToBag = useAddToBag();
  const Heading = headingLevel;
  const href = `/demo/product/${product.id}`;
  return (
    <article className={styles.card}>
      <Link to={href} className={styles.imageLink} tabIndex={-1} aria-hidden="true">
        <ProductImage product={product} />
        {product.condition === 'secondhand' && (
          <span className={styles.badge}>
            <SecondhandBadge />
          </span>
        )}
      </Link>
      <div className={styles.body}>
        <div className={styles.text}>
          <Heading className={styles.name}>
            <Link to={href} className={styles.nameLink}>
              {product.name}
              {product.condition === 'secondhand' && (
                <span className="visually-hidden"> (second-hand)</span>
              )}
            </Link>
          </Heading>
          <p className={styles.description}>{product.description}</p>
          <Price value={product.priceSek} size="m" className={styles.price} />
          <p className={styles.reward}>
            <TierBadge tier={result.tier} />
            <span className={styles.points}>+{formatNumber(result.points)} points</span>
            <span className={styles.after}>{formatSek(result.priceAfterCashback)} after cashback</span>
          </p>
        </div>
        <button
          type="button"
          className={styles.add}
          onClick={() => addToBag(product.id)}
          aria-label={`Add ${product.name}${product.condition === 'secondhand' ? ' (second-hand)' : ''} to shopping bag`}
        >
          <ShoppingBag size={20} strokeWidth={2} aria-hidden="true" />
          <span className={styles.plus} aria-hidden="true">
            +
          </span>
        </button>
      </div>
    </article>
  );
}
