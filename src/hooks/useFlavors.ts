import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { FlavorOption } from '@/data/menu';

export const useFlavors = () => {
  const [flavors, setFlavors] = useState<FlavorOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlavors = async () => {
      const { data, error } = await supabase
        .from('flavors')
        .select('*')
        .eq('active', true)
        .order('name');

      if (!error && data) {
        setFlavors(
          data.map((f) => ({
            name: f.name,
            type: f.type as 'salgado' | 'doce',
          }))
        );
      }
      setLoading(false);
    };

    fetchFlavors();
  }, []);

  return { flavors, loading };
};
