import { create } from 'zustand';
import { Cart, CartItem } from '@/types';
import { cartApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  resetCart: () => void;
  setCart: (cart: Cart) => void;
}

const initialCart: Cart = {
  _id: '',
  user: '',
  items: [],
  subtotal: 0,
  itemCount: 0,
};

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const { data } = await cartApi.get();
      set({ cart: data.cart, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },
setCart: (cart) => {
  set({ cart });
},
  addToCart: async (productId: string, quantity: number = 1) => {
    set({ isLoading: true });
    try {
      const { data } = await cartApi.add(productId, quantity);
      set({ cart: data.cart, isLoading: false });
      toast.success('Added to cart!');
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to add to cart');
      throw error;
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    set({ isLoading: true });
    try {
      const { data } = await cartApi.update(itemId, quantity);
      set({ cart: data.cart, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to update quantity');
      throw error;
    }
  },

  removeItem: async (itemId: string) => {
    set({ isLoading: true });
    try {
      const { data } = await cartApi.remove(itemId);
      set({ cart: data.cart, isLoading: false });
      toast.success('Item removed from cart');
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to remove item');
      throw error;
    }
  },

  clearCart: async () => {
    set({ isLoading: true });
    try {
      await cartApi.clear();
      set({ 
        cart: { ...initialCart },
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  resetCart: () => {
    set({ cart: null });
  },
}));