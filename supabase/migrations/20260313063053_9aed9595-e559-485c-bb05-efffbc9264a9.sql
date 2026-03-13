
-- Customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  street TEXT,
  number TEXT,
  neighborhood TEXT,
  city TEXT DEFAULT 'Não informado',
  state TEXT DEFAULT 'SP',
  complement TEXT,
  is_favorite BOOLEAN DEFAULT false,
  notes TEXT,
  cashback_balance NUMERIC(10,2) DEFAULT 0,
  cashback_percent NUMERIC(5,2) DEFAULT 0,
  loyalty_points INTEGER DEFAULT 0,
  loyalty_tier TEXT DEFAULT 'bronze',
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC(10,2) DEFAULT 0,
  last_order_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for phone lookups (PDV)
CREATE INDEX idx_customers_phone ON public.customers(phone);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins full access on customers"
  ON public.customers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users can read their own customer record
CREATE POLICY "Users can view own customer record"
  ON public.customers FOR SELECT TO authenticated
  USING (user_id = auth.uid());
