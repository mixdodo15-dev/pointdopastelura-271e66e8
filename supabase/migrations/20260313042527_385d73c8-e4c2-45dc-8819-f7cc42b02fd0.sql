
-- Add sequential order number column
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number serial;

-- Create a function to generate the formatted order number
CREATE OR REPLACE FUNCTION public.format_order_number(num integer)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 'Point-' || lpad(num::text, 4, '0');
$$;
