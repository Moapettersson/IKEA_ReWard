import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Accordion } from '../../components/Accordion';
import { SecondhandBadge } from '../../components/Badges';
import { Button } from '../../components/Button';
import { InfoBox } from '../../components/InfoBox';
import { PointsLine } from '../../components/PointsLine';
import { Price } from '../../components/Price';
import { ProductImage } from '../../components/ProductImage';
import { QuantityStepper } from '../../components/QuantityStepper';
import { TierBadge } from '../../components/TierBadge';
import { categories } from '../../data';
import { co2AvoidedPerYear, FACTOR_KEYS } from '../../lib/cashback';
import { formatNumber, formatPct, formatSek } from '../../lib/format';
import type { CashbackResult, FactorKey, Product } from '../../lib/types';
import { useStore } from '../../state/store';
import { usePageTitle } from '../../usePageTitle';
import { useAddToBag } from '../bag/useAddToBag';
import { NotFoundPage } from './NotFoundPage';
import styles from './ProductPage.module.css';

const FACTOR_LABELS: Record<FactorKey, string> = {
  co2: 'Climate (CO2e)',
  water: 'Water',
  energy: 'Energy',
  lifespan: 'Lifespan',
  transport: 'Transport',
  repairability: 'Repairability',
};

function rawValue(p: Product, key: FactorKey): string {
  const i = p.impact;
  const years = `over ${i.lifespanYears} years`;
  switch (key) {
    case 'co2':
      return `${formatNumber(i.co2Kg)} kg ${years}`;
    case 'water':
      return `${formatNumber(i.waterL)} litres ${years}`;
    case 'energy':
      return `${formatNumber(i.energyKWh)} kWh ${years}`;
    case 'lifespan':
      return `${i.lifespanYears} years of expected use`;
    case 'transport':
      return `${formatNumber(i.transportKm)} km to a Swedish store`;
    case 'repairability':
      return `${i.repairability}/10`;
  }
}

function Simulated() {
  return <p className={styles.simulated}>Simulated data for this prototype.</p>;
}

function Explanation({ product, result, groupSize }: { product: Product; result: CashbackResult; groupSize: number }) {
  const secondhand = product.condition === 'secondhand';
  return (
    <div className={styles.prose}>
      <ol className={styles.steps}>
        <li>
          <strong>Score:</strong> we compare {product.name} with the {groupSize - 1} other products
          in the same group on six things: climate, water, energy, lifespan, transport and
          repairability. It scores <strong>{result.score}/100</strong>.
        </li>
        <li>
          <strong>Tier:</strong> {result.score}/100 puts it in <strong>tier {result.tier}</strong>
          , which gives {formatPct(result.tierPct)} cashback.
        </li>
        {result.overridden ? (
          <li>
            <strong>Campaign:</strong> right now there's a campaign on this product, so you get{' '}
            <strong>{formatPct(result.finalPct)}</strong> cashback.
          </li>
        ) : (
          secondhand && (
            <li>
              <strong>Second-hand:</strong> nothing new had to be made, so you get extra cashback on
              top: <strong>{formatPct(result.finalPct)}</strong> in total.
            </li>
          )
        )}
        <li>
          <strong>Points:</strong> {formatPct(result.finalPct)} of {formatSek(product.priceSek)} is{' '}
          <strong>{formatNumber(result.points)} points</strong>, rounded down. 1 point = 1 SEK on
          your next purchase.
        </li>
      </ol>
      <p>The cashback depends on how sustainable the product is, not on how much you spend.</p>
    </div>
  );
}

export function ProductPage() {
  const { id } = useParams();
  const { catalogue } = useStore();
  const addToBag = useAddToBag();
  const [quantity, setQuantity] = useState(1);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const product = id ? catalogue.products.get(id) : undefined;
  usePageTitle(product ? `${product.name}, ${product.description}` : 'Not found');

  if (!product) return <NotFoundPage />;
  const result = catalogue.results.get(product.id)!;
  const group = catalogue.groups.get(product.comparisonGroup)!;
  const co2 = co2AvoidedPerYear(product, group);

  const others = group
    .filter((p) => p.id !== product.id)
    .map((p) => ({ p, r: catalogue.results.get(p.id)! }))
    .sort(
      (a, b) =>
        Number(b.p.condition === 'secondhand') - Number(a.p.condition === 'secondhand') ||
        a.r.priceAfterCashback - b.r.priceAfterCashback,
    );
  // Flag the option with the highest cashback %. Usually second-hand, thanks to the bonus.
  const bestPct = Math.max(...others.map(({ r }) => r.finalPct));
  const mostBackId = others.find(({ r }) => r.finalPct === bestPct && bestPct > result.finalPct)?.p.id;

  const openBreakdown = () => {
    setBreakdownOpen(true);
    requestAnimationFrame(() => {
      const el = document.getElementById('sustainability');
      el?.scrollIntoView({ block: 'start' });
      el?.querySelector('summary')?.focus();
    });
  };

  return (
    <div className="page">
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link to="/demo">Products</Link>
        <span aria-hidden="true"> / </span>
        <Link to={`/demo/category/${product.category}`}>
          {categories.find((c) => c.slug === product.category)?.name}
        </Link>
      </nav>

      <div className={styles.layout}>
        <div className={styles.media}>
          <ProductImage product={product} />
        </div>

        <div className={styles.buy}>
          {product.condition === 'secondhand' && <SecondhandBadge />}
          <div>
            <h1 className={styles.name}>
              {product.name}
              {product.condition === 'secondhand' && (
                <span className="visually-hidden"> (second-hand)</span>
              )}
            </h1>
            <p className={styles.description}>{product.description}</p>
          </div>
          <div>
            <Price value={product.priceSek} size="l" />
            <p className={styles.after}>{formatSek(result.priceAfterCashback)} after cashback</p>
          </div>
          <p className={styles.score}>
            <TierBadge tier={result.tier} showLabel />
            <span>Sustainability score {result.score}/100</span>
          </p>
          <div className={styles.addRow}>
            <QuantityStepper value={quantity} onChange={setQuantity} label="Quantity" />
            <Button
              variant="emphasised"
              size="l"
              fullWidth
              onClick={() => {
                addToBag(product.id, quantity);
                setQuantity(1);
              }}
            >
              Add to shopping bag
            </Button>
          </div>
          <PointsLine
            result={result}
            condition={product.condition}
            quantity={quantity}
            onWhy={openBreakdown}
          />
          {product.condition === 'secondhand' && product.secondhandNote && (
            <p className={styles.note}>{product.secondhandNote}</p>
          )}

          <InfoBox>
            <h2 className={styles.boxTitle}>Other options in this group</h2>
            <ul role="list" className={styles.options}>
              {others.map(({ p, r }) => (
                <li key={p.id}>
                  <Link to={`/demo/product/${p.id}`} className={styles.option}>
                    <span className={styles.optionName}>
                      {p.name}
                      {p.condition === 'secondhand' && ' · Second-hand'}
                      {p.id === mostBackId && (
                        <span className={styles.flag}>Highest cashback</span>
                      )}
                    </span>
                    <span className={styles.optionMeta}>
                      <TierBadge tier={r.tier} />
                      <span>
                        {formatSek(p.priceSek)} · <strong>{formatSek(r.priceAfterCashback)}</strong>{' '}
                        after cashback
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </InfoBox>
        </div>
      </div>

      <div className={styles.details}>
        <Accordion
          id="sustainability"
          title="Sustainability breakdown"
          open={breakdownOpen}
          onToggle={setBreakdownOpen}
        >
          <ul role="list" className={styles.bars}>
            {FACTOR_KEYS.map((key) => {
              const score = Math.round(result.factors[key]);
              return (
                <li key={key} className={styles.bar}>
                  <div className={styles.barLabel}>
                    <span>{FACTOR_LABELS[key]}</span>
                    <span className={styles.barValue}>{rawValue(product, key)}</span>
                  </div>
                  <div className={styles.track} aria-hidden="true">
                    <div className={styles.fill} style={{ width: `${score}%` }} />
                  </div>
                  <span className={styles.barScore}>
                    {score}
                    <span className="visually-hidden"> out of 100</span>
                  </span>
                </li>
              );
            })}
          </ul>
          {co2 > 0 && (
            <p className={styles.co2}>
              About {co2.toFixed(1)} kg CO2e less per year of use than the cheapest alternative.
            </p>
          )}
          {product.condition === 'secondhand' && (
            <p className={styles.small}>
              For second-hand products, only refurbishment and transport count, spread over the
              remaining years of use.
            </p>
          )}
          <p className={styles.small}>
            Each bar compares this product with the others in its group: 100 is the best in the
            group, 0 the weakest.
          </p>
          <Simulated />
        </Accordion>
        <Accordion title="How your cashback is calculated">
          <Explanation product={product} result={result} groupSize={group.length} />
          <Simulated />
        </Accordion>
        <Accordion title="Materials">
          <p className={styles.prose}>{product.materials}</p>
          {product.secondhandNote && (
            <p className={styles.prose}>
              <strong>Condition:</strong> {product.secondhandNote}
            </p>
          )}
          <Simulated />
        </Accordion>
      </div>
    </div>
  );
}
