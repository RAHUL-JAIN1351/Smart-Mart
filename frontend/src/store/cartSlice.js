import { createSlice } from '@reduxjs/toolkit';

const saved = localStorage.getItem('cart');
const initialItems = saved ? JSON.parse(saved) : [];

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: initialItems },
  reducers: {
    addToCart: (state, action) => {
      const { product, qty = 1 } = action.payload;
      const existing = state.items.find(i => i._id === product._id);
      if (existing) {
        existing.qty = Math.min(existing.qty + qty, product.stock);
      } else {
        state.items.push({ ...product, qty });
      }
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(i => i._id !== action.payload);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    updateQty: (state, action) => {
      const { id, qty } = action.payload;
      const item = state.items.find(i => i._id === id);
      if (item) item.qty = qty;
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cart');
    }
  }
});

export const { addToCart, removeFromCart, updateQty, clearCart } = cartSlice.actions;
export const selectCartTotal = (state) => state.cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
export const selectCartCount = (state) => state.cart.items.reduce((sum, i) => sum + i.qty, 0);
export default cartSlice.reducer;
