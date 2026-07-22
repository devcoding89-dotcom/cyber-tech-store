import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://luxoncvjroafxvsylhjh.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG9uY3Zqcm9hZnh2c3lsaGpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwOTQxODIsImV4cCI6MjA5MTY3MDE4Mn0.6RcO8OJnsSwDxvIkEhfpZ-72rh7Du7kVheq0he3PQ8c';
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG9uY3Zqcm9hZnh2c3lsaGpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA5NDE4MiwiZXhwIjoyMDkxNjcwMTgyfQ.6O9qOhu97rLs6Bc4DPI4pC00mTYv_p-CZFkzKNlIRms';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

async function listProducts() {
  console.log('--- Querying with ANON client ---');
  const { data: anonData, error: anonErr } = await supabase.from('products').select('*');
  console.log('Anon count:', anonData?.length, 'Error:', anonErr);
  if (anonData && anonData.length > 0) {
    console.log('Sample anon product:', anonData[0]);
  }

  console.log('--- Querying with ADMIN client ---');
  const { data: adminData, error: adminErr } = await adminSupabase.from('products').select('*');
  console.log('Admin count:', adminData?.length, 'Error:', adminErr);
  if (adminData && adminData.length > 0) {
    console.log('Sample admin product:', adminData[0]);
  }
}

listProducts();
