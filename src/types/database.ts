export type Category = 'phones' | 'chargers' | 'powerbanks' | 'accessories';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: Category;
  image: string;
  stock: number;
  rating: number;
  reviews: number;
  features: string[];
  badge?: string;
  is_new?: boolean;
  is_bestseller?: boolean;
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id?: string;
  order_id: string;
  tracking_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
  payment_status: 'pending' | 'paid' | 'failed';
  stripe_payment_intent_id?: string;
  whatsapp_number: string;
  notes?: string;
  created_at?: string;
}

export interface TrackingUpdate {
  id?: string;
  order_id: string;
  status: string;
  description: string;
  location?: string;
  created_at?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
  created_at?: string;
}
