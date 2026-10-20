import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { CartModel } from '../../types';
import {
  fetchCart,
  addToCartApi,
  updateCartItemQuantityApi,
  removeCartItemApi,
  type AddToCartPayload,
} from '../../services/api';

export interface CartState {
  cart: CartModel | null;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  isOpen: false,
  isLoading: false,
  error: null,
};

// Async Thunks
export const loadCartThunk = createAsyncThunk<CartModel, string | undefined>(
  'cart/loadCart',
  async (token, { rejectWithValue }) => {
    try {
      return await fetchCart(token);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load cart');
    }
  }
);

export const addToCartThunk = createAsyncThunk<
  CartModel,
  { payload: AddToCartPayload; token?: string | null }
>('cart/addToCart', async ({ payload, token }, { rejectWithValue }) => {
  try {
    return await addToCartApi(payload, token);
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : 'Failed to add item');
  }
});

export const updateCartItemThunk = createAsyncThunk<
  CartModel,
  { itemId: string; quantity: number; token?: string | null }
>('cart/updateCartItem', async ({ itemId, quantity, token }, { rejectWithValue }) => {
  try {
    return await updateCartItemQuantityApi(itemId, quantity, token);
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : 'Failed to update item quantity');
  }
});

export const removeCartItemThunk = createAsyncThunk<
  CartModel,
  { itemId: string; token?: string | null }
>('cart/removeCartItem', async ({ itemId, token }, { rejectWithValue }) => {
  try {
    return await removeCartItemApi(itemId, token);
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : 'Failed to remove item');
  }
});

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
    clearCartLocal: (state) => {
      state.cart = null;
    },
    setCartData: (state, action: PayloadAction<CartModel>) => {
      state.cart = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Load Cart
    builder
      .addCase(loadCartThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadCartThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
      })
      .addCase(loadCartThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Could not load cart';
      });

    // Add To Cart
    builder
      .addCase(addToCartThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCartThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
        state.isOpen = true; // Auto-open slide drawer for tactile matchday feedback
      })
      .addCase(addToCartThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Could not add to bag';
      });

    // Update Quantity
    builder
      .addCase(updateCartItemThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartItemThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
      })
      .addCase(updateCartItemThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Could not update item';
      });

    // Remove Item
    builder
      .addCase(removeCartItemThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeCartItemThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
      })
      .addCase(removeCartItemThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Could not remove item';
      });
  },
});

export const { toggleCart, openCart, closeCart, clearCartLocal, setCartData } = cartSlice.actions;
export default cartSlice.reducer;
