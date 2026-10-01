import type { Product } from '../lib/types';
import styles from './ProductImage.module.css';

export function ProductImage({ product, className }: { product: Product; className?: string }) {
  return (
    <div className={[styles.frame, className].filter(Boolean).join(' ')}>
      <img
        src={product.image}
        alt={`${product.name}, ${product.description.toLowerCase()}${product.condition === 'secondhand' ? ', second-hand' : ''}`}
        width={400}
        height={400}
        loading="lazy"
      />
    </div>
  );
}
