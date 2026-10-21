import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CartItem } from '@/types';
import { cartApi, getSessionToken } from '@/services/cartApi';

interface CartContextValue {
  items: CartItem[];
  loading: boolean;
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity: number }) => Promise<void>;
  updateQuantity: (skuId: string, quantity: number) => Promise<void>;
  removeItem: (skuId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSessionToken();
    cartApi.getCart().then((res) => {
      if (res.success && res.data) setItems(res.data);
      setLoading(false);
    });
  }, []);

  const addToCart = async (item: Omit<CartItem, 'quantity'> & { quantity: number }) => {
    const res = await cartApi.addToCart(item);
    if (res.success && res.data) setItems(res.data);
  };

  const updateQuantity = async (skuId: string, quantity: number) => {
    const res = await cartApi.updateQuantity(skuId, quantity);
    if (res.success && res.data) setItems(res.data);
  };

  const removeItem = async (skuId: string) => {
    const res = await cartApi.removeItem(skuId);
    if (res.success && res.data) setItems(res.data);
  };

  const clearCart = async () => {
    await cartApi.clearCart();
    setItems([]);
  };

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, addToCart, updateQuantity, removeItem, clearCart, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
