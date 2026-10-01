import { useState } from 'react';
import { Accordion } from '../../components/Accordion';
import { PilotBadge, SecondhandBadge } from '../../components/Badges';
import { Button } from '../../components/Button';
import { InfoBox } from '../../components/InfoBox';
import { PointsLine } from '../../components/PointsLine';
import { Price } from '../../components/Price';
import { ProductCard } from '../../components/ProductCard';
import { QuantityStepper } from '../../components/QuantityStepper';
import { TierBadge } from '../../components/TierBadge';
import type { Tier } from '../../lib/types';
import { useStore } from '../../state/store';
import { usePageTitle } from '../../usePageTitle';
import shop from './Shop.module.css';
import styles from './StyleguidePage.module.css';

const TIERS: Tier[] = ['A', 'B', 'C', 'D', 'E'];

// SPEC.md 5.12: internal page, not linked from the navigation.
export function StyleguidePage() {
  const { catalogue } = useStore();
  const [qty, setQty] = useState(1);
  usePageTitle('Styleguide');
  const stadig = catalogue.products.get('stadig-bookcase-80')!;
  const stadigSh = catalogue.products.get('stadig-bookcase-80-sh')!;

  return (
    <div className="page">
      <div className={shop.section}>
        <h1 className={shop.title}>Styleguide</h1>
        <p className={shop.lead}>
          Internal page with the shared components. Values come from <code>tokens.css</code>.
        </p>
      </div>

      <section className={styles.block}>
        <h2 className={shop.subtitle}>Typography</h2>
        <p className={styles.display}>Display 40/50</p>
        <p className={styles.h1}>Heading 1, 24/30</p>
        <p className={styles.h2}>Heading 2, 20/28</p>
        <p className={styles.h3}>Heading 3, 16/24</p>
        <p className={styles.lead}>Lead 20/32. Short, warm, practical sentences.</p>
        <p>Body 14/22. Earn 69 points when you choose this one.</p>
        <p className={styles.caption}>Caption 12/16. Simulated data for this prototype.</p>
      </section>

      <section className={styles.block}>
        <h2 className={shop.subtitle}>Buttons</h2>
        <div className={styles.row}>
          <Button variant="emphasised" size="l">
            Add to shopping bag
          </Button>
          <Button variant="primary">Save model</Button>
          <Button variant="secondary">Reset demo</Button>
          <Button variant="tertiary">Learn more</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </section>

      <section className={styles.block}>
        <h2 className={shop.subtitle}>Prices and badges</h2>
        <div className={styles.row}>
          <Price value={699} size="l" />
          <Price value={3495} size="m" />
          <Price value={1299} size="s" />
        </div>
        <div className={styles.row}>
          {TIERS.map((t) => (
            <TierBadge key={t} tier={t} showLabel />
          ))}
        </div>
        <div className={styles.row}>
          <SecondhandBadge />
          <PilotBadge />
        </div>
      </section>

      <section className={styles.block}>
        <h2 className={shop.subtitle}>ReWard points line</h2>
        <div className={styles.stack}>
          <PointsLine result={catalogue.results.get(stadig.id)!} condition="new" onWhy={() => {}} />
          <PointsLine result={catalogue.results.get(stadigSh.id)!} condition="secondhand" />
          <PointsLine
            result={{ ...catalogue.results.get(stadig.id)!, finalPct: 20, points: 139, overridden: true }}
            condition="new"
          />
        </div>
      </section>

      <section className={styles.block}>
        <h2 className={shop.subtitle}>Inputs</h2>
        <QuantityStepper value={qty} onChange={setQty} label="Quantity" />
      </section>

      <section className={styles.block}>
        <h2 className={shop.subtitle}>Info box and accordion</h2>
        <div className={styles.stack}>
          <InfoBox>Grey info box, radius 8, padding 16.</InfoBox>
          <InfoBox variant="bordered">Bordered info box.</InfoBox>
          <div>
            <Accordion title="Sustainability breakdown">
              <p>Panel content.</p>
            </Accordion>
            <Accordion title="Materials">
              <p>Solid pine, water-based lacquer.</p>
            </Accordion>
          </div>
        </div>
      </section>

      <section className={styles.block}>
        <h2 className={shop.subtitle}>Product cards</h2>
        <div className={styles.cards}>
          <ProductCard product={stadig} result={catalogue.results.get(stadig.id)!} />
          <ProductCard product={stadigSh} result={catalogue.results.get(stadigSh.id)!} />
        </div>
      </section>
    </div>
  );
}
