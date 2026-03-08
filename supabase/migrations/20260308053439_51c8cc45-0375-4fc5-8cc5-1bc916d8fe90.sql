
-- Fix overly permissive policy on order_items for anon
DROP POLICY "Anyone can insert order items" ON public.order_items;

CREATE POLICY "Anyone can insert order items" ON public.order_items
  FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id IS NULL
    )
  );
