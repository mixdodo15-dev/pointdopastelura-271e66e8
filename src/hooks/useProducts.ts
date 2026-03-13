import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { MenuItem } from '@/data/menu';

export const useProducts = () => {
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .in('available_on', ['site', 'both'])
        .order('sort_order');

      if (!error && data) {
        setProducts(
          data.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description || undefined,
            price: Number(p.price),
            category: p.category,
            subcategory: p.subcategory || undefined,
            maxFlavors: p.max_flavors || undefined,
            imageUrl: p.image_url || undefined,
            isTopWeek: p.is_top_week || false,
          }))
        );
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return { products, loading };
};
