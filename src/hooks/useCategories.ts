import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  slug: string;
  label: string;
  icon: string;
  sort_order: number;
  active: boolean;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('sort_order');

      if (!error && data) {
        setCategories(data.map(c => ({
          id: c.id,
          slug: c.slug,
          label: c.label,
          icon: c.icon,
          sort_order: c.sort_order,
          active: c.active,
        })));
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  return { categories, loading };
};
