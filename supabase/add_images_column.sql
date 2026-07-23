-- Run this in Supabase SQL Editor to add the images column to your products table without losing data
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
