import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, MapPin, LogOut, ArrowLeft, Save, Package } from 'lucide-react';

const MinhaConta = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ display_name: '', phone: '', email: '' });
  const [address, setAddress] = useState({ id: '', street: '', number: '', neighborhood: '', complement: '', city: '' });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/cliente-login'); return; }

      const { data: prof } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      if (prof) {
        setProfile({
          display_name: prof.display_name || '',
          phone: (prof as any).phone || '',
          email: prof.email || user.email || '',
        });
      }

      const { data: addr } = await supabase.from('addresses').select('*').eq('user_id', user.id).limit(1).single();
      if (addr) {
        setAddress({
          id: addr.id,
          street: addr.street,
          number: addr.number,
          neighborhood: addr.neighborhood,
          complement: addr.complement || '',
          city: addr.city,
        });
      }

      setLoading(false);
    };
    load();
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      await supabase.from('profiles').update({
        display_name: profile.display_name.trim(),
        phone: profile.phone.trim(),
      }).eq('user_id', user.id);

      if (address.id) {
        await supabase.from('addresses').update({
          street: address.street.trim(),
          number: address.number.trim(),
          neighborhood: address.neighborhood.trim(),
          complement: address.complement.trim() || null,
          city: address.city.trim(),
        }).eq('id', address.id);
      } else {
        await supabase.from('addresses').insert({
          user_id: user.id,
          street: address.street.trim(),
          number: address.number.trim(),
          neighborhood: address.neighborhood.trim(),
          complement: address.complement.trim() || null,
          city: address.city.trim(),
        });
      }

      toast.success('Dados salvos com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logout realizado!');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 text-sm">
            <ArrowLeft className="h-4 w-4" /> Cardápio
          </button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive hover:text-destructive gap-1">
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>

        <h1 className="text-2xl font-extrabold text-primary mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Minha Conta
        </h1>

        {/* Profile Section */}
        <div className="bg-card rounded-2xl p-5 shadow-lg space-y-4 mb-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Dados pessoais
          </h3>

          <div className="space-y-1.5">
            <Label>Nome completo</Label>
            <Input value={profile.display_name} onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))}
              className="h-11 rounded-xl bg-secondary border-0" maxLength={100} />
          </div>

          <div className="space-y-1.5">
            <Label>Telefone</Label>
            <Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
              className="h-11 rounded-xl bg-secondary border-0" maxLength={20} type="tel" />
          </div>

          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={profile.email} disabled className="h-11 rounded-xl bg-muted border-0 text-muted-foreground" />
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-card rounded-2xl p-5 shadow-lg space-y-4 mb-6">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Endereço de entrega
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Rua</Label>
              <Input value={address.street} onChange={e => setAddress(a => ({ ...a, street: e.target.value }))}
                className="h-11 rounded-xl bg-secondary border-0" maxLength={200} />
            </div>
            <div className="space-y-1.5">
              <Label>Nº</Label>
              <Input value={address.number} onChange={e => setAddress(a => ({ ...a, number: e.target.value }))}
                className="h-11 rounded-xl bg-secondary border-0" maxLength={10} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Bairro</Label>
              <Input value={address.neighborhood} onChange={e => setAddress(a => ({ ...a, neighborhood: e.target.value }))}
                className="h-11 rounded-xl bg-secondary border-0" maxLength={100} />
            </div>
            <div className="space-y-1.5">
              <Label>Cidade</Label>
              <Input value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                className="h-11 rounded-xl bg-secondary border-0" maxLength={100} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Complemento</Label>
            <Input value={address.complement} onChange={e => setAddress(a => ({ ...a, complement: e.target.value }))}
              placeholder="Apto, bloco... (opcional)" className="h-11 rounded-xl bg-secondary border-0" maxLength={100} />
          </div>
        </div>

        <Button onClick={handleSave} className="w-full rounded-xl py-5 text-sm font-bold gap-2 mb-3" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </Button>

        <Button variant="outline" onClick={() => navigate('/meus-pedidos')} className="w-full rounded-xl py-5 text-sm font-bold gap-2 border-primary text-primary hover:bg-primary/5">
          <Package className="h-4 w-4" />
          Meus Pedidos
        </Button>
      </div>
    </div>
  );
};

export default MinhaConta;
