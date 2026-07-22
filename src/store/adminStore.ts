import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, Order } from '@/types/database';

interface AdminState {
  isAuthenticated: boolean;
  adminEmail: string | null;
  products: Product[];
  orders: Order[];
  isLoading: boolean;
  
  // Actions
  login: (email: string) => void;
  logout: () => void;
  setProducts: (products: Product[]) => void;
  setOrders: (orders: Order[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      adminEmail: null,
      products: [], // Don't persist products
      orders: [],   // Don't persist orders
      isLoading: false,
      
      login: (email: string) => {
        set({ isAuthenticated: true, adminEmail: email });
      },
      
      logout: () => {
        set({ isAuthenticated: false, adminEmail: null, products: [], orders: [] });
      },
      
      setProducts: (products: Product[]) => {
        set({ products });
      },
      
      setOrders: (orders: Order[]) => {
        set({ orders });
      },
      
      addProduct: (product: Product) => {
        set((state) => ({
          products: [product, ...state.products]
        }));
      },
      
      updateProduct: (id: string, updates: Partial<Product>) => {
        set((state) => ({
          products: state.products.map(p => 
            p.id === id ? { ...p, ...updates } : p
          )
        }));
      },
      
      removeProduct: (id: string) => {
        set((state) => ({
          products: state.products.filter(p => p.id !== id)
        }));
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      }
    }),
    {
      name: 'khalex-admin',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated, 
        adminEmail: state.adminEmail 
      })
    }
  )
);
