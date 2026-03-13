import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HappyHourConfig {
  id: string;
  name: string;
  weekdays: number[];
  start_time: string;
  end_time: string;
  discount_percent: number;
  categories: string[];
  active: boolean;
}

export const useHappyHour = () => {
  const [activeHH, setActiveHH] = useState<HappyHourConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase
        .from('happy_hour')
        .select('*')
        .eq('active', true);

      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      const now = new Date();
      const currentDay = now.getDay(); // 0=Sun
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const match = (data as HappyHourConfig[]).find(hh => {
        const dayMatch = hh.weekdays.includes(currentDay);
        const startTime = hh.start_time.slice(0, 5);
        const endTime = hh.end_time.slice(0, 5);
        const timeMatch = currentTime >= startTime && currentTime <= endTime;
        return dayMatch && timeMatch;
      });

      setActiveHH(match || null);
      setLoading(false);
    };

    check();
    // Re-check every minute
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, []);

  const getDiscountedPrice = (price: number, category?: string): { original: number; discounted: number; hasDiscount: boolean } => {
    if (!activeHH) return { original: price, discounted: price, hasDiscount: false };
    // If categories is empty array, apply to all
    const applies = !activeHH.categories || activeHH.categories.length === 0 || (category && activeHH.categories.includes(category));
    if (!applies) return { original: price, discounted: price, hasDiscount: false };
    const discounted = price * (1 - activeHH.discount_percent / 100);
    return { original: price, discounted: Math.round(discounted * 100) / 100, hasDiscount: true };
  };

  return { activeHH, loading, getDiscountedPrice };
};
