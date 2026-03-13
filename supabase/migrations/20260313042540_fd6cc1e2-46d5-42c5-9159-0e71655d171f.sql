
CREATE OR REPLACE FUNCTION public.format_order_number(num integer)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT 'Point-' || lpad(num::text, 4, '0');
$$;
