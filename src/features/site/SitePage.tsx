import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Footer } from '../../components/Footer';
import { InfoBox } from '../../components/InfoBox';
import { TierBadge } from '../../components/TierBadge';
import { Wordmark } from '../../components/Wordmark';
import {
  CONTACT_EMAIL,
  DEMO_VIDEO_EMBED_URL,
  PITCH_VIDEO_EMBED_URL,
  REPO_URL,
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
  { id: 'prototype', label: 'Prototype' },
  { id: 'impact', label: 'Impact' },
  { id: 'process', label: 'Process' },
  { id: 'pitch', label: 'Pitch' },
  { id: 'team', label: 'Team' },
];

// Numbers on the site come from the engine with the default model, like the worked example.
const defaults = buildCatalogue(products, defaultModel, {});
const example = ['langsam-bookcase-80', 'stadig-bookcase-80', 'stadig-bookcase-80-sh'].map((id) => ({
  p: defaults.products.get(id)!,
  r: defaults.results.get(id)!,
}));
const [cheap, durable, secondhand] = example as [
  (typeof example)[number],
  (typeof example)[number],
  (typeof example)[number],
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
    <section id={id} className={grey ? `${styles.section} ${styles.grey}` : styles.section} aria-labelledby={`${id}-title`}>
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
          <Button to="/demo" variant="primary" className={styles.headerCta}>
            Try the prototype
          </Button>
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
              Cashback that grows with how sustainable a product is, not with how much you spend.{' '}
              <mark className={styles.mark}>Second-hand gives you the most back.</mark>
            </p>
            <div className={styles.heroActions}>
              <Button to="/demo" variant="emphasised" size="l">
                Try the prototype
              </Button>
              <Button href="#pitch" variant="secondary" size="l">
                Watch the pitch
              </Button>
            </div>
          </div>
        </section>

        {/* 2. Problem */}
        <Section id="problem" title="The problem">
          <div className={styles.twoCol}>
            <div className={styles.prose}>
              <p className={styles.quote}>
                “How can IKEA make sustainable choices the most affordable choice while continuing to
                grow and reducing total climate impact?”
              </p>
              <p className={styles.source}>IKEA Challenge 1: Make sustainable affordability the engine of growth</p>
              <p>
                Lower prices help IKEA grow, but more sales also means more production and more
                emissions. And for many families, the cheapest product and the most sustainable
                product are two different things.
              </p>
            </div>
            <div className={styles.prose}>
              <h3 className={styles.h3}>Meet Maria</h3>
              <p>
                Maria is a single mother of two. She lives on a tight budget and she cares about the
                environment, because she wants a good future for her children.
              </p>
              <p>
                Now she needs new furniture, so she goes to IKEA. But how can she find something that
                is good quality, doesn't take her whole budget, and is sustainable? Today, the
                cheapest option usually wins.
              </p>
              <InfoBox>
                <strong>What we found:</strong> the cheapest product is most often not the most
                sustainable one. On ikea.com you can't sort by how sustainable a product is, and
                second-hand options don't show up next to the new ones. IKEA Family already rewards
                second-hand, but the reward isn't linked to how sustainable a product is.
              </InfoBox>
            </div>
          </div>
        </Section>

        {/* 3. Solution */}
        <Section id="solution" title="Our solution" grey>
          <p className={styles.intro}>
            ReWard gives cashback as points when you buy. 1 point = 1 SEK on your next purchase. The
            percentage depends on the product's sustainability score, not on the amount you spend.
          </p>
          <ol className={styles.steps}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <h3 className={styles.h3}>Product data</h3>
              <p>
                Six things per product: climate (CO2e), water, energy, lifespan, transport and
                repairability. Climate, water and energy are counted per year of use, so products
                that last longer get credit for it.
              </p>
            </li>
            <li className={styles.stepArrow} aria-hidden="true">
              <ArrowRight size={24} strokeWidth={2} />
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <h3 className={styles.h3}>Sustainability score</h3>
              <p>
                We compare each product with similar ones (bookcases with bookcases) and combine the
                six factors into a score from 0 to 100. The score gives a tier from A to E.
              </p>
            </li>
            <li className={styles.stepArrow} aria-hidden="true">
              <ArrowRight size={24} strokeWidth={2} />
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <h3 className={styles.h3}>Cashback as points</h3>
              <p>
                Tier A gives {formatPct(defaultModel.tiers[0]!.pct)} back. Second-hand adds{' '}
                {formatPct(defaultModel.secondhandBonusPct)} on top. A cap based on each product's
                margin makes sure IKEA never loses money.
              </p>
            </li>
          </ol>

          <h3 className={`${styles.h3} ${styles.spaced}`}>Example: a bookcase for the kids' room</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col" className={styles.num}>Price</th>
                  <th scope="col">Tier</th>
                  <th scope="col" className={styles.num}>Cashback</th>
                  <th scope="col" className={styles.num}>Points</th>
                  <th scope="col" className={styles.num}>After cashback</th>
                </tr>
              </thead>
              <tbody>
                {example.map(({ p, r }) => (
                  <tr key={p.id}>
                    <th scope="row">
                      {p.name}
                      {p.condition === 'secondhand' ? ' (second-hand)' : ''}
                      <span className={styles.cellMeta}>{p.description}</span>
                    </th>
                    <td className={styles.num}>{formatSek(p.priceSek)}</td>
                    <td>
                      <TierBadge tier={r.tier} showLabel />
                    </td>
                    <td className={styles.num}>{formatPct(r.finalPct)}</td>
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
            The gap between the cheap and the durable bookcase shrinks from{' '}
            {formatSek(durable.p.priceSek - cheap.p.priceSek)} to{' '}
            {formatSek(durable.r.priceAfterCashback - cheap.r.priceAfterCashback)}, and second-hand
            becomes the cheapest by far at {formatSek(secondhand.r.priceAfterCashback)}.
          </p>
        </Section>

        {/* 4. Try the prototype */}
        <Section id="prototype" title="Try the prototype">
          <div className={styles.twoCol}>
            <div className={styles.prose}>
              <p>
                The prototype is a small IKEA-style shop with 24 simulated products. You are Maria,
                you have 150 points, and your task is to find a bookcase for the kids' room.
              </p>
              <p>
                Add products to your bag, use your points at checkout, and see what you earn. Then
                open the admin view, change the model, save, and watch the points in the shop change.
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
              <figcaption>
                {DEMO_VIDEO_EMBED_URL
                  ? 'Walkthrough of the prototype.'
                  : 'The product page. A walkthrough video is coming.'}
              </figcaption>
            </figure>
          </div>
        </Section>

        {/* 5. Features */}
        <Section id="features" title="Features" grey>
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
              <p>
                Every product shows its tier, the points you earn and the price after cashback,
                right next to the normal price. The product page explains the score in plain words
                and shows cheaper options in the same group, second-hand first.
              </p>
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
              <p>
                In the admin view, IKEA sets the weights, tiers, second-hand bonus and margin cap,
                previews the effect on every product and on cost, and runs campaigns with
                per-product overrides.
              </p>
            </article>
          </div>
        </Section>

        {/* 6. Sustainability impact */}
        <Section id="impact" title="Sustainability impact">
          <div className={styles.dimensions}>
            <article>
              <h3 className={styles.h3}>Individual</h3>
              <p>
                It gives people on a limited budget the freedom to choose the sustainable option.
                The score and the calculation are shown openly, so the choice stays with the
                customer.
              </p>
            </article>
            <article>
              <h3 className={styles.h3}>Social</h3>
              <p>
                Everyone can use it, and no group is left out. The incentive is strongest for
                households with tight budgets, who today have the least room to choose.
              </p>
            </article>
            <article>
              <h3 className={styles.h3}>Economic</h3>
              <p>
                Rewards bring customers back: loyalty members generate 12-18 % more revenue growth
                per year than non-members [3]. Points are spent at IKEA, so the value stays in IKEA.
                The risk is lower margin on some products, so every product has a margin cap.
              </p>
            </article>
            <article>
              <h3 className={styles.h3}>Technical</h3>
              <p>
                IKEA maintains it by updating the model in the admin view. It is built as an add-on
                to existing systems, like the IKEA Family points system, rather than a new app.
              </p>
            </article>
            <article>
              <h3 className={styles.h3}>Environmental</h3>
              <p>
                The system itself only needs a little server capacity and data storage. Its main
                effect is on behaviour: it steers purchases towards products with lower impact per
                year of use, and towards second-hand.
              </p>
            </article>
          </div>
          <InfoBox variant="bordered" className={styles.risk}>
            <h3 className={styles.h3}>The risk: more buying in general</h3>
            <p>
              Points are an incentive to buy, not only to buy sustainably. We handle this in three
              ways: the reward grows with sustainability, not with the amount spent; second-hand
              always gives the most back, because it needs no new production; and the margin cap
              stops IKEA from turning ReWard into a general discount.
            </p>
          </InfoBox>
        </Section>

        {/* 7. Real vs simulated */}
        <Section id="real" title="Real vs simulated" grey>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Part</th>
                  <th scope="col">In the prototype now</th>
                  <th scope="col">What a real version needs</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Calculation</th>
                  <td>Working and tested: score, tier, bonus, margin cap, points.</td>
                  <td>The same logic, run by IKEA's systems.</td>
                </tr>
                <tr>
                  <th scope="row">Products and prices</th>
                  <td>24 invented products with realistic Swedish prices.</td>
                  <td>The IKEA range and prices.</td>
                </tr>
                <tr>
                  <th scope="row">Sustainability data</th>
                  <td>Simulated values for CO2e, water, energy, lifespan, transport, repairability.</td>
                  <td>IKEA's life cycle assessment (LCA) data.</td>
                </tr>
                <tr>
                  <th scope="row">Scoring</th>
                  <td>Relative: each product is compared with its own group, so the weakest always scores low.</td>
                  <td>Absolute benchmarks per category, based on LCA data.</td>
                </tr>
                <tr>
                  <th scope="row">Margins</th>
                  <td>Simulated gross margins.</td>
                  <td>IKEA's real margin data.</td>
                </tr>
                <tr>
                  <th scope="row">Points</th>
                  <td>Stored in your browser. Reset any time.</td>
                  <td>Integration with IKEA Family.</td>
                </tr>
                <tr>
                  <th scope="row">Checkout</th>
                  <td>Simulated. Nothing is paid or delivered.</td>
                  <td>IKEA's checkout.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* 8. Process */}
        <Section id="process" title="Process">
          <div className={styles.twoCol}>
            <div className={styles.prose}>
              <h3 className={styles.h3}>Research</h3>
              <p>
                We used empathic modelling to understand our persona's problems and needs. Then we
                broke the problems down and looked at the current IKEA system to see which needs
                were not met: a gap analysis.
              </p>
              <h3 className={styles.h3}>User tests</h3>
              <p>
                We test the prototype with users once a week and write down what we change because
                of it. The log below is updated after each test.
              </p>
              <InfoBox variant="bordered">
                No user tests yet. Weekly tests start now that the prototype is live.
              </InfoBox>
            </div>
            <ol className={styles.timeline}>
              <li>
                <span>2026-09-10</span> Team charter signed
              </li>
              <li>
                <span>2026-09-15</span> Brainstorm: sustainable sorting, visible second-hand,
                points for sustainable choices
              </li>
              <li>
                <span>2026-09-16</span> Capstone questions: users, feasibility, viability,
                sustainability
              </li>
              <li>
                <span>2026-09-29</span> First pitch to IKEA
              </li>
              <li>
                <span>2026-10-08</span> First version of this website
              </li>
            </ol>
          </div>
        </Section>

        {/* 9. Next steps */}
        <Section id="next" title="Next steps" grey>
          <ol className={styles.nextSteps}>
            <li>
              <h3 className={styles.h3}>Real data</h3>
              <p>Connect real LCA data to the model instead of simulated values.</p>
            </li>
            <li>
              <h3 className={styles.h3}>Pilot in storage</h3>
              <p>
                Start in one category where IKEA sells a lot both in store and second-hand, and
                evaluate the results.
              </p>
            </li>
            <li>
              <h3 className={styles.h3}>Scale</h3>
              <p>Add more categories until the whole range is included.</p>
            </li>
            <li>
              <h3 className={styles.h3}>IKEA Family</h3>
              <p>Pay out the points through IKEA Family, so there is no new app to download.</p>
            </li>
          </ol>
        </Section>

        {/* 10. Pitch */}
        <Section id="pitch" title="Pitch">
          <div className={styles.twoCol}>
            <figure className={styles.figure}>
              {PITCH_VIDEO_EMBED_URL ? (
                <div className={styles.video}>
                  <iframe src={PITCH_VIDEO_EMBED_URL} title="Pitch video" loading="lazy" allow="fullscreen" />
                </div>
              ) : (
                <InfoBox variant="bordered" className={styles.placeholder}>
                  Pitch video coming after the final pitch.
                </InfoBox>
              )}
              <figcaption>Pitch video</figcaption>
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
                Slides from our first pitch.{' '}
                <a href={SLIDES_VIEW_URL} target="_blank" rel="noreferrer">
                  Open the slides in Canva
                </a>
              </figcaption>
            </figure>
          </div>
        </Section>

        {/* 11. Team */}
        <Section id="team" title="Team" grey>
          <p className={styles.intro}>Group 12, TEK830 Capstone, Chalmers University of Technology.</p>
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
        </Section>

        {/* 12. References */}
        <Section id="references" title="References">
          <ol className={styles.references}>
            <li>IKEA (2026). IKEA challenges: proposal for the TEK830 Capstone course.</li>
            <li>Chalmers University of Technology (2026). TEK830 Capstone project instructions.</li>
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
              IKEA Sweden, ikea.com/se/en. Layout, type and colour patterns measured on 2026-09-30
              for the look of the prototype. No IKEA logos, fonts or photos are used.
            </li>
          </ol>
        </Section>

        {/* 13. GenAI */}
        <Section id="genai" title="Use of generative AI" grey>
          <div className={styles.prose}>
            <p>
              We used <strong>Claude</strong> (Anthropic) in three ways. It helped a lot with the
              code: Claude Code wrote most of the prototype and this website from our own
              specification. It helped us brainstorm ideas. And it gave us text support, correcting
              and improving our writing.
            </p>
            <p>
              The idea, the calculation model and the decisions are ours. We reviewed all generated
              code and text before publishing, and the calculation logic is covered by automated
              tests.
            </p>
          </div>
        </Section>

        {/* 14. Contact */}
        <Section id="contact" title="Contact">
          <div className={styles.prose}>
            <p>
              Questions about ReWard? Email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
            <p>
              The code is on <a href={REPO_URL}>GitHub</a>. Or go straight to the{' '}
              <Link to="/demo">prototype</Link>.
            </p>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
