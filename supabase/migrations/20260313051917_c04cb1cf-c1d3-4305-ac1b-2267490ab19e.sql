
-- Coupons table
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
  discount_value NUMERIC NOT NULL DEFAULT 0,
  min_order_value NUMERIC DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  used_count INTEGER NOT NULL DEFAULT 0,
  max_uses_per_user INTEGER DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons" ON public.coupons
  FOR SELECT TO public USING (active = true);

CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Combos table
CREATE TABLE public.combos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  items JSONB NOT NULL DEFAULT '[]', -- [{product_id, product_name, quantity}]
  original_price NUMERIC NOT NULL DEFAULT 0,
  combo_price NUMERIC NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.combos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active combos" ON public.combos
  FOR SELECT TO public USING (active = true);

CREATE POLICY "Admins can manage combos" ON public.combos
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Happy Hour settings
CREATE TABLE public.happy_hour (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Happy Hour',
  weekdays INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5}', -- 0=Sun, 1=Mon...6=Sat
  start_time TIME NOT NULL DEFAULT '16:00',
  end_time TIME NOT NULL DEFAULT '19:00',
  discount_percent NUMERIC NOT NULL DEFAULT 10,
  categories TEXT[] DEFAULT '{}', -- category slugs, empty = all
  active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.happy_hour ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active happy_hour" ON public.happy_hour
  FOR SELECT TO public USING (active = true);

CREATE POLICY "Admins can manage happy_hour" ON public.happy_hour
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Loyalty program
CREATE TABLE public.loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_redeemed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own loyalty" ON public.loyalty_points
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage loyalty" ON public.loyalty_points
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own loyalty" ON public.loyalty_points
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Loyalty transactions
CREATE TABLE public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  points INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'earn', 'redeem', 'cashback'
  description TEXT,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.loyalty_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage transactions" ON public.loyalty_transactions
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Marketing settings (for global configs like loyalty points per real, cashback %)
CREATE TABLE public.marketing_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.marketing_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings" ON public.marketing_settings
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage settings" ON public.marketing_settings
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Insert default marketing settings
INSERT INTO public.marketing_settings (key, value, description) VALUES
  ('loyalty_points_per_real', '1', 'Pontos ganhos por R$ gasto'),
  ('loyalty_points_to_redeem', '100', 'Pontos necessários para resgatar R$ 5'),
  ('loyalty_redeem_value', '5', 'Valor em R$ ao resgatar pontos'),
  ('cashback_percent', '5', 'Percentual de cashback por compra'),
  ('cashback_active', 'false', 'Cashback ativado'),
  ('loyalty_active', 'false', 'Programa de fidelidade ativado');
