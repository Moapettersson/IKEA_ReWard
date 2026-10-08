import { ArrowDown, ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Carousel } from '../../components/Carousel';
import { ScrollManager } from '../../components/DemoLayout';
import { Footer } from '../../components/Footer';
import { TierBadge } from '../../components/TierBadge';
import { Wordmark } from '../../components/Wordmark';
import { CONTACT_EMAIL, DEMO_VIDEO_EMBED_URL, PITCH_VIDEO_EMBED_URL } from '../../config';
import { defaultModel, products } from '../../data';
import { buildCatalogue } from '../../lib/cashback';
import { formatPct, formatSek } from '../../lib/format';
import { usePageTitle } from '../../usePageTitle';
import { PITCH_SLIDES } from './pitchSlides';
import {
  CHAINS,
  DIMENSIONS,
  EFFECTS,
  IMPACTS,
  LIKELIHOODS,
  ORDERS,
  effect,
  isRisk,
  type Effect,
} from './sustainability';
import styles from './SitePage.module.css';

const NAV = [
  { id: 'problem', label: 'Problem' },
  { id: 'solution', label: 'Solution' },
  { id: 'evaluation', label: 'Design thinking' },
  { id: 'sustainability', label: 'Sustainability' },
  { id: 'prototype', label: 'Prototype' },
  { id: 'pitch', label: 'Pitch' },
  { id: 'team', label: 'Team' },
];

// Numbers on the site come from the engine with the default model, like the worked example.
const defaults = buildCatalogue(products, defaultModel, {});
const example = ['langsam-bookcase-80', 'stadig-bookcase-80', 'stadig-bookcase-80-sh'].map(
  (id) => ({
    p: defaults.products.get(id)!,
    r: defaults.results.get(id)!,
  }),
);
const [cheap, durable, secondhand] = example as [
  (typeof example)[number],
  (typeof example)[number],
  (typeof example)[number],
];

const topTier = defaultModel.tiers[0]!;

// The four questions the concept is evaluated against. Numbers come from the default model.
const LENSES: { title: string; question: string; points: string[] }[] = [
  {
    title: 'Usability',
    question: 'Will people use it?',
    points: [
      'Maria shops on a tight budget. Johan buys once and keeps things for years.',
      'At IKEA, a commercial manager sets the cashback model in the admin view.',
      'Today the cheap choice and the sustainable choice are rarely the same.',
      'ReWard shows tier, points and price after cashback next to every price, right when you choose.',
    ],
  },
  {
    title: 'Feasibility',
    question: 'Can it be built?',
    points: [
      'The prototype already works as a React and TypeScript web app: shop, bag, points wallet and admin view.',
      'The score combines six factors: CO2, water, energy, lifespan, transport and repairability.',
      'A real launch needs life-cycle data for each product from IKEA.',
      'Points could run through IKEA Family, and second-hand through IKEA Buy Back. All data in the prototype is simulated.',
    ],
  },
  {
    title: 'Viability',
    question: 'Does it work for IKEA?',
    points: [
      "It supports IKEA's circular ambitions and its idea of a better everyday life for the many.",
      `Cashback never takes more than ${formatPct(defaultModel.maxShareOfMargin * 100)} of a product's margin, so nothing is sold at a loss.`,
      'Points can only be spent at IKEA, so the cashback comes back as sales.',
      'Members of loyalty programmes spend more than non-members (Accenture, 2016).',
    ],
  },
  {
    title: 'Sustainability',
    question: 'Is it good for people and planet?',
    points: [
      'Climate and resource impact is divided by lifespan, so products that last score higher. Each product shows how much CO2e it saves per year.',
      `Households like Maria's can afford the sustainable choice, with up to ${formatPct(topTier.pct)} back.`,
      'The margin cap keeps the model profitable, so it can keep running.',
      `Cashback could make people buy more. That's why second-hand gets ${formatPct(defaultModel.secondhandBonusPct)} extra and is always the most rewarded.`,
    ],
  },
];

// TODO(team): add the missing photos to public/images/site/team/. No photo = initials square.
const TEAM: { name: string; photo?: string }[] = [
  { name: 'Moa Pettersson', photo: '/images/site/team/moa-pettersson.jpg' },
  { name: 'Sofia Nguyen', photo: '/images/site/team/sofia-nguyen.jpg' },
  { name: 'Isak Treptow', photo: '/images/site/team/isak-treptow.jpg' },
  { name: 'Sara Salam' },
  { name: 'Max Fägersten' },
];

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('');
}

function Section({
  id,
  title,
  children,
  grey = false,
}: {
  id: string;
  title: string;
  children: ReactNode;
  grey?: boolean;
}) {
  return (
    <section
      id={id}
      className={grey ? `${styles.section} ${styles.grey}` : styles.section}
      aria-labelledby={`${id}-title`}
    >
      <div className="page">
        <h2 id={`${id}-title`} className={styles.h2}>
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

function EffectText({ e }: { e: Effect }) {
  return (
    <>
      <span className={styles.code}>
        {e.code} · {e.topic}
      </span>
      {isRisk(e) && <strong>Risk: </strong>}
      {e.text}
    </>
  );
}

export function SitePage() {
  usePageTitle('');

  return (
    <>
      <ScrollManager />
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <header className={styles.header}>
        <div className={`page ${styles.headerInner}`}>
          <Wordmark to="/" />
          <nav aria-label="Sections" className={styles.nav}>
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`}>
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        {/* 1. Hero */}
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={`page ${styles.heroInner}`}>
            <p className={styles.kicker}>TEK830 Capstone · IKEA Challenge 1 · Group 12</p>
            <h1 id="hero-title" className={styles.display}>
              IKEA ReWard
            </h1>
            <p className={styles.lead}>
              The more sustainable the product, the more cashback you get.{' '}
              <mark className={styles.mark}>Second-hand gives the most.</mark>
            </p>
            <Button to="/demo" variant="emphasised" className={styles.heroButton}>
              Try the prototype
              <ArrowRight size={24} strokeWidth={2} aria-hidden="true" />
            </Button>
            <a href="#pitch" className={styles.heroLink}>
              Watch the pitch
            </a>
          </div>
        </section>

        {/* 2. Problem */}
        <Section id="problem" title="The problem">
          <div className={styles.twoCol}>
            <p className={styles.quote}>
              “How can IKEA make sustainable choices the most affordable choice?”
            </p>
            <div className={styles.prose}>
              <p>
                Maria is a single mother of two on a tight budget. She cares about the environment,
                but when she shops at IKEA, the cheapest option usually wins.
              </p>
              <p>Today the cheap choice and the sustainable choice are rarely the same.</p>
              <p>
                We started by defining the real problem: helping people buy more sustainably without
                IKEA losing revenue. We compared new and second-hand products, brainstormed many
                solutions and voted on the best one.
              </p>
            </div>
          </div>
        </Section>

        {/* 3. Solution */}
        <Section id="solution" title="Our solution" grey>
          <ol className={styles.steps}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <h3 className={styles.h3}>Score</h3>
              <p>Every product gets a sustainability score from 0 to 100.</p>
            </li>
            <li className={styles.stepArrow} aria-hidden="true">
              <ArrowRight size={24} strokeWidth={2} />
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <h3 className={styles.h3}>Cashback</h3>
              <p>
                A higher score gives more cashback, up to {formatPct(defaultModel.tiers[0]!.pct)}.
                Second-hand gets {formatPct(defaultModel.secondhandBonusPct)} extra.
              </p>
            </li>
            <li className={styles.stepArrow} aria-hidden="true">
              <ArrowRight size={24} strokeWidth={2} />
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <h3 className={styles.h3}>Points</h3>
              <p>Cashback comes as points. 1 point = 1 SEK on your next purchase.</p>
            </li>
          </ol>

          <h3 className={`${styles.h3} ${styles.spaced}`}>Example: a bookcase</h3>
          <div className={styles.tableWrap}>
            <table className={`${styles.table} ${styles.cardTable}`}>
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col" className={styles.num}>
                    Price
                  </th>
                  <th scope="col">Tier</th>
                  <th scope="col" className={styles.num}>
                    Points
                  </th>
                  <th scope="col" className={styles.num}>
                    After cashback
                  </th>
                </tr>
              </thead>
              <tbody>
                {example.map(({ p, r }) => (
                  <tr key={p.id}>
                    <th scope="row">
                      {p.name}
                      {p.condition === 'secondhand' ? ' (second-hand)' : ''}
                    </th>
                    <td className={styles.num} data-label="Price">
                      {formatSek(p.priceSek)}
                    </td>
                    <td data-label="Tier">
                      <TierBadge tier={r.tier} showLabel />
                    </td>
                    <td className={styles.num} data-label="Points">
                      {r.points}
                    </td>
                    <td
                      data-label="After cashback"
                      className={`${styles.num} ${styles.strong} ${p.id === secondhand.p.id ? styles.best : ''}`}
                    >
                      {formatSek(r.priceAfterCashback)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.after}>
            The price gap shrinks from {formatSek(durable.p.priceSek - cheap.p.priceSek)} to{' '}
            {formatSek(durable.r.priceAfterCashback - cheap.r.priceAfterCashback)}, and second-hand
            is cheapest.
          </p>
        </Section>

        {/* 4. Design thinking: usability, feasibility, viability, sustainability */}
        <Section id="evaluation" title="Design thinking">
          <p className={styles.intro}>
            We tested the idea against four questions: usability, feasibility, viability and
            sustainability.
          </p>
          <div className={styles.lenses}>
            {LENSES.map(({ title, question, points }) => (
              <article key={title} className={styles.lens}>
                <div>
                  <h3 className={styles.h3}>{title}</h3>
                  <p className={styles.lensQuestion}>{question}</p>
                </div>
                <ul role="list" className={styles.lensPoints}>
                  {points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Section>

        {/* 5. Sustainability effects (SusAF): table, chains, likelihood and impact */}
        <Section id="sustainability" title="Sustainability effects" grey>
          <div className={styles.prose}>
            <p>
              We used the Sustainability Awareness Framework (Duboc et al., 2020). Immediate effects
              come from using ReWard, enabling effects from use over time, and structural effects
              are long-term changes.
            </p>
          </div>

          <h3 className={`${styles.h3} ${styles.spaced}`}>Effects by dimension</h3>
          <table className={`${styles.table} ${styles.effectTable}`}>
            <thead>
              <tr>
                <th scope="col">Dimension</th>
                {ORDERS.map((o) => (
                  <th key={o} scope="col">
                    {o}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DIMENSIONS.map((d) => (
                <tr key={d}>
                  <th scope="row">{d}</th>
                  {ORDERS.map((o) => {
                    const e = EFFECTS.find((x) => x.dimension === d && x.order === o)!;
                    return (
                      <td
                        key={o}
                        data-label={o}
                        className={isRisk(e) ? styles.riskCell : undefined}
                      >
                        <EffectText e={e} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className={`${styles.h3} ${styles.spaced}`}>Chains of effects</h3>
          <p className={styles.small}>How one feature leads to effects in other dimensions.</p>
          <div className={styles.chains}>
            {CHAINS.map(({ feature, steps }) => (
              <ol key={feature} role="list" className={styles.chain}>
                <li className={styles.chainFeature}>{feature}</li>
                {steps.map((code) => {
                  const e = effect(code);
                  return (
                    <li key={code} className={isRisk(e) ? styles.chainRisk : styles.chainStep}>
                      <ArrowRight
                        className={styles.chainArrowH}
                        size={24}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      <ArrowDown
                        className={styles.chainArrowV}
                        size={24}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      <span className={styles.chainMeta}>
                        {e.code} · {e.dimension} · {e.topic}
                      </span>
                      <span>
                        {isRisk(e) && <strong>Risk: </strong>}
                        {e.text}
                      </span>
                    </li>
                  );
                })}
              </ol>
            ))}
          </div>

          <h3 className={`${styles.h3} ${styles.spaced}`}>Likelihood and impact</h3>
          <p className={styles.small}>Each effect from the table, by likelihood and impact.</p>
          <table className={styles.matrix}>
            <thead>
              <tr>
                <td />
                {LIKELIHOODS.map((l) => (
                  <th key={l} scope="col">
                    {l} likelihood
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {IMPACTS.map((impact) => (
                <tr key={impact}>
                  <th scope="row">{impact}</th>
                  {LIKELIHOODS.map((l) => {
                    const cell = EFFECTS.filter((e) => e.impact === impact && e.likelihood === l);
                    return (
                      <td
                        key={l}
                        className={impact.endsWith('negative') ? styles.matrixRisk : undefined}
                      >
                        <ul role="list" className={styles.matrixCodes}>
                          {cell.map((e) => (
                            <li key={e.code} title={e.text}>
                              {e.code}
                              <span className="visually-hidden">: {e.text}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* 6. Try the prototype */}
        <Section id="prototype" title="Try the prototype">
          <div className={styles.twoCol}>
            <div className={styles.prose}>
              <p>
                You are Maria with 150 points. Find a bookcase for the kids' room, then check out.
              </p>
              <p>
                In the admin view you can change the model the way IKEA would, and see the points
                change.
              </p>
              <p className={styles.small}>
                Products, prices and sustainability data are simulated.
              </p>
              <div className={styles.row}>
                <Button to="/demo" variant="primary">
                  Open the prototype
                </Button>
                <Button to="/demo/admin" variant="secondary">
                  Open the admin view
                </Button>
              </div>
            </div>
            <figure className={styles.figure}>
              {DEMO_VIDEO_EMBED_URL ? (
                <div className={styles.video}>
                  <iframe
                    src={DEMO_VIDEO_EMBED_URL}
                    title="Prototype walkthrough video"
                    loading="lazy"
                    allow="fullscreen"
                  />
                </div>
              ) : (
                <img
                  src="/images/site/prototype-product.jpg"
                  alt="The product page for the STADIG bookcase in the prototype, with price, tier A and the ReWard points line."
                  width={1200}
                  height={750}
                  loading="lazy"
                />
              )}
            </figure>
          </div>

          <div className={styles.features}>
            <article className={styles.feature}>
              <img
                src="/images/site/prototype-category.jpg"
                alt="The storage category in the prototype, showing product cards with tier badges and points."
                width={1200}
                height={750}
                loading="lazy"
              />
              <h3 className={styles.h3}>For customers</h3>
              <p>Tier, points and price after cashback, next to every price.</p>
            </article>
            <article className={styles.feature}>
              <img
                src="/images/site/prototype-admin.jpg"
                alt="The admin view with factor weights, tier table and a product table with scores, caps and final cashback."
                width={1200}
                height={750}
                loading="lazy"
              />
              <h3 className={styles.h3}>For IKEA</h3>
              <p>Set weights, tiers and caps, and see the cost before you save.</p>
            </article>
          </div>
        </Section>

        {/* 7. Pitch: required by the course. Slides now; the video appears when its URL is set. */}
        <Section id="pitch" title="Pitch" grey>
          <div className={PITCH_VIDEO_EMBED_URL ? styles.twoCol : styles.pitchSingle}>
            {PITCH_VIDEO_EMBED_URL && (
              <div className={styles.video}>
                <iframe
                  src={PITCH_VIDEO_EMBED_URL}
                  title="Pitch video"
                  loading="lazy"
                  allow="fullscreen"
                />
              </div>
            )}
            <Carousel label="Pitch slides" slides={PITCH_SLIDES} width={1280} height={720} />
          </div>
        </Section>

        {/* 8. Team */}
        <Section id="team" title="Team">
          <ul role="list" className={styles.team}>
            {TEAM.map(({ name, photo }) => (
              <li key={name}>
                {photo ? (
                  <img
                    className={styles.avatar}
                    src={photo}
                    alt={`Portrait of ${name}`}
                    width={480}
                    height={480}
                    loading="lazy"
                  />
                ) : (
                  <span className={styles.avatar} aria-hidden="true">
                    {initials(name)}
                  </span>
                )}
                <h3 className={styles.h3}>{name}</h3>
              </li>
            ))}
          </ul>
          <div className={styles.course}>
            <img
              src="/images/site/chalmers-logo-white.svg"
              alt="Chalmers University of Technology"
              width={162}
              height={37}
            />
            <p>TEK830 Sustainable digitalization in practice · Group 12</p>
          </div>
        </Section>

        {/* 9. References */}
        <Section id="references" title="References" grey>
          <ol className={styles.references}>
            <li>IKEA (2026). IKEA challenges: proposal for the TEK830 Capstone course.</li>
            <li>
              Accenture (2016). Members of customer loyalty programs generate significantly more
              revenue for retailers than do non-members.{' '}
              <a
                href="https://newsroom.accenture.com/news/members-of-customer-loyalty-programs-generate-significantly-more-revenue-for-retailers-than-do-non-members-accenture-research-finds.htm"
                target="_blank"
                rel="noreferrer"
              >
                newsroom.accenture.com
              </a>
            </li>
            <li>
              Bond Brand Loyalty. The Loyalty Report.{' '}
              <a href="https://www.bondbl.com/tlr" target="_blank" rel="noreferrer">
                bondbl.com/tlr
              </a>
            </li>
            <li>
              Duboc, L., Penzenstadler, B., Porras, J., Akinli Kocak, S., Betz, S., Chitchyan, R.,
              Leifler, O., Seyff, N. and Venters, C. C. (2020). Requirements engineering for
              sustainability: an awareness framework for designing software systems for a better
              tomorrow. Requirements Engineering, 25, 469-492.{' '}
              <a href="https://doi.org/10.1007/s00766-020-00336-y" target="_blank" rel="noreferrer">
                doi.org/10.1007/s00766-020-00336-y
              </a>
            </li>
            <li>
              Inter IKEA Group (2025). Sustainability Statement FY25.{' '}
              <a
                href="https://www.ikea.com/global/en/our-business/reports/sustainability-reporting/"
                target="_blank"
                rel="noreferrer"
              >
                ikea.com
              </a>
            </li>
            <li>
              IKEA Sweden. IKEA Family.{' '}
              <a href="https://www.ikea.com/se/en/ikea-family/" target="_blank" rel="noreferrer">
                ikea.com/se/en/ikea-family
              </a>
            </li>
            <li>
              IKEA Sweden. Buyback &amp; Resell.{' '}
              <a href="https://www.ikea.com/se/en/second-hand/" target="_blank" rel="noreferrer">
                ikea.com/se/en/second-hand
              </a>
            </li>
            <li>
              React documentation.{' '}
              <a href="https://react.dev" target="_blank" rel="noreferrer">
                react.dev
              </a>
            </li>
            <li>
              Vite documentation.{' '}
              <a href="https://vite.dev" target="_blank" rel="noreferrer">
                vite.dev
              </a>
            </li>
            <li>
              Chalmers University of Technology (2026). TEK830 Sustainable digitalization in
              practice: Capstone project instructions.
            </li>
          </ol>
        </Section>

        {/* 10. GenAI */}
        <Section id="genai" title="Use of generative AI">
          <p className={styles.prose}>
            Claude (Anthropic) helped us a lot with the code, with brainstorming, and with
            correcting our text. The idea and the decisions are ours, and we reviewed everything
            before publishing.
          </p>
        </Section>

        {/* 11. Contact */}
        <Section id="contact" title="Contact" grey>
          <p className={styles.prose}>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> ·{' '}
            <Link to="/demo">Prototype</Link>
          </p>
        </Section>
      </main>
      <Footer />
    </>
  );
}
