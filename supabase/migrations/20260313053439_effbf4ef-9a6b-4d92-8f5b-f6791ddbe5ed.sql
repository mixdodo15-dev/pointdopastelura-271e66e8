
CREATE TABLE public.delivery_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_lat numeric NOT NULL DEFAULT -18.9186,
  store_lng numeric NOT NULL DEFAULT -48.2772,
  max_radius_km numeric NOT NULL DEFAULT 10,
  fee_per_km numeric NOT NULL DEFAULT 1.50,
  min_fee numeric NOT NULL DEFAULT 5.00,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage delivery_settings" ON public.delivery_settings FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view delivery_settings" ON public.delivery_settings FOR SELECT TO public USING (true);

INSERT INTO public.delivery_settings (store_lat, store_lng, max_radius_km, fee_per_km, min_fee) VALUES (-18.9186, -48.2772, 10, 1.50, 5.00);
