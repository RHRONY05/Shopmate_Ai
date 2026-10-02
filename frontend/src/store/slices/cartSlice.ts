import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface CartItem {
  id: string
  jerseyId: string
  title: string
  clubName: string
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL'
  price: number
  quantity: number
  customization?: {
    playerName?: string
    playerNumber?: number
    leagueBadge?: boolean
  }
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
}

const initialState: CartState = {
  items: [],
  isOpen: false,
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(
        (item) => item.id === action.payload.id && item.size === action.payload.size
      )
      if (existing) {
        existing.quantity += action.payload.quantity
      } else {
        state.items.push(action.payload)
      }
    },
    removeItem: (state, action: PayloadAction<{ id: string; size: string }>) => {
      state.items = state.items.filter(
        (item) => !(item.id === action.payload.id && item.size === action.payload.size)
      )
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen
    },
    clearCart: (state) => {
      state.items = []
    },
  },
})

export const { addItem, removeItem, toggleCart, clearCart } = cartSlice.actions
export default cartSlice.reducer
