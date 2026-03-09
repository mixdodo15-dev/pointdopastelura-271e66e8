-- Allow anonymous users to view orders by specific order IDs
-- This policy will allow access to orders where the user_id is null (anonymous orders)
-- and the order can be identified by its ID (for guest tracking via localStorage)

CREATE POLICY "Anyone can view orders by ID"
ON public.orders
FOR SELECT
USING (user_id IS NULL);

-- Also allow anonymous users to view order items for orders they can see
CREATE POLICY "Anyone can view order items for anonymous orders" 
ON public.order_items
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM orders 
  WHERE orders.id = order_items.order_id 
  AND orders.user_id IS NULL
));