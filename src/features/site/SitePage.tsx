import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Accordion } from '../../components/Accordion';
import { Button } from '../../components/Button';
import { Carousel } from '../../components/Carousel';
import { Footer } from '../../components/Footer';
import { TierBadge } from '../../components/TierBadge';
import { Wordmark } from '../../components/Wordmark';
import { CONTACT_EMAIL, DEMO_VIDEO_EMBED_URL, PITCH_VIDEO_EMBED_URL } from '../../config';
import { defaultModel, products } from '../../data';
import { buildCatalogue } from '../../lib/cashback';
import { formatPct, formatSek } from '../../lib/format';
import { usePageTitle } from '../../usePageTitle';
import { PITCH_SLIDES } from './pitchSlides';
import styles from './SitePage.module.css';

const NAV = [
  { id: 'problem', label: 'Problem' },
  { id: 'solution', label: 'Solution' },
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

          <ul role="list" className={styles.impact}>
            <li>
              <strong>Less climate impact.</strong> Products that last longer and emit less per year
              score higher.
            </li>
            <li>
              <strong>Reuse first.</strong> Second-hand always gives the most back, so the reward
              doesn't push new production.
            </li>
            <li>
              <strong>Still profitable.</strong> A cap based on each product's margin keeps IKEA
              from losing money.
            </li>
          </ul>
        </Section>

        {/* 4. Try the prototype */}
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

        {/* 5. More about the project: details for those who want them, closed by default */}
        <Section id="more" title="More about the project" grey>
          <div className={styles.more}>
            <Accordion title="Sustainability impact">
              <div className={styles.prose}>
                <p>
                  <strong>Individual:</strong> people on a tight budget get the freedom to choose
                  the sustainable option. The score is shown openly, so the choice stays theirs.
                </p>
                <p>
                  <strong>Social:</strong> everyone can use it. The incentive is strongest for
                  households with the least room to choose today.
                </p>
                <p>
                  <strong>Economic:</strong> rewards bring customers back. Loyalty members bring
                  12-18 % more revenue growth per year [2]. Points are spent at IKEA, and a margin
                  cap protects profit.
                </p>
                <p>
                  <strong>Technical:</strong> IKEA updates the model in an admin view. It is built
                  to sit on top of existing systems like IKEA Family, not as a new app.
                </p>
                <p>
                  <strong>Environmental:</strong> the system itself needs little server capacity.
                  Its real effect is on behaviour: towards lower impact per year of use, and towards
                  second-hand.
                </p>
                <p>
                  <strong>The risk:</strong> points can make people buy more in general. That's why
                  the reward grows with sustainability, not with the amount, and why second-hand
                  always gives the most back.
                </p>
              </div>
            </Accordion>
            <Accordion title="Real vs simulated">
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">Part</th>
                      <th scope="col">In the prototype</th>
                      <th scope="col">A real version needs</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">Calculation</th>
                      <td>Working and tested</td>
                      <td>The same logic in IKEA's systems</td>
                    </tr>
                    <tr>
                      <th scope="row">Products and prices</th>
                      <td>24 invented products</td>
                      <td>The IKEA range</td>
                    </tr>
                    <tr>
                      <th scope="row">Sustainability data</th>
                      <td>Simulated</td>
                      <td>IKEA's life cycle (LCA) data</td>
                    </tr>
                    <tr>
                      <th scope="row">Scoring</th>
                      <td>Compared within each product group</td>
                      <td>Fixed benchmarks per category</td>
                    </tr>
                    <tr>
                      <th scope="row">Margins</th>
                      <td>Simulated</td>
                      <td>IKEA's margin data</td>
                    </tr>
                    <tr>
                      <th scope="row">Points</th>
                      <td>Saved in your browser</td>
                      <td>IKEA Family</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Accordion>
          </div>
        </Section>

        {/* 6. Pitch: required by the course. Slides now; the video appears when its URL is set. */}
        <Section id="pitch" title="Pitch">
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
