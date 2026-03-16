import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DeliverySettings {
  store_lat: number;
  store_lng: number;
  max_radius_km: number;
  fee_per_km: number;
  min_fee: number;
  base_distance_km: number;
  base_fee: number;
  extra_km_fee: number;
  min_order_value: number;
  estimated_time_min: number;
  estimated_time_max: number;
}

const DEFAULT_SETTINGS: DeliverySettings = {
  store_lat: -18.9186,
  store_lng: -48.2772,
  max_radius_km: 10,
  fee_per_km: 1.5,
  min_fee: 5,
  base_distance_km: 1,
  base_fee: 5,
  extra_km_fee: 3,
  min_order_value: 20,
  estimated_time_min: 30,
  estimated_time_max: 50,
};

export const useDeliverySettings = () => {
  const [settings, setSettings] = useState<DeliverySettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('delivery_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (data) {
        setSettings({
          store_lat: Number(data.store_lat),
          store_lng: Number(data.store_lng),
          max_radius_km: Number(data.max_radius_km),
          fee_per_km: Number(data.fee_per_km),
          min_fee: Number(data.min_fee),
          base_distance_km: Number(data.base_distance_km ?? 1),
          base_fee: Number(data.base_fee ?? 5),
          extra_km_fee: Number(data.extra_km_fee ?? 3),
          min_order_value: Number(data.min_order_value ?? 20),
          estimated_time_min: Number(data.estimated_time_min ?? 30),
          estimated_time_max: Number(data.estimated_time_max ?? 50),
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  return { settings, loading };
};

/** Haversine distance in km */
export const calcDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.ceil(dist);
};

/** New formula: base fee for base distance, then extra per km */
export const calcDeliveryFee = (distanceKm: number, settings: DeliverySettings): number => {
  if (distanceKm <= settings.base_distance_km) {
    return settings.base_fee;
  }
  const extraKm = distanceKm - settings.base_distance_km;
  return settings.base_fee + (extraKm * settings.extra_km_fee);
};
