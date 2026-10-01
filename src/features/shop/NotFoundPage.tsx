import { Button } from '../../components/Button';
import { usePageTitle } from '../../usePageTitle';
import shop from './Shop.module.css';

export function NotFoundPage() {
  usePageTitle("We can't find that page");
  return (
    <div className="page">
      <div className={shop.section}>
        <h1 className={shop.title}>We can't find that page</h1>
        <p className={shop.lead}>
          The page may have moved, or the link may be wrong. Let's get you back to the shop.
        </p>
        <div className={shop.resetRow}>
          <Button to="/demo" variant="primary">
            Go to the prototype
          </Button>
          <Button to="/" variant="secondary">
            Project website
          </Button>
        </div>
      </div>
    </div>
  );
}
