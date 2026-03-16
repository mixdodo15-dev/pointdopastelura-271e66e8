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

export interface GeocodeRequest {
  street: string;
  number?: string;
  neighborhood: string;
  city: string;
  cep?: string;
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

  /** Try to geocode an address to get lat/lng using Nominatim (free, no API key). Uses fallback formats if strict search fails. */
  const geocodeAddress = useCallback(async (address: GeocodeRequest): Promise<{ lat: number; lng: number } | null> => {
    const normalizedCity = address.city.replace('/', ', ');
    
    // Fallback levels: from most specific to least specific
    const queries = [
      `${address.street}, ${address.number}, ${address.neighborhood}, ${normalizedCity}, Brasil`, // Exact
      `${address.street}, ${address.neighborhood}, ${normalizedCity}, Brasil`, // No number
      `${address.street}, ${normalizedCity}, Brasil`, // No neighborhood
      address.cep ? `${address.cep}, Brasil` : null // Just CEP
    ].filter(Boolean) as string[];

    for (const query of queries) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=br`,
          { headers: { 'User-Agent': 'PointDoPastel/1.0' } }
        );
        const data = await res.json();
        
        if (data.length > 0) {
          return { 
            lat: parseFloat(data[0].lat), 
            lng: parseFloat(data[0].lon || data[0].lng) 
          };
        }
        
        // Respect Nominatim rate limits (Max 1 req/sec)
        await new Promise(r => setTimeout(r, 1000));
      } catch (err) {
        console.error('Geocode error:', err);
      }
    }
    
    return null;
  }, []);

  return { fetchAddress, searchByStreet, geocodeAddress, loading };
};
