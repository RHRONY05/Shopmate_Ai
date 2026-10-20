import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../../store/slices/cartSlice';
import copilotReducer from '../../store/slices/copilotSlice';
import { MiniCartDrawer } from './MiniCartDrawer';
import type { CartModel } from '../../types';

describe('MiniCartDrawer Component', () => {
  it('renders nothing when isOpen is false', () => {
    const store = configureStore({
      reducer: { cart: cartReducer, copilot: copilotReducer },
      preloadedState: {
        cart: { cart: null, isOpen: false, isLoading: false, error: null },
      },
    });

    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <MiniCartDrawer />
        </BrowserRouter>
      </Provider>
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders empty bag state when open with no items', () => {
    const store = configureStore({
      reducer: { cart: cartReducer, copilot: copilotReducer },
      preloadedState: {
        cart: { cart: null, isOpen: true, isLoading: false, error: null },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <MiniCartDrawer />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/Your matchday bag is empty/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse Kit Catalog/i)).toBeInTheDocument();
  });

  it('renders itemized kits, squad customizations, and subtotal when cart has items', () => {
    const mockCart: CartModel = {
      id: 'cart-1',
      sessionId: 'sess-1',
      userId: null,
      status: 'ACTIVE',
      subtotal: 89.99,
      customizationTotal: 20.0,
      estimatedTax: 0,
      shipping: 0,
      grandTotal: 109.99,
      itemCount: 1,
      items: [
        {
          id: 'item-1',
          cartId: 'cart-1',
          jerseyVariantId: 'var-1',
          quantity: 1,
          customName: 'SAKA',
          customNumber: 7,
          sleeveBadge: 'Premier League Patch',
          unitPrice: 109.99,
          totalPrice: 109.99,
          jerseyVariant: {
            id: 'var-1',
            size: 'L',
            stockQuantity: 10,
            jersey: {
              id: 'j-1',
              title: 'Arsenal 2019/20 Home Kit',
              slug: 'arsenal-2019-20-home',
              kitType: 'HOME',
              season: '2019/20',
              basePrice: 89.99,
              images: ['https://images.unsplash.com/photo-1577223625816-7546f13df25d'],
              club: {
                name: 'Arsenal FC',
                logoUrl: null,
              },
            },
          },
        },
      ],
    };

    const store = configureStore({
      reducer: { cart: cartReducer, copilot: copilotReducer },
      preloadedState: {
        cart: { cart: mockCart, isOpen: true, isLoading: false, error: null },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <MiniCartDrawer />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/Arsenal 2019\/20 Home Kit/i)).toBeInTheDocument();
    expect(screen.getByText(/Size: L/i)).toBeInTheDocument();
    expect(screen.getByText(/#7 SAKA \(\+15 USD\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Premier League Patch \(\+5 USD\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Proceed to Matchday Checkout/i)).toBeInTheDocument();
  });
});
