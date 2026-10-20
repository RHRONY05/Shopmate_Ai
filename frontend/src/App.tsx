import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { useAppDispatch } from './store/hooks';
import { loadCartThunk } from './store/slices/cartSlice';

import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MiniCartDrawer } from './components/drawers/MiniCartDrawer';
import { CopilotDrawer } from './components/drawers/CopilotDrawer';

import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { JerseyDetailPage } from './pages/JerseyDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { AccountPage } from './pages/AccountPage';
import { ThemeStudioPage } from './features/theme-studio/ThemeStudioPage';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

const MainLayout: React.FC = () => {
  const dispatch = useAppDispatch();

  // Load existing active cart from backend on initial mount
  useEffect(() => {
    dispatch(loadCartThunk());
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jerseys" element={<CatalogPage />} />
          <Route path="/jerseys/:slug" element={<JerseyDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders/:orderId/success" element={<OrderSuccessPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route
            path="/theme-studio"
            element={<ThemeStudioPage onBackToApp={() => (window.location.href = '/')} />}
          />
        </Routes>
      </div>
      <Footer />

      {/* Persistent Matchday Overlays */}
      <MiniCartDrawer />
      <CopilotDrawer />
    </div>
  );
};

export const App: React.FC = () => {
  if (clerkPubKey) {
    return (
      <ClerkProvider publishableKey={clerkPubKey}>
        <BrowserRouter>
          <MainLayout />
        </BrowserRouter>
      </ClerkProvider>
    );
  }

  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
};

export default App;
