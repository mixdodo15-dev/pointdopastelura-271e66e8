import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, MapPin, Truck, Ruler, DollarSign, Loader2, Clock, ShoppingBag, Calculator, BarChart3 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface DeliverySettingsData {
  id: string;
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

interface DeliveryStats {
  totalOrders: number;
  avgDistance: number;
  avgFee: number;
  topNeighborhoods: { name: string; count: number }[];
}

const AdminDeliverySettings = () => {
  const [settings, setSettings] = useState<DeliverySettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [simDistance, setSimDistance] = useState('');
  const [simResult, setSimResult] = useState<{ fee: number; time: string } | null>(null);

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('delivery_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      toast.error('Erro ao carregar configurações');
      setLoading(false);
      return;
    }

    if (data) {
      setSettings({
        id: data.id,
        store_lat: Number(data.store_lat),
        store_lng: Number(data.store_lng),
        max_radius_km: Number(data.max_radius_km),
        fee_per_km: Number(data.fee_per_km),
        min_fee: Number(data.min_fee),
        base_distance_km: Number((data as any).base_distance_km ?? 2),
        base_fee: Number((data as any).base_fee ?? 5),
        extra_km_fee: Number((data as any).extra_km_fee ?? 2),
        min_order_value: Number((data as any).min_order_value ?? 20),
        estimated_time_min: Number((data as any).estimated_time_min ?? 30),
        estimated_time_max: Number((data as any).estimated_time_max ?? 50),
      });
    }
    setLoading(false);
  };

  const loadStats = async () => {
    const { data: orders } = await supabase
      .from('orders')
      .select('delivery_fee, delivery_address')
      .neq('delivery_address', 'RETIRADA NO LOCAL')
      .order('created_at', { ascending: false })
      .limit(500);

    if (orders && orders.length > 0) {
      const fees = orders.map(o => Number(o.delivery_fee)).filter(f => f > 0);
      const neighborhoodMap: Record<string, number> = {};
      orders.forEach(o => {
        const parts = o.delivery_address.split(' - ');
        const bairro = parts.length >= 2 ? parts[parts.length - 2]?.trim() : 'Outros';
        if (bairro) neighborhoodMap[bairro] = (neighborhoodMap[bairro] || 0) + 1;
      });
      const topNeighborhoods = Object.entries(neighborhoodMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      setStats({
        totalOrders: orders.length,
        avgDistance: 0,
        avgFee: fees.length > 0 ? fees.reduce((a, b) => a + b, 0) / fees.length : 0,
        topNeighborhoods,
      });
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);

    const { error } = await supabase
      .from('delivery_settings')
      .update({
        store_lat: settings.store_lat,
        store_lng: settings.store_lng,
        max_radius_km: settings.max_radius_km,
        fee_per_km: settings.fee_per_km,
        min_fee: settings.min_fee,
        base_distance_km: settings.base_distance_km,
        base_fee: settings.base_fee,
        extra_km_fee: settings.extra_km_fee,
        min_order_value: settings.min_order_value,
        estimated_time_min: settings.estimated_time_min,
        estimated_time_max: settings.estimated_time_max,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', settings.id);

    if (error) {
      toast.error('Erro ao salvar');
    } else {
      toast.success('Configurações salvas!');
    }
    setSaving(false);
  };

  const update = (field: keyof DeliverySettingsData, value: string) => {
    if (!settings) return;
    const num = parseFloat(value.replace(',', '.'));
    if (!isNaN(num)) {
      setSettings({ ...settings, [field]: num });
    }
  };

  const updateInt = (field: keyof DeliverySettingsData, value: string) => {
    if (!settings) return;
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      setSettings({ ...settings, [field]: num });
    }
  };

  const simulateFee = () => {
    if (!settings || !simDistance) return;
    const dist = parseFloat(simDistance.replace(',', '.'));
    if (isNaN(dist) || dist <= 0) { toast.error('Digite uma distância válida'); return; }
    if (dist > settings.max_radius_km) {
      setSimResult(null);
      toast.error(`Fora do raio de entrega (máx ${settings.max_radius_km} km)`);
      return;
    }
    let fee: number;
    const roundedDist = Math.ceil(dist);
    if (roundedDist <= settings.base_distance_km) {
      fee = settings.base_fee;
    } else {
      fee = settings.base_fee + ((roundedDist - settings.base_distance_km) * settings.extra_km_fee);
    }
    setSimResult({
      fee: Math.round(fee * 100) / 100,
      time: `${settings.estimated_time_min}-${settings.estimated_time_max} min`,
    });
  };

  const generateFeeTable = () => {
    if (!settings) return [];
    const rows: { km: number; fee: number }[] = [];
    for (let km = 1; km <= settings.max_radius_km; km++) {
      let fee: number;
      const roundedKm = Math.ceil(km);
      if (roundedKm <= settings.base_distance_km) {
        fee = settings.base_fee;
      } else {
        fee = settings.base_fee + ((roundedKm - settings.base_distance_km) * settings.extra_km_fee);
      }
      rows.push({ km, fee: Math.round(fee * 100) / 100 });
    }
    return rows;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhuma configuração encontrada.</p>
      </div>
    );
  }

  const feeTable = generateFeeTable();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Configurações de Entrega
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure taxa base, km adicional, raio e pedido mínimo
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Base Fee Config */}
        <div className="bg-card rounded-xl border p-5 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Taxa Base
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Distância base (km)</Label>
              <Input type="number" step="0.5" min="0" value={settings.base_distance_km}
                onChange={e => update('base_distance_km', e.target.value)} className="rounded-xl" />
              <p className="text-[10px] text-muted-foreground">Até essa distância, cobra taxa base</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Taxa base (R$)</Label>
              <Input type="number" step="0.50" min="0" value={settings.base_fee}
                onChange={e => update('base_fee', e.target.value)} className="rounded-xl" />
              <p className="text-[10px] text-muted-foreground">Valor cobrado até a distância base</p>
            </div>
          </div>
        </div>

        {/* Extra KM */}
        <div className="bg-card rounded-xl border p-5 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Ruler className="h-4 w-4 text-primary" />
            KM Adicional
          </h3>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Valor por km extra (R$)</Label>
            <Input type="number" step="0.50" min="0" value={settings.extra_km_fee}
              onChange={e => update('extra_km_fee', e.target.value)} className="rounded-xl" />
          </div>
          <div className="bg-secondary rounded-lg px-3 py-2 text-xs space-y-0.5">
            <p className="font-semibold">Fórmula:</p>
            <p className="font-mono text-[11px]">taxa = {settings.base_fee} + ((arredonda_cima(km) - {settings.base_distance_km}) × {settings.extra_km_fee})</p>
          </div>
        </div>

        {/* Max Radius */}
        <div className="bg-card rounded-xl border p-5 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Raio Máximo
          </h3>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Raio máximo de entrega (km)</Label>
            <Input type="number" step="0.5" min="1" value={settings.max_radius_km}
              onChange={e => update('max_radius_km', e.target.value)} className="rounded-xl" />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Pedidos fora desse raio serão bloqueados automaticamente.
          </p>
        </div>

        {/* Min Order */}
        <div className="bg-card rounded-xl border p-5 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-primary" />
            Pedido Mínimo
          </h3>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Valor mínimo para entrega (R$)</Label>
            <Input type="number" step="1" min="0" value={settings.min_order_value}
              onChange={e => update('min_order_value', e.target.value)} className="rounded-xl" />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Pedidos abaixo desse valor não poderão ser enviados para entrega.
          </p>
        </div>

        {/* Estimated Time */}
        <div className="bg-card rounded-xl border p-5 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Tempo Estimado
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Mínimo (min)</Label>
              <Input type="number" min="5" value={settings.estimated_time_min}
                onChange={e => updateInt('estimated_time_min', e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Máximo (min)</Label>
              <Input type="number" min="5" value={settings.estimated_time_max}
                onChange={e => updateInt('estimated_time_max', e.target.value)} className="rounded-xl" />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Exibido no checkout: {settings.estimated_time_min}-{settings.estimated_time_max} minutos
          </p>
        </div>

        {/* Store Location */}
        <div className="bg-card rounded-xl border p-5 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Localização da Loja
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Latitude</Label>
              <Input type="number" step="0.0001" value={settings.store_lat}
                onChange={e => update('store_lat', e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Longitude</Label>
              <Input type="number" step="0.0001" value={settings.store_lng}
                onChange={e => update('store_lng', e.target.value)} className="rounded-xl" />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            💡 Google Maps → clique direito → copie as coordenadas.
          </p>
        </div>
      </div>

      {/* Fee Table */}
      <div className="bg-card rounded-xl border p-5 space-y-4">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          Tabela de Taxas por Distância
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {feeTable.map(row => (
            <div key={row.km} className="bg-secondary rounded-lg px-3 py-2 text-center">
              <p className="text-xs font-bold text-muted-foreground">{row.km} km</p>
              <p className="text-sm font-extrabold text-primary">R$ {row.fee.toFixed(2).replace('.', ',')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Simulator */}
      <div className="bg-card rounded-xl border p-5 space-y-4">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          Simulador de Frete
        </h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Distância (km)</Label>
            <Input type="number" step="0.1" min="0" placeholder="Ex: 5"
              value={simDistance} onChange={e => setSimDistance(e.target.value)} className="rounded-xl" />
          </div>
          <Button onClick={simulateFee} className="rounded-xl gap-2 h-10">
            <Calculator className="h-4 w-4" /> Calcular
          </Button>
        </div>
        {simResult && (
          <div className="bg-primary/10 rounded-xl px-4 py-3 flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-primary">Taxa: R$ {simResult.fee.toFixed(2).replace('.', ',')}</p>
              <p className="text-xs text-muted-foreground">⏱ Tempo estimado: {simResult.time}</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="bg-card rounded-xl border p-5 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Estatísticas de Entrega
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary rounded-lg px-4 py-3 text-center">
              <p className="text-2xl font-extrabold text-primary">{stats.totalOrders}</p>
              <p className="text-xs text-muted-foreground">Entregas realizadas</p>
            </div>
            <div className="bg-secondary rounded-lg px-4 py-3 text-center">
              <p className="text-2xl font-extrabold text-primary">R$ {stats.avgFee.toFixed(2).replace('.', ',')}</p>
              <p className="text-xs text-muted-foreground">Taxa média</p>
            </div>
          </div>
          {stats.topNeighborhoods.length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2">Top Bairros</p>
              <div className="space-y-1.5">
                {stats.topNeighborhoods.map((n, i) => (
                  <div key={i} className="flex justify-between items-center bg-secondary rounded-lg px-3 py-2">
                    <span className="text-sm font-semibold">{n.name}</span>
                    <span className="text-xs font-bold text-primary">{n.count} pedidos</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Map */}
      <div className="bg-card rounded-xl border p-5 space-y-4">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Mapa da Área de Entrega
        </h3>
        <p className="text-[11px] text-muted-foreground">
          Clique no mapa para reposicionar a loja. O círculo mostra o raio de entrega.
        </p>
        <div className="rounded-xl overflow-hidden border" style={{ height: 400 }}>
          <DeliveryMap
            lat={settings.store_lat}
            lng={settings.store_lng}
            radiusKm={settings.max_radius_km}
            onLocationChange={(lat, lng) => setSettings({ ...settings, store_lat: lat, store_lng: lng })}
          />
        </div>
      </div>
    </div>
  );
};

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const DeliveryMap = ({
  lat, lng, radiusKm, onLocationChange,
}: {
  lat: number; lng: number; radiusKm: number;
  onLocationChange: (lat: number, lng: number) => void;
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    const map = L.map(mapRef.current).setView([lat, lng], 13);
    leafletMapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    markerRef.current = L.marker([lat, lng]).addTo(map);
    circleRef.current = L.circle([lat, lng], {
      radius: radiusKm * 1000,
      color: 'hsl(0, 85%, 50%)',
      fillColor: 'hsl(0, 85%, 50%)',
      fillOpacity: 0.12,
      weight: 2,
    }).addTo(map);
    map.on('click', (e: L.LeafletMouseEvent) => {
      const newLat = Math.round(e.latlng.lat * 10000) / 10000;
      const newLng = Math.round(e.latlng.lng * 10000) / 10000;
      onLocationChange(newLat, newLng);
    });
    return () => { map.remove(); leafletMapRef.current = null; markerRef.current = null; circleRef.current = null; };
  }, [lat, lng, onLocationChange, radiusKm]);

  useEffect(() => {
    if (!leafletMapRef.current || !markerRef.current || !circleRef.current) return;
    const nextLatLng: L.LatLngExpression = [lat, lng];
    markerRef.current.setLatLng(nextLatLng);
    circleRef.current.setLatLng(nextLatLng);
    circleRef.current.setRadius(radiusKm * 1000);
    leafletMapRef.current.panTo(nextLatLng, { animate: true });
  }, [lat, lng, radiusKm]);

  return <div ref={mapRef} className="h-full w-full" />;
};

export default AdminDeliverySettings;
