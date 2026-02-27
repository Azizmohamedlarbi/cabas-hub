'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import type { Product } from '@/types';

export interface CartItem {
    product: Product;
    quantity: number;
    priceType: 'wholesale' | 'retail';
}

interface CartState {
    items: CartItem[];
    addItem: (product: Product, quantity: number, priceType: 'wholesale' | 'retail') => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clear: () => void;
    totalItems: () => number;
    totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product, quantity, priceType) => {
                set((state) => {
                    const existing = state.items.find(i => i.product.id === product.id);
                    if (existing) {
                        toast.success(`Quantité mise à jour : ${product.title}`);
                        return {
                            items: state.items.map(i =>
                                i.product.id === product.id
                                    ? { ...i, quantity: i.quantity + quantity }
                                    : i
                            ),
                        };
                    }
                    toast.success(`Ajouté au panier : ${product.title}`);
                    return { items: [...state.items, { product, quantity, priceType }] };
                });
            },

            removeItem: (productId) => {
                set((state) => ({ items: state.items.filter(i => i.product.id !== productId) }));
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }
                set((state) => ({
                    items: state.items.map(i =>
                        i.product.id === productId ? { ...i, quantity } : i
                    ),
                }));
            },

            clear: () => set({ items: [] }),

            totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

            totalPrice: () => get().items.reduce((sum, i) => {
                const price = i.priceType === 'wholesale' ? (i.product.price_wholesale || i.product.price_retail) : i.product.price_retail;
                return sum + price * i.quantity;
            }, 0),
        }),
        { name: 'cabas-cart' }
    )
);
