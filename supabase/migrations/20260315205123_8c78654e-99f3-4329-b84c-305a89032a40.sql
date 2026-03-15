
ALTER TABLE public.delivery_settings 
  ADD COLUMN IF NOT EXISTS base_distance_km numeric NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS base_fee numeric NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS extra_km_fee numeric NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS min_order_value numeric NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS estimated_time_min integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS estimated_time_max integer NOT NULL DEFAULT 50;
