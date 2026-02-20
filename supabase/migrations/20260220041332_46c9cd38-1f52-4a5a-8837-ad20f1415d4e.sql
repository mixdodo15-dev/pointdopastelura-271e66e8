
-- Create categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  icon text NOT NULL DEFAULT '📦',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories"
ON public.categories FOR SELECT
USING (active = true);

-- Admins can view all categories
CREATE POLICY "Admins can view all categories"
ON public.categories FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage categories
CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed existing categories
INSERT INTO public.categories (slug, label, icon, sort_order) VALUES
('monte', 'Monte Seu Pastel', '🥟', 1),
('especiais', 'Pastel Especial', '⭐', 2),
('doces', 'Pastel Doce', '🍫', 3),
('batatas', 'Batatas', '🍟', 4),
('bebidas', 'Bebidas', '🥤', 5),
('adicionais', 'Adicionais', '➕', 6);
