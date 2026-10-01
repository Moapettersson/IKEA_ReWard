import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { DemoHeader } from './DemoHeader';
import { Footer } from './Footer';

// Scroll to the top on navigation, or to the #hash target when there is one.
export function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export function DemoLayout() {
  const { pathname } = useLocation();
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <DemoHeader showCategories={!pathname.startsWith('/demo/admin')} />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
