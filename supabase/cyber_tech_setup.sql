-- ====================================================================
-- CYBER TECH STORE - Complete Supabase Database Setup
-- Run this entire script in: Supabase Dashboard > SQL Editor > New Query
-- ====================================================================

-- ============================================================
-- 1. DROP OLD TABLES (clean slate)
-- ============================================================
DROP TABLE IF EXISTS tracking_updates CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;


-- ============================================================
-- 2. CREATE PRODUCTS TABLE
-- ============================================================
CREATE TABLE products (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT NOT NULL,
  description     TEXT NOT NULL,
  price           DECIMAL(10,2) NOT NULL,
  original_price  DECIMAL(10,2),
  category        TEXT NOT NULL CHECK (category IN ('phones', 'chargers', 'powerbanks', 'accessories')),
  image           TEXT NOT NULL,
  stock           INTEGER NOT NULL DEFAULT 0,
  rating          DECIMAL(2,1) DEFAULT 4.5,
  reviews         INTEGER DEFAULT 0,
  features        TEXT[] DEFAULT '{}',
  badge           TEXT,
  is_new          BOOLEAN DEFAULT false,
  is_bestseller   BOOLEAN DEFAULT false,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- 3. CREATE ORDERS TABLE
-- ============================================================
CREATE TABLE orders (
  id                        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id                  TEXT UNIQUE NOT NULL,
  tracking_id               TEXT UNIQUE NOT NULL,
  customer_name             TEXT NOT NULL,
  customer_email            TEXT NOT NULL,
  customer_phone            TEXT,
  whatsapp_number           TEXT NOT NULL,
  items                     JSONB NOT NULL,
  total_amount              DECIMAL(10,2) NOT NULL,
  status                    TEXT DEFAULT 'pending'
                              CHECK (status IN ('pending','paid','processing','shipped','delivered','cancelled')),
  payment_status            TEXT DEFAULT 'pending'
                              CHECK (payment_status IN ('pending','paid','failed')),
  stripe_payment_intent_id  TEXT,
  notes                     TEXT,
  created_at                TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- 4. CREATE TRACKING UPDATES TABLE
-- ============================================================
CREATE TABLE tracking_updates (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id    TEXT NOT NULL,
  status      TEXT NOT NULL,
  description TEXT NOT NULL,
  location    TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_tracking_order
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);


-- ============================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_updates ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 6. RLS POLICIES  (public read + full write for now)
-- ============================================================

-- Products
CREATE POLICY "Public can read products"
  ON products FOR SELECT USING (true);

CREATE POLICY "Allow all operations on products"
  ON products FOR ALL USING (true) WITH CHECK (true);

-- Orders
CREATE POLICY "Public can read orders"
  ON orders FOR SELECT USING (true);

CREATE POLICY "Allow all operations on orders"
  ON orders FOR ALL USING (true) WITH CHECK (true);

-- Tracking updates
CREATE POLICY "Public can read tracking"
  ON tracking_updates FOR SELECT USING (true);

CREATE POLICY "Allow all operations on tracking"
  ON tracking_updates FOR ALL USING (true) WITH CHECK (true);


-- ============================================================
-- 7. STORAGE BUCKET SETUP (For Product Images)
-- ============================================================

-- Create the product-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies to avoid duplicate errors
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;

-- Allow public read of images
CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow public upload (since front-end admin page inserts anonymously)
CREATE POLICY "Allow public upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- Allow public delete
CREATE POLICY "Allow public delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');


-- ============================================================
-- 8. VERIFY - check tables exist
-- ============================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('products', 'orders', 'tracking_updates');

-- You should see 3 rows above if setup was successful.
-- Products are empty by default - add them via the /admin panel.

