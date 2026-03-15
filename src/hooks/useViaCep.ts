import { useState, useCallback } from 'react';

interface ViaCepResult {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export const useViaCep = () => {
  const [loading, setLoading] = useState(false);

  const fetchAddress = useCallback(async (cep: string): Promise<ViaCepResult | null> => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return null;

    setLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data: ViaCepResult = await res.json();
      if (data.erro) return null;
      return data;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Search addresses by street name + city using ViaCEP */
  const searchByStreet = useCallback(async (uf: string, city: string, street: string): Promise<ViaCepResult[]> => {
    if (street.length < 3) return [];
    setLoading(true);
    try {
      const res = await fetch(
        `https://viacep.com.br/ws/${encodeURIComponent(uf)}/${encodeURIComponent(city)}/${encodeURIComponent(street)}/json/`
      );
      const data = await res.json();
      if (Array.isArray(data)) return data as ViaCepResult[];
      return [];
    } catch {
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /** Try to geocode an address to get lat/lng using Nominatim (free, no API key) */
  const geocodeAddress = useCallback(async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=br`,
        { headers: { 'User-Agent': 'PointDoPastel/1.0' } }
      );
      const data = await res.json();
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lng) };
      }
      return null;
    } catch {
      return null;
    }
  };

  return { fetchAddress, searchByStreet, geocodeAddress, loading };
};
