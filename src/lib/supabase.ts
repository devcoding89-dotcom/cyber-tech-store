import { createClient } from '@supabase/supabase-js';
import type { Product, Order, TrackingUpdate } from '@/types/database';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

if (typeof window !== 'undefined') {
  console.log('🔧 Supabase Configuration:');
  console.log('✅ Configured:', isSupabaseConfigured);
  console.log('📍 URL:', SUPABASE_URL || 'missing');
  console.log('🔑 Key length:', SUPABASE_ANON_KEY?.length || 0, 'chars');
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase is not configured. This app requires Supabase.');
  }
}

// Admin credentials (in production, use proper auth)
const ADMIN_EMAIL = 'khaleed';
const ADMIN_PASSWORD = 'Khaleed@890';

// ==================== PRODUCTS ====================

export async function getAllProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured || !supabase) {
    console.error('❌ Supabase is not configured. getAllProducts failed.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching products from Supabase:', error);
      return [];
    }

    console.log(`✅ Fetched ${data?.length || 0} products from Supabase`);
    return data || [];
  } catch (err) {
    console.error('❌ Exception fetching products:', err);
    return [];
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  if (!isSupabaseConfigured || !supabase) {
    console.error('❌ Supabase is not configured. getProductsByCategory failed.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching products by category:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('❌ Exception fetching products by category:', err);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured || !supabase) {
    console.error('❌ Supabase is not configured. getProductById failed.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error fetching product:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('❌ Exception fetching product:', err);
    return null;
  }
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product | null> {
  if (!isSupabaseConfigured || !supabase) {
    console.error('❌ Supabase is not configured. createProduct failed.');
    return null;
  }

  try {
    console.log('📦 Preparing to insert product:', product.name);
    console.log('🔍 Data types:', {
      name: typeof product.name,
      price: typeof product.price,
      stock: typeof product.stock,
      features: Array.isArray(product.features) ? 'array' : typeof product.features,
      imageLength: product.image.length,
    });

    // Don't include id - let Supabase generate it
    // Don't include created_at - let Supabase generate it with DEFAULT NOW()
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating product in Supabase');
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error details:', error);
      console.error('Product data sent:', {
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        imageSize: `${(product.image.length / 1024 / 1024).toFixed(2)} MB`,
      });
      return null;
    }

    console.log('✅ Product created successfully in Supabase:', data?.id);
    return data;
  } catch (err) {
    console.error('❌ Exception creating product in Supabase:', err);
    if (err instanceof Error) {
      console.error('Exception message:', err.message);
      console.error('Exception stack:', err.stack);
    }
    return null;
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  if (!isSupabaseConfigured || !supabase) {
    console.error('❌ Supabase is not configured. updateProduct failed.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating product in Supabase:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('❌ Exception updating product:', err);
    return null;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    console.error('❌ Supabase is not configured. deleteProduct failed.');
    return false;
  }

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting product in Supabase:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('❌ Exception deleting product:', err);
    return false;
  }
}

// ==================== ORDERS ====================

export async function createOrder(order: Omit<Order, 'id' | 'created_at'>): Promise<Order | null> {
  if (!isSupabaseConfigured || !supabase) {
    console.error('❌ Supabase is not configured. createOrder failed.');
    return null;
  }

  const newOrder: Order = {
    ...order,
    id: 'order-' + Date.now().toString(36),
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([newOrder])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating order in Supabase:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('❌ Exception creating order in Supabase:', err);
    return null;
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  if (!isSupabaseConfigured || !supabase) {
    console.error('❌ Supabase is not configured. getOrderById failed.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) {
      console.error('❌ Error fetching order from Supabase:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('❌ Exception fetching order from Supabase:', err);
    return null;
  }
}

export async function getAllOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured || !supabase) {
    console.error('❌ Supabase is not configured. getAllOrders failed.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching orders from Supabase:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('❌ Exception fetching orders from Supabase:', err);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    console.error('❌ Supabase is not configured. updateOrderStatus failed.');
    return false;
  }

  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('order_id', orderId);

    if (error) {
      console.error('❌ Error updating order status in Supabase:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('❌ Exception updating order status in Supabase:', err);
    return false;
  }
}

// ==================== TRACKING ====================

export async function addTrackingUpdate(update: Omit<TrackingUpdate, 'id' | 'created_at'>): Promise<TrackingUpdate | null> {
  if (!isSupabaseConfigured || !supabase) {
    console.error('❌ Supabase is not configured. addTrackingUpdate failed.');
    return null;
  }

  const newUpdate: TrackingUpdate = {
    ...update,
    id: 'track-' + Date.now().toString(36),
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('tracking_updates')
      .insert([newUpdate])
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding tracking update in Supabase:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('❌ Exception adding tracking update in Supabase:', err);
    return null;
  }
}

export async function getTrackingUpdates(orderId: string): Promise<TrackingUpdate[]> {
  if (!isSupabaseConfigured || !supabase) {
    console.error('❌ Supabase is not configured. getTrackingUpdates failed.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('tracking_updates')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching tracking updates from Supabase:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('❌ Exception fetching tracking updates from Supabase:', err);
    return [];
  }
}

// ==================== ADMIN AUTH ====================

export async function adminLogin(email: string, password: string): Promise<boolean> {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

// ==================== UTILITY ====================

export function generateOrderId(): string {
  return 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
}

export function generateTrackingId(): string {
  return 'TRK-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

// ==================== FEATURED PRODUCTS ====================

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter(product => product.is_bestseller || product.is_new).slice(0, 6);
}

// ==================== DIAGNOSTICS ====================

export async function testSupabaseConnection(): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    console.error('❌ Supabase is not configured');
    return false;
  }

  try {
    console.log('🧪 Testing Supabase connection...');
    const { data, error } = await supabase
      .from('products')
      .select('count', { count: 'exact' });

    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }

    console.log('✅ Supabase connection successful!');
    console.log('📊 Products in database:', data?.length || 0);
    return true;
  } catch (err) {
    console.error('❌ Exception testing Supabase:', err);
    return false;
  }
}

if (typeof window !== 'undefined') {
  (window as any).testSupabase = testSupabaseConnection;
}
