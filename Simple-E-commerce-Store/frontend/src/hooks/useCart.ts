import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export function useCart() {
  const { isAuthenticated } = useAuthStore();
  const cartStore = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      cartStore.fetchCart();
    }
  }, [isAuthenticated]);

  return {
    ...cartStore,
    isEmpty: !cartStore.cart || cartStore.cart.items.length === 0,
    itemCount: cartStore.cart?.itemCount || 0,
    subtotal: cartStore.cart?.subtotal || 0,
  };
}