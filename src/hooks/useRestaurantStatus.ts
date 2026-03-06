import { useState, useEffect } from 'react';

interface RestaurantStatus {
  isOpen: boolean;
  label: string;
  subtitle: string;
}

export function useRestaurantStatus(): RestaurantStatus {
  const getStatus = (): RestaurantStatus => {
    const now = new Date();
    const hour = now.getHours();
    // Open 18:00–23:59 (hour >= 18 && hour < 24)
    const isOpen = hour >= 18;
    return {
      isOpen,
      label: isOpen ? 'ABERTO AGORA' : 'FECHADO',
      subtitle: isOpen ? 'Fechamos às 00:00' : 'Abrimos às 18:00',
    };
  };

  const [status, setStatus] = useState(getStatus);

  useEffect(() => {
    const interval = setInterval(() => setStatus(getStatus()), 60_000);
    return () => clearInterval(interval);
  }, []);

  return status;
}
