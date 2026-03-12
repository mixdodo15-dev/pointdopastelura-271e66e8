
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS prep_time integer DEFAULT 10;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_source text DEFAULT 'delivery';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS table_number text;

CREATE TABLE public.cash_register (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  opening_amount numeric NOT NULL DEFAULT 0,
  closing_amount numeric,
  total_sales numeric DEFAULT 0,
  difference numeric DEFAULT 0,
  opened_at timestamp with time zone NOT NULL DEFAULT now(),
  closed_at timestamp with time zone,
  status text NOT NULL DEFAULT 'open',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.cash_register ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage cash_register" ON public.cash_register
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own cash_register" ON public.cash_register
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
