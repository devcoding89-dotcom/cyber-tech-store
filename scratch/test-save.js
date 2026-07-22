import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY;

console.log('URL:', SUPABASE_URL);
console.log('ANON_KEY:', SUPABASE_ANON_KEY?.slice(0, 10));
console.log('SERVICE_KEY:', SUPABASE_SERVICE_KEY?.slice(0, 10));

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

async function test() {
  console.log('\n--- Testing ANON client insert ---');
  const product1 = {
    name: 'Anon Test Product ' + Date.now(),
    description: 'Testing anon client insert',
    price: 150.00,
    original_price: null,
    category: 'phones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    stock: 5,
    rating: 4.5,
    reviews: 10,
    features: ['Fast', 'Durable'],
    badge: 'New',
    is_new: true,
    is_bestseller: false
  };

  const res1 = await supabase.from('products').insert([product1]).select().single();
  console.log('Anon insert res:', res1);

  console.log('\n--- Testing ADMIN client insert ---');
  const product2 = {
    name: 'Admin Test Product ' + Date.now(),
    description: 'Testing admin client insert',
    price: 250.00,
    original_price: null,
    category: 'chargers',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    stock: 20,
    rating: 4.8,
    reviews: 2,
    features: ['Fast Charge'],
    badge: null,
    is_new: false,
    is_bestseller: true
  };

  const res2 = await adminSupabase.from('products').insert([product2]).select().single();
  console.log('Admin insert res:', res2);
}

test();
