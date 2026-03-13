import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, MapPin, Truck, Ruler, DollarSign, Loader2 } from 'lucide-react';

interface DeliverySettingsData {
  id: string;
  store_lat: number;
  store_lng: number;
  max_radius_km: number;
  fee_per_km: number;
  min_fee: number;
}

const AdminDeliverySettings = () => {
  const [settings, setSettings] = useState<DeliverySettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
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
      });
    }
    setLoading(false);
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
        updated_at: new Date().toISOString(),
      })
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Configurações de Entrega
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure a área de entrega, taxa por km e taxa mínima
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Store Location */}
        <div className="bg-card rounded-xl border p-5 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Localização da Loja
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Latitude</Label>
              <Input
                type="number"
                step="0.0001"
                value={settings.store_lat}
                onChange={e => update('store_lat', e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Longitude</Label>
              <Input
                type="number"
                step="0.0001"
                value={settings.store_lng}
                onChange={e => update('store_lng', e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            💡 Para encontrar as coordenadas, abra o Google Maps, clique com botão direito no local da loja e copie as coordenadas.
          </p>
        </div>

        {/* Delivery Area */}
        <div className="bg-card rounded-xl border p-5 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Ruler className="h-4 w-4 text-primary" />
            Área de Entrega
          </h3>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Raio máximo (km)</Label>
            <Input
              type="number"
              step="0.5"
              min="1"
              value={settings.max_radius_km}
              onChange={e => update('max_radius_km', e.target.value)}
              className="rounded-xl"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Pedidos fora desse raio serão bloqueados automaticamente no checkout.
          </p>
        </div>

        {/* Fee per KM */}
        <div className="bg-card rounded-xl border p-5 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Taxa por Quilômetro
          </h3>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Valor (R$) por km</Label>
            <Input
              type="number"
              step="0.10"
              min="0"
              value={settings.fee_per_km}
              onChange={e => update('fee_per_km', e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="bg-secondary rounded-lg px-3 py-2 text-xs">
            <p className="font-semibold">Exemplos de taxa:</p>
            <p>3 km → R$ {(3 * settings.fee_per_km).toFixed(2).replace('.', ',')}</p>
            <p>5 km → R$ {(5 * settings.fee_per_km).toFixed(2).replace('.', ',')}</p>
            <p>10 km → R$ {(10 * settings.fee_per_km).toFixed(2).replace('.', ',')}</p>
          </div>
        </div>

        {/* Minimum Fee */}
        <div className="bg-card rounded-xl border p-5 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Taxa Mínima
          </h3>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Valor mínimo de entrega (R$)</Label>
            <Input
              type="number"
              step="0.50"
              min="0"
              value={settings.min_fee}
              onChange={e => update('min_fee', e.target.value)}
              className="rounded-xl"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Se a taxa calculada por km for menor que esse valor, a taxa mínima será aplicada.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDeliverySettings;
