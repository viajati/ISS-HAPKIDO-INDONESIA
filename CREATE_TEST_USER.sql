-- This script creates a test user in Supabase Auth and the profiles table
-- Run this in the Supabase SQL Editor

-- The user will be created with:
-- Email: demo@hapkido.id
-- Password: Demo@12345

-- First, insert into auth.users (this requires direct SQL in Supabase)
-- Then insert into profiles table

-- Insert test profile
INSERT INTO profiles (
  id,
  username,
  email,
  full_name,
  role,
  wilayah,
  dojang,
  phone,
  status,
  created_at,
  updated_at
) VALUES (
  'test-user-id-12345678901234567890',
  'testuser',
  'demo@hapkido.id',
  'Test User Demo',
  'pelatih',
  'DKI Jakarta',
  'Dojang Test',
  '081234567890',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  updated_at = NOW();

-- Instructions:
-- 1. Go to https://app.supabase.com
-- 2. Select your project
-- 3. Go to Authentication > Users
-- 4. Click "Create user manually"
-- 5. Enter:
--    - Email: demo@hapkido.id
--    - Password: Demo@12345
-- 6. Run the INSERT query above in SQL Editor to create the profile
