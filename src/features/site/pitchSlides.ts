import type { Slide } from '../../components/Carousel';

// Exported from the team's Canva deck "First Pitch_Team12". In the website copies, the IKEA logo
// on slide 4 is covered.
export const PITCH_SLIDES: Slide[] = [
  {
    alt: 'Group 12: Rewarding sustainable choices at IKEA. TEK830 Capstone, IKEA Challenge 1: Sustainable Affordability. Presented by Moa Pettersson (moapett@chalmers.se), Sofia Nguyen (thaop@chalmers.se), Isak Treptow (isaktr@chalmers.se), Sara Salam (sarasala@chalmers.se) and Max Fägersten (maxfa@chalmers.se).',
  },
  { alt: 'Maria, a mother, with her two children.' },
  {
    alt: 'A house, a fir tree and a bag of money with a falling arrow: home, nature and a tight budget.',
  },
  { alt: 'Three question marks.' },
  { alt: 'Solution: IKEA ReWard. Choose better, earn more, save money.' },
  {
    alt: 'How it works: 1. Choose a product. 2. Get a score. 3. Earn cashback. 4. Use it at IKEA.',
  },
  {
    alt: 'Is this profitable? 12-18 % more revenue per customer (Accenture, 2016). 85 % more likely to shop with brands (Bond Brand Loyalty, The Loyalty Report).',
  },
  { alt: "Let's get back to Maria." },
  {
    alt: 'What if the sustainable choice was also the one that paid off? With our solution, it is. Thank you! Group 12, TEK830.',
  },
  {
    alt: 'Q&A: How does IKEA ReWard work? 1. Customer chooses a product. 2. Sustainability data is checked. 3. Reward is calculated. 4. Points or cashback are added to IKEA Family.',
  },
  {
    alt: 'Q&A: What data does IKEA ReWard need? Sustainability data per product, product price and margin data, IKEA Family member data. Together, these make the reward calculation possible.',
  },
  {
    alt: 'Q&A: How would we test it? Pilot in one product category, evaluate the results, add more categories, scale.',
  },
  {
    alt: "Q&A: Aren't you just giving away margin? Not a general price cut: the reward is points, not money in the hand. The points are spent at IKEA, so the value flows back into the business. This type of strategy has worked for many other businesses.",
  },
  {
    alt: 'Q&A: How would you know if it works? Share of sustainable and second-hand products bought, how often members return, customer satisfaction. Start with a pilot in one product category before scaling.',
  },
].map((slide, i) => ({
  src: `/images/pitch/slide-${String(i + 1).padStart(2, '0')}.jpg`,
  alt: `Slide ${i + 1}. ${slide.alt}`,
}));
