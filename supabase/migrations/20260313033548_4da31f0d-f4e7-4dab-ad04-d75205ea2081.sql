ALTER TABLE public.products ADD COLUMN available_on text NOT NULL DEFAULT 'both';
COMMENT ON COLUMN public.products.available_on IS 'Where the product is available: site, pdv, or both';