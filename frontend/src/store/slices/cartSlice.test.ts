import { describe, it, expect } from 'vitest';
import cartReducer, {
  toggleCart,
  openCart,
  closeCart,
  clearCartLocal,
  setCartData,
  type CartState,
} from './cartSlice';
import type { CartModel } from '../../types';

describe('cartSlice Reducer', () => {
  const initialState: CartState = {
    cart: null,
    isOpen: false,
    isLoading: false,
    error: null,
  };

  it('should return the initial state on unknown action', () => {
    expect(cartReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should toggle isOpen state', () => {
    const next = cartReducer(initialState, toggleCart());
    expect(next.isOpen).toBe(true);

    const closed = cartReducer(next, toggleCart());
    expect(closed.isOpen).toBe(false);
  });

  it('should open and close cart explicitly', () => {
    let state = cartReducer(initialState, openCart());
    expect(state.isOpen).toBe(true);

    state = cartReducer(state, closeCart());
    expect(state.isOpen).toBe(false);
  });

  it('should set cart data from server payload', () => {
    const mockCart: CartModel = {
      id: 'cart-1',
      sessionId: 'sess-1',
      userId: null,
      status: 'ACTIVE',
      items: [],
      subtotal: 89.99,
      customizationTotal: 20.0,
      estimatedTax: 0,
      shipping: 0,
      grandTotal: 109.99,
      itemCount: 1,
    };

    const next = cartReducer(initialState, setCartData(mockCart));
    expect(next.cart).toEqual(mockCart);
    expect(next.cart?.grandTotal).toBe(109.99);
  });

  it('should clear cart on clearCartLocal', () => {
    const stateWithCart: CartState = {
      ...initialState,
      cart: {
        id: 'cart-1',
        status: 'ACTIVE',
        items: [],
        subtotal: 50,
        customizationTotal: 0,
        estimatedTax: 0,
        shipping: 0,
        grandTotal: 50,
        itemCount: 1,
      },
    };

    const next = cartReducer(stateWithCart, clearCartLocal());
    expect(next.cart).toBeNull();
  });
});
