import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Footer } from '../../components/Footer';
import { TierBadge } from '../../components/TierBadge';
import { Wordmark } from '../../components/Wordmark';
import {
  CONTACT_EMAIL,
  DEMO_VIDEO_EMBED_URL,
  PITCH_VIDEO_EMBED_URL,
  SLIDES_EMBED_URL,
  SLIDES_VIEW_URL,
} from '../../config';
import { defaultModel, products } from '../../data';
import { buildCatalogue } from '../../lib/cashback';
import { formatPct, formatSek } from '../../lib/format';
import { usePageTitle } from '../../usePageTitle';
import styles from './SitePage.module.css';

const NAV = [
  { id: 'problem', label: 'Problem' },
  { id: 'solution', label: 'Solution' },
  { id: 'evaluation', label: 'Evaluation' },
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
      'The prototype already works: shop, bag, points wallet and admin view, on a rule-based scoring engine.',
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

// TODO(team): add a photo per person in public/images/site/team/.
const TEAM = ['Moa Pettersson', 'Sofia Nguyen', 'Isak Treptow', 'Sara Salam', 'Max Fägersten'];

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

export function SitePage() {
  usePageTitle('');

  return (
    <>
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
            <table className={styles.table}>
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
                    <td className={styles.num}>{formatSek(p.priceSek)}</td>
                    <td>
                      <TierBadge tier={r.tier} showLabel />
                    </td>
                    <td className={styles.num}>{r.points}</td>
                    <td
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

        {/* 4. Evaluation: usability, feasibility, viability, sustainability */}
        <Section id="evaluation" title="Does it hold up?">
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

        {/* 5. Try the prototype */}
        <Section id="prototype" title="Try the prototype" grey>
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

        {/* 6. Pitch: required by the course, kept minimal */}
        <Section id="pitch" title="Pitch">
          <div className={styles.twoCol}>
            <figure className={styles.figure}>
              {PITCH_VIDEO_EMBED_URL ? (
                <div className={styles.video}>
                  <iframe
                    src={PITCH_VIDEO_EMBED_URL}
                    title="Pitch video"
                    loading="lazy"
                    allow="fullscreen"
                  />
                </div>
              ) : (
                <div className={styles.placeholder}>Pitch video coming soon</div>
              )}
            </figure>
            <figure className={styles.figure}>
              <div className={styles.video}>
                <iframe
                  src={SLIDES_EMBED_URL}
                  title="Pitch slides"
                  loading="lazy"
                  allow="fullscreen"
                />
              </div>
              <figcaption>
                <a href={SLIDES_VIEW_URL} target="_blank" rel="noreferrer">
                  Open the slides in Canva
                </a>
              </figcaption>
            </figure>
          </div>
        </Section>

        {/* 7. Team */}
        <Section id="team" title="Team" grey>
          <ul role="list" className={styles.team}>
            {TEAM.map((name) => (
              <li key={name}>
                <span className={styles.avatar} aria-hidden="true">
                  {initials(name)}
                </span>
                <h3 className={styles.h3}>{name}</h3>
              </li>
            ))}
          </ul>
          <p className={styles.small}>Group 12, TEK830 Capstone, Chalmers.</p>
        </Section>

        {/* 8. References */}
        <Section id="references" title="References">
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
          </ol>
        </Section>

        {/* 9. GenAI */}
        <Section id="genai" title="Use of generative AI" grey>
          <p className={styles.prose}>
            Claude (Anthropic) helped us a lot with the code, with brainstorming, and with
            correcting our text. The idea and the decisions are ours, and we reviewed everything
            before publishing.
          </p>
        </Section>

        {/* 10. Contact */}
        <Section id="contact" title="Contact">
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
