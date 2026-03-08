
-- Add driver_id to orders for assignment
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Drivers can view orders that are ready or assigned to them
CREATE POLICY "Drivers can view available orders" ON public.orders
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'driver') AND (
      status IN ('accepted', 'preparing', 'out_for_delivery') OR driver_id = auth.uid()
    )
  );

-- Drivers can update orders assigned to them
CREATE POLICY "Drivers can update assigned orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'driver') AND (
      driver_id = auth.uid() OR (driver_id IS NULL AND status IN ('accepted', 'preparing', 'out_for_delivery'))
    )
  );

-- Drivers can view order items for visible orders
CREATE POLICY "Drivers can view order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'driver') AND EXISTS (
      SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (
        orders.status IN ('accepted', 'preparing', 'out_for_delivery') OR orders.driver_id = auth.uid()
      )
    )
  );
