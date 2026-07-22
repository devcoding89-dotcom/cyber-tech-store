import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

async function checkStorage() {
  console.log('--- Checking Storage Buckets ---');
  const { data: buckets, error: bucketsErr } = await adminSupabase.storage.listBuckets();
  console.log('Buckets list:', buckets, 'Error:', bucketsErr);

  console.log('--- Attempting test file upload to product-images ---');
  const fileContent = Buffer.from('test image content');
  const { data: uploadData, error: uploadErr } = await adminSupabase.storage
    .from('product-images')
    .upload('test-' + Date.now() + '.txt', fileContent, {
      contentType: 'text/plain',
      upsert: true
    });
  
  console.log('Upload result:', uploadData, 'Upload error:', uploadErr);
}

checkStorage();
