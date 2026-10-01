import { AlertTriangle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../../components/Button';
import { InfoBox } from '../../components/InfoBox';
import { TierBadge } from '../../components/TierBadge';
import { useAnnounce } from '../../components/Toast';
import { categories, defaultModel, products } from '../../data';
import {
  buildCatalogue,
  FACTOR_KEYS,
  modelKpis,
  validateModel,
  type ModelError,
} from '../../lib/cashback';
import { formatNumber, formatPct, formatSek } from '../../lib/format';
import type { CashbackModel, CashbackResult, FactorKey, Product } from '../../lib/types';
import { cloneModel } from '../../state/defaults';
import { useStore } from '../../state/store';
import { usePageTitle } from '../../usePageTitle';
import styles from './AdminPage.module.css';

const FACTOR_LABELS: Record<FactorKey, string> = {
  co2: 'CO2',
  water: 'Water',
  energy: 'Energy',
  lifespan: 'Lifespan',
  transport: 'Transport',
  repairability: 'Repairability',
};

type SortKey =
  | 'name'
  | 'condition'
  | 'price'
  | 'margin'
  | 'score'
  | 'tier'
  | 'tierPct'
  | 'bonus'
  | 'cap'
  | 'final'
  | 'points';

const COLUMNS: { key: SortKey; label: string; num?: boolean }[] = [
  { key: 'name', label: 'Product' },
  { key: 'condition', label: 'Condition' },
  { key: 'price', label: 'Price', num: true },
  { key: 'margin', label: 'Margin', num: true },
  { key: 'score', label: 'Score', num: true },
  { key: 'tier', label: 'Tier' },
  { key: 'tierPct', label: 'Tier %', num: true },
  { key: 'bonus', label: 'Bonus', num: true },
  { key: 'cap', label: 'Cap', num: true },
  { key: 'final', label: 'Final %', num: true },
  { key: 'points', label: 'Points', num: true },
];

function sortValue(p: Product, r: CashbackResult, key: SortKey): number | string {
  switch (key) {
    case 'name':
      return p.name;
    case 'condition':
      return p.condition;
    case 'price':
      return p.priceSek;
    case 'margin':
      return p.marginPct;
    case 'score':
      return r.score;
    case 'tier':
      return r.tier;
    case 'tierPct':
      return r.tierPct;
    case 'bonus':
      return r.bonusPct;
    case 'cap':
      return r.maxPct;
    case 'final':
      return r.finalPct;
    case 'points':
      return r.points;
  }
}

function sameJson(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function NumberField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  invalid,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  invalid?: boolean;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <span className={styles.inputWrap}>
        <input
          id={id}
          type="number"
          value={Number.isNaN(value) ? '' : value}
          min={min}
          max={max}
          step={step}
          aria-invalid={invalid || undefined}
          onChange={(e) => onChange(e.target.value === '' ? Number.NaN : Number(e.target.value))}
        />
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </span>
    </div>
  );
}

function Errors({ errors }: { errors: ModelError[] }) {
  if (errors.length === 0) return null;
  return (
    <ul className={styles.errors} role="list">
      {errors.map((e) => (
        <li key={e.message}>
          <AlertTriangle size={16} strokeWidth={2} aria-hidden="true" />
          {e.message}
        </li>
      ))}
    </ul>
  );
}

export function AdminPage() {
  const { state, dispatch } = useStore();
  const announce = useAnnounce();
  usePageTitle('Admin view');

  const [draft, setDraft] = useState<CashbackModel>(() => cloneModel(state.model));
  const [draftOverrides, setDraftOverrides] = useState<Record<string, number | null>>(() => ({
    ...state.overrides,
  }));
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'score', dir: -1 });

  const errors = validateModel(draft);
  const valid = errors.length === 0;
  const dirty = !sameJson(draft, state.model) || !sameJson(draftOverrides, state.overrides);

  // Preview the draft when it is valid; otherwise keep showing the saved model.
  const preview = useMemo(
    () =>
      valid
        ? buildCatalogue(products, draft, draftOverrides)
        : buildCatalogue(products, state.model, state.overrides),
    [valid, draft, draftOverrides, state.model, state.overrides],
  );
  const kpis = modelKpis(products, preview.results);
  const totalWeight = FACTOR_KEYS.reduce((n, k) => n + (draft.weights[k] || 0), 0);

  const rows = products
    .filter((p) => category === 'all' || p.category === category)
    .map((p) => ({ p, r: preview.results.get(p.id)! }))
    .sort((a, b) => {
      const va = sortValue(a.p, a.r, sort.key);
      const vb = sortValue(b.p, b.r, sort.key);
      const cmp = typeof va === 'string' ? va.localeCompare(String(vb)) : va - Number(vb);
      return cmp * sort.dir;
    });

  const setWeight = (key: FactorKey, value: number) =>
    setDraft((d) => ({ ...d, weights: { ...d.weights, [key]: value } }));
  const setTier = (index: number, field: 'minScore' | 'pct', value: number) =>
    setDraft((d) => ({
      ...d,
      tiers: d.tiers.map((t, i) => (i === index ? { ...t, [field]: value } : t)),
    }));

  const save = () => {
    dispatch({ type: 'SET_MODEL', model: cloneModel(draft) });
    const ids = new Set([...Object.keys(state.overrides), ...Object.keys(draftOverrides)]);
    for (const id of ids) {
      dispatch({ type: 'SET_OVERRIDE', productId: id, value: draftOverrides[id] ?? null });
    }
    announce('Model saved. The shop now uses the new cashback model.');
  };

  const restore = () => {
    setDraft(cloneModel(defaultModel));
    setDraftOverrides({});
    announce('Defaults restored in the preview. Save to use them in the shop.', { visual: false });
  };

  const sortBy = (key: SortKey) =>
    setSort((s) => ({ key, dir: s.key === key ? ((-s.dir) as 1 | -1) : key === 'name' ? 1 : -1 }));

  return (
    <div className="page">
      <div className={styles.head}>
        <p className={styles.label}>Admin view: how IKEA would manage ReWard</p>
        <h1 className={styles.title}>Cashback model</h1>
        <p className={styles.lead}>
          Change the weights, tiers, second-hand bonus and margin cap, and see the effect on every
          product. The shop only changes when you save.
        </p>
      </div>

      <div className={styles.layout}>
        <form
          className={styles.settings}
          onSubmit={(e) => {
            e.preventDefault();
            if (valid && dirty) save();
          }}
        >
          <fieldset className={styles.group}>
            <legend>Factor weights</legend>
            <p className={styles.help}>0 to 50 each. The share shows how much each factor counts.</p>
            {FACTOR_KEYS.map((key) => {
              const value = draft.weights[key];
              const share = totalWeight > 0 && Number.isFinite(value) ? (value / totalWeight) * 100 : 0;
              return (
                <div key={key} className={styles.weight}>
                  <label htmlFor={`w-${key}`} className={styles.weightLabel}>
                    {FACTOR_LABELS[key]}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={1}
                    value={Number.isFinite(value) ? value : 0}
                    aria-label={`${FACTOR_LABELS[key]} weight`}
                    onChange={(e) => setWeight(key, Number(e.target.value))}
                    className={styles.slider}
                  />
                  <input
                    id={`w-${key}`}
                    type="number"
                    min={0}
                    max={50}
                    value={Number.isFinite(value) ? value : ''}
                    onChange={(e) =>
                      setWeight(key, e.target.value === '' ? Number.NaN : Number(e.target.value))
                    }
                    className={styles.small}
                  />
                  <span className={styles.share}>{formatPct(share)}</span>
                </div>
              );
            })}
            <Errors errors={errors.filter((e) => e.field === 'weights')} />
          </fieldset>

          <fieldset className={styles.group}>
            <legend>Tiers</legend>
            <p className={styles.help}>
              Minimum scores must go down from A to E, and cashback can't go up.
            </p>
            <table className={styles.tierTable}>
              <thead>
                <tr>
                  <th scope="col">Tier</th>
                  <th scope="col">Min score</th>
                  <th scope="col">Cashback %</th>
                </tr>
              </thead>
              <tbody>
                {draft.tiers.map((t, i) => (
                  <tr key={t.tier}>
                    <th scope="row">
                      <TierBadge tier={t.tier} showLabel />
                    </th>
                    <td>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        aria-label={`Minimum score for tier ${t.tier}`}
                        value={Number.isFinite(t.minScore) ? t.minScore : ''}
                        onChange={(e) =>
                          setTier(i, 'minScore', e.target.value === '' ? Number.NaN : Number(e.target.value))
                        }
                        className={styles.small}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        aria-label={`Cashback percent for tier ${t.tier}`}
                        value={Number.isFinite(t.pct) ? t.pct : ''}
                        onChange={(e) =>
                          setTier(i, 'pct', e.target.value === '' ? Number.NaN : Number(e.target.value))
                        }
                        className={styles.small}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Errors errors={errors.filter((e) => e.field === 'tiers')} />
          </fieldset>

          <fieldset className={styles.group}>
            <legend>Second-hand and margin</legend>
            <NumberField
              id="bonus"
              label="Second-hand bonus (percentage points)"
              value={draft.secondhandBonusPct}
              min={0}
              step={0.5}
              suffix="pp"
              invalid={errors.some((e) => e.field === 'secondhandBonusPct')}
              onChange={(v) => setDraft((d) => ({ ...d, secondhandBonusPct: v }))}
            />
            <NumberField
              id="share"
              label="Max share of margin given as cashback"
              value={Math.round(draft.maxShareOfMargin * 1000) / 10}
              min={0}
              max={100}
              suffix="%"
              invalid={errors.some((e) => e.field === 'maxShareOfMargin')}
              onChange={(v) => setDraft((d) => ({ ...d, maxShareOfMargin: v / 100 }))}
            />
            <Errors
              errors={errors.filter(
                (e) => e.field === 'secondhandBonusPct' || e.field === 'maxShareOfMargin',
              )}
            />
          </fieldset>

          <div className={styles.buttons}>
            <Button type="submit" variant="primary" disabled={!valid || !dirty}>
              Save model
            </Button>
            <Button variant="secondary" onClick={restore}>
              Restore defaults
            </Button>
          </div>
          <p className={styles.status} aria-live="polite">
            {!valid
              ? 'Fix the errors above to preview and save.'
              : dirty
                ? 'Preview, not saved. The shop still uses the saved model.'
                : 'Saved. The shop uses this model.'}
          </p>
        </form>

        <section className={styles.results} aria-labelledby="results-title">
          <h2 id="results-title" className={styles.subtitle}>
            Results {dirty && valid && <span className={styles.previewTag}>Preview, not saved</span>}
          </h2>
          <dl className={styles.kpis}>
            <div>
              <dt>Average cashback</dt>
              <dd>{formatPct(kpis.averageCashbackPct)}</dd>
            </div>
            <div>
              <dt>Catalogue in tier A or B</dt>
              <dd>{formatPct(kpis.shareTierAB * 100)}</dd>
            </div>
            <div>
              <dt>Capped products</dt>
              <dd>{kpis.cappedCount}</dd>
            </div>
            <div>
              <dt>Cashback cost of revenue*</dt>
              <dd>{formatPct(kpis.cashbackCostShareOfRevenue * 100)}</dd>
            </div>
            <div>
              <dt>Margin kept after cashback*</dt>
              <dd>{formatPct(kpis.marginKeptShare * 100)}</dd>
            </div>
          </dl>
          <p className={styles.help}>
            * Assumes one unit sold of each product. Simulated prices and margins.
          </p>

          <div className={styles.tableTools}>
            <label className={styles.filter}>
              <span>Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <p className={styles.help}>{rows.length} products</p>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className="visually-hidden">
                Products with score, tier and cashback. Column headers sort the table.
              </caption>
              <thead>
                <tr>
                  {COLUMNS.map((c) => (
                    <th
                      key={c.key}
                      scope="col"
                      className={c.num ? styles.num : undefined}
                      aria-sort={
                        sort.key === c.key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'
                      }
                    >
                      <button type="button" className={styles.sortButton} onClick={() => sortBy(c.key)}>
                        {c.label}
                        <span aria-hidden="true">
                          {sort.key === c.key ? (sort.dir === 1 ? ' ↑' : ' ↓') : ''}
                        </span>
                      </button>
                    </th>
                  ))}
                  <th scope="col">Override %</th>
                  <th scope="col">Flags</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ p, r }) => {
                  const override = draftOverrides[p.id];
                  const overCap = override !== undefined && override !== null && override > r.maxPct;
                  return (
                    <tr key={p.id}>
                      <th scope="row" className={styles.productCell}>
                        {p.name}
                        <span className={styles.productDesc}>{p.description}</span>
                      </th>
                      <td>{p.condition === 'new' ? 'New' : 'Second-hand'}</td>
                      <td className={styles.num}>{formatSek(p.priceSek)}</td>
                      <td className={styles.num}>{formatPct(p.marginPct)}</td>
                      <td className={styles.num}>{r.score}</td>
                      <td>
                        <TierBadge tier={r.tier} />
                      </td>
                      <td className={styles.num}>{formatPct(r.tierPct)}</td>
                      <td className={styles.num}>{r.bonusPct ? `+${formatPct(r.bonusPct)}` : '–'}</td>
                      <td className={styles.num}>{formatPct(r.maxPct)}</td>
                      <td className={`${styles.num} ${styles.strong}`}>{formatPct(r.finalPct)}</td>
                      <td className={styles.num}>{formatNumber(r.points)}</td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          step={0.5}
                          className={styles.small}
                          aria-label={`Override cashback percent for ${p.name}${p.condition === 'secondhand' ? ' (second-hand)' : ''}`}
                          aria-describedby={overCap ? `warn-${p.id}` : undefined}
                          value={override ?? ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDraftOverrides((o) => {
                              const next = { ...o };
                              if (v === '' || Number(v) < 0 || !Number.isFinite(Number(v))) delete next[p.id];
                              else next[p.id] = Number(v);
                              return next;
                            });
                          }}
                        />
                      </td>
                      <td className={styles.flags}>
                        {r.capped && <span className={styles.caution}>Capped</span>}
                        {r.overridden && <span className={styles.flag}>Override</span>}
                        {overCap && (
                          <span id={`warn-${p.id}`} className={styles.caution}>
                            <AlertTriangle size={16} strokeWidth={2} aria-hidden="true" />
                            Above the {formatPct(r.maxPct)} margin cap
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <InfoBox className={styles.note}>
            The cap is the product's margin × the max share. Overrides are for campaigns and pilots
            and ignore the cap, so check the warning before you save. Customers never see the cap,
            only the final percentage.
          </InfoBox>
        </section>
      </div>
    </div>
  );
}
