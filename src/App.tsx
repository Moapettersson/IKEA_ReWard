import { Route, Routes } from 'react-router-dom';
import { DemoLayout, ScrollManager } from './components/DemoLayout';
import { AdminPage } from './features/admin/AdminPage';
import { BagPage } from './features/bag/BagPage';
import { CheckoutPage } from './features/bag/CheckoutPage';
import { ConfirmationPage } from './features/bag/ConfirmationPage';
import { RewardsPage } from './features/rewards/RewardsPage';
import { CategoryPage } from './features/shop/CategoryPage';
import { DemoHome } from './features/shop/DemoHome';
import { NotFoundPage } from './features/shop/NotFoundPage';
import { ProductPage } from './features/shop/ProductPage';
import { SearchPage } from './features/shop/SearchPage';
import { StyleguidePage } from './features/shop/StyleguidePage';
import { SitePage } from './features/site/SitePage';

export function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<SitePage />} />
        <Route path="/demo" element={<DemoLayout />}>
          <Route index element={<DemoHome />} />
          <Route path="category/:slug" element={<CategoryPage />} />
          <Route path="product/:id" element={<ProductPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="bag" element={<BagPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order/:id" element={<ConfirmationPage />} />
          <Route path="rewards" element={<RewardsPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="styleguide" element={<StyleguidePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="*" element={<DemoLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
