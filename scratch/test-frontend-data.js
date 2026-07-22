import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY;

const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

async function testEdgeCases() {
  console.log('\n--- Case 1: original_price and badge are undefined ---');
  const productData1 = {
    name: 'Test Undefined Fields ' + Date.now(),
    description: 'Testing undefined fields',
    price: 100,
    original_price: undefined,
    category: 'phones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    stock: 10,
    rating: 4.5,
    reviews: 0,
    features: ['Feat 1'],
    badge: undefined,
    is_new: false,
    is_bestseller: false,
  };

  const res1 = await adminSupabase.from('products').insert([productData1]).select().single();
  console.log('Case 1 res error:', res1.error);

  console.log('\n--- Case 2: large base64 image string as image column ---');
  // Create a 1MB base64 string
  const base64Data = 'data:image/jpeg;base64,' + 'A'.repeat(1024 * 1024);
  const productData2 = {
    name: 'Test Base64 Image ' + Date.now(),
    description: 'Testing base64 image field',
    price: 100,
    category: 'phones',
    image: base64Data,
    stock: 10,
    rating: 4.5,
    reviews: 0,
    features: [],
    is_new: false,
    is_bestseller: false,
  };

  const res2 = await adminSupabase.from('products').insert([productData2]).select().single();
  console.log('Case 2 res error:', res2.error);

  console.log('\n--- Case 3: Storage bucket upload test ---');
  try {
    const bucketRes = await adminSupabase.storage.getBucket('product-images');
    console.log('Bucket get info:', bucketRes);
  } catch (e) {
    console.log('Bucket get error:', e);
  }
}

testEdgeCases();
