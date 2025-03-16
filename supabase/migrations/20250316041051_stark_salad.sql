/*
  # Initial Schema Setup for Coupon Distribution System

  1. New Tables
    - `coupons`
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `description` (text)
      - `is_active` (boolean)
      - `is_claimed` (boolean)
      - `created_at` (timestamp)
    - `claims`
      - `id` (uuid, primary key)
      - `coupon_id` (uuid, foreign key)
      - `ip_address` (text)
      - `browser_id` (text)
      - `claimed_at` (timestamp)
    - `cooldowns`
      - `id` (uuid, primary key)
      - `ip_address` (text)
      - `browser_id` (text)
      - `last_claim` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated admin access
    - Add policies for public claim access
*/

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  is_claimed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create claims table
CREATE TABLE IF NOT EXISTS claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid REFERENCES coupons(id),
  ip_address text NOT NULL,
  browser_id text NOT NULL,
  claimed_at timestamptz DEFAULT now()
);

-- Create cooldowns table
CREATE TABLE IF NOT EXISTS cooldowns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  browser_id text NOT NULL,
  last_claim timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooldowns ENABLE ROW LEVEL SECURITY;

-- Policies for coupons
CREATE POLICY "Allow public read active coupons" ON coupons
  FOR SELECT
  TO public
  USING (is_active = true AND is_claimed = false);

CREATE POLICY "Allow admin full access to coupons" ON coupons
  FOR ALL
  TO authenticated
  USING (true);

-- Policies for claims
CREATE POLICY "Allow public create claims" ON claims
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow admin read claims" ON claims
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for cooldowns
CREATE POLICY "Allow public manage cooldowns" ON cooldowns
  FOR ALL
  TO public
  USING (true);