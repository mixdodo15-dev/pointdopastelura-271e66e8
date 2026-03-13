import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Ticket, Package, Clock, Star, Coins, Bell, MessageCircle, Mail, Smartphone, Plus, Pencil, Trash2, Copy, Gift
} from 'lucide-react';
import { cn } from '@/lib/utils';

const formatPrice = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────
interface Coupon {
  id: string; code: string; description: string | null; discount_type: string;
  discount_value: number; min_order_value: number; max_uses: number | null;
  used_count: number; max_uses_per_user: number; active: boolean;
  starts_at: string; expires_at: string | null; created_at: string;
}

interface Combo {
  id: string; name: string; description: string | null; image_url: string | null;
  items: any[]; original_price: number; combo_price: number; active: boolean;
  sort_order: number;
}

interface HappyHour {
  id: string; name: string; weekdays: number[]; start_time: string;
  end_time: string; discount_percent: number; categories: string[];
  active: boolean;
}

interface MarketingSetting {
  id: string; key: string; value: string; description: string | null;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const AdminMarketing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('cupons');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [happyHours, setHappyHours] = useState<HappyHour[]>([]);
  const [settings, setSettings] = useState<MarketingSetting[]>([]);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [newCoupon, setNewCoupon] = useState(false);
  const [editCombo, setEditCombo] = useState<Combo | null>(null);
  const [newCombo, setNewCombo] = useState(false);
  const [editHH, setEditHH] = useState<HappyHour | null>(null);
  const [newHH, setNewHH] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin');
      if (!roles?.length) { toast.error('Acesso negado'); navigate('/login'); return; }
      setLoading(false);
    };
    check();
  }, [navigate]);

  useEffect(() => {
    if (loading) return;
    loadAll();
  }, [loading]);

  const loadAll = async () => {
    const [c, cb, hh, s] = await Promise.all([
      supabase.from('coupons').select('*').order('created_at', { ascending: false }),
      supabase.from('combos').select('*').order('sort_order'),
      supabase.from('happy_hour').select('*'),
      supabase.from('marketing_settings').select('*'),
    ]);
    if (c.data) setCoupons(c.data as any);
    if (cb.data) setCombos(cb.data as any);
    if (hh.data) setHappyHours(hh.data as any);
    if (s.data) setSettings(s.data as any);
  };

  const getSetting = (key: string) => settings.find(s => s.key === key)?.value || '';

  const updateSetting = async (key: string, value: string) => {
    await supabase.from('marketing_settings').update({ value, updated_at: new Date().toISOString() }).eq('key', key);
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    toast.success('Configuração salva');
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Excluir este cupom?')) return;
    await supabase.from('coupons').delete().eq('id', id);
    setCoupons(prev => prev.filter(c => c.id !== id));
    toast.success('Cupom excluído');
  };

  const deleteCombo = async (id: string) => {
    if (!confirm('Excluir este combo?')) return;
    await supabase.from('combos').delete().eq('id', id);
    setCombos(prev => prev.filter(c => c.id !== id));
    toast.success('Combo excluído');
  };

  const deleteHH = async (id: string) => {
    if (!confirm('Excluir?')) return;
    await supabase.from('happy_hour').delete().eq('id', id);
    setHappyHours(prev => prev.filter(h => h.id !== id));
    toast.success('Happy Hour excluído');
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-2 flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Gift className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-extrabold text-foreground">Marketing & Promoções</h1>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full flex overflow-x-auto gap-1 bg-secondary rounded-xl p-1 mb-6">
            {[
              { v: 'cupons', icon: <Ticket className="h-3.5 w-3.5" />, label: 'Cupons' },
              { v: 'combos', icon: <Package className="h-3.5 w-3.5" />, label: 'Combos' },
              { v: 'happy', icon: <Clock className="h-3.5 w-3.5" />, label: 'Happy Hour' },
              { v: 'fidelidade', icon: <Star className="h-3.5 w-3.5" />, label: 'Fidelidade' },
              { v: 'cashback', icon: <Coins className="h-3.5 w-3.5" />, label: 'Cashback' },
              { v: 'canais', icon: <MessageCircle className="h-3.5 w-3.5" />, label: 'Canais' },
            ].map(t => (
              <TabsTrigger key={t.v} value={t.v} className="flex items-center gap-1.5 text-xs font-bold rounded-lg whitespace-nowrap">
                {t.icon} {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ═══ CUPONS ═══ */}
          <TabsContent value="cupons" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-foreground">🎫 Cupons de Desconto</h2>
              <Button className="rounded-xl font-bold" onClick={() => setNewCoupon(true)}><Plus className="h-4 w-4 mr-1" /> Novo Cupom</Button>
            </div>
            <p className="text-sm text-muted-foreground">Crie cupons com código que os clientes aplicam no checkout para obter descontos em percentual ou valor fixo.</p>
            {coupons.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><Ticket className="h-10 w-10 mx-auto mb-2 opacity-30" /><p className="font-bold">Nenhum cupom criado</p></div>
            ) : (
              <div className="space-y-2">
                {coupons.map(c => (
                  <div key={c.id} className={cn("bg-card rounded-xl border border-border p-4 flex items-center gap-4", !c.active && "opacity-50")}>
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Ticket className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-primary">{c.code}</span>
                        <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success('Código copiado!'); }}>
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.description || 'Sem descrição'}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="font-bold text-foreground">
                          {c.discount_type === 'percentage' ? `${c.discount_value}%` : formatPrice(c.discount_value)}
                        </span>
                        <span>Usado {c.used_count}x{c.max_uses ? ` / ${c.max_uses}` : ''}</span>
                        {c.expires_at && <span>Até {new Date(c.expires_at).toLocaleDateString('pt-BR')}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => setEditCoupon(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-destructive" onClick={() => deleteCoupon(c.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ═══ COMBOS ═══ */}
          <TabsContent value="combos" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-foreground">🎁 Combos Promocionais</h2>
              <Button className="rounded-xl font-bold" onClick={() => setNewCombo(true)}><Plus className="h-4 w-4 mr-1" /> Novo Combo</Button>
            </div>
            <p className="text-sm text-muted-foreground">Monte combinações de produtos com preço especial. Ex: "Pastel + Suco por R$ 15,90" ao invés de R$ 20.</p>
            {combos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><Package className="h-10 w-10 mx-auto mb-2 opacity-30" /><p className="font-bold">Nenhum combo criado</p></div>
            ) : (
              <div className="space-y-2">
                {combos.map(c => (
                  <div key={c.id} className={cn("bg-card rounded-xl border border-border p-4 flex items-center gap-4", !c.active && "opacity-50")}>
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.description || 'Sem descrição'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs line-through text-muted-foreground">{formatPrice(c.original_price)}</span>
                        <span className="text-sm font-extrabold text-primary">{formatPrice(c.combo_price)}</span>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                          -{Math.round(((c.original_price - c.combo_price) / c.original_price) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch checked={c.active} onCheckedChange={async (v) => {
                        await supabase.from('combos').update({ active: v }).eq('id', c.id);
                        setCombos(prev => prev.map(x => x.id === c.id ? { ...x, active: v } : x));
                      }} />
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => setEditCombo(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-destructive" onClick={() => deleteCombo(c.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ═══ HAPPY HOUR ═══ */}
          <TabsContent value="happy" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-foreground">🕐 Happy Hour</h2>
              <Button className="rounded-xl font-bold" onClick={() => setNewHH(true)}><Plus className="h-4 w-4 mr-1" /> Novo</Button>
            </div>
            <p className="text-sm text-muted-foreground">Configure descontos automáticos em horários específicos. O desconto é aplicado automaticamente durante o período configurado.</p>
            {happyHours.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground"><Clock className="h-10 w-10 mx-auto mb-2 opacity-30" /><p className="font-bold">Nenhum Happy Hour configurado</p></div>
            ) : (
              <div className="space-y-2">
                {happyHours.map(h => (
                  <div key={h.id} className={cn("bg-card rounded-xl border border-border p-4 flex items-center gap-4", !h.active && "opacity-50")}>
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-foreground">{h.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {h.weekdays.map(d => WEEKDAYS[d]).join(', ')} • {h.start_time.slice(0, 5)} - {h.end_time.slice(0, 5)}
                      </p>
                      <span className="text-sm font-extrabold text-primary">{h.discount_percent}% OFF</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch checked={h.active} onCheckedChange={async (v) => {
                        await supabase.from('happy_hour').update({ active: v }).eq('id', h.id);
                        setHappyHours(prev => prev.map(x => x.id === h.id ? { ...x, active: v } : x));
                      }} />
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => setEditHH(h)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-destructive" onClick={() => deleteHH(h.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ═══ FIDELIDADE ═══ */}
          <TabsContent value="fidelidade" className="space-y-4">
            <h2 className="text-lg font-extrabold text-foreground">⭐ Programa de Fidelidade</h2>
            <p className="text-sm text-muted-foreground">Clientes acumulam pontos a cada compra e podem trocar por descontos. Aumenta a retenção e frequência de compras.</p>
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div><Label className="font-bold">Programa ativo</Label><p className="text-xs text-muted-foreground">Habilita o acúmulo de pontos</p></div>
                <Switch checked={getSetting('loyalty_active') === 'true'} onCheckedChange={(v) => updateSetting('loyalty_active', v ? 'true' : 'false')} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Pontos por R$ gasto</Label>
                  <Input type="number" value={getSetting('loyalty_points_per_real')} onChange={e => updateSetting('loyalty_points_per_real', e.target.value)} className="h-11 rounded-xl bg-secondary border-0" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Pontos para resgatar</Label>
                  <Input type="number" value={getSetting('loyalty_points_to_redeem')} onChange={e => updateSetting('loyalty_points_to_redeem', e.target.value)} className="h-11 rounded-xl bg-secondary border-0" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Valor do resgate (R$)</Label>
                  <Input type="number" value={getSetting('loyalty_redeem_value')} onChange={e => updateSetting('loyalty_redeem_value', e.target.value)} className="h-11 rounded-xl bg-secondary border-0" />
                </div>
              </div>
              <div className="bg-secondary rounded-xl p-4 text-sm text-muted-foreground">
                <p><strong>Como funciona:</strong> A cada R$ 1 gasto, o cliente ganha {getSetting('loyalty_points_per_real') || '1'} ponto(s). Ao acumular {getSetting('loyalty_points_to_redeem') || '100'} pontos, pode resgatar R$ {getSetting('loyalty_redeem_value') || '5'},00 de desconto.</p>
              </div>
            </div>
          </TabsContent>

          {/* ═══ CASHBACK ═══ */}
          <TabsContent value="cashback" className="space-y-4">
            <h2 className="text-lg font-extrabold text-foreground">💰 Cashback</h2>
            <p className="text-sm text-muted-foreground">Devolva uma porcentagem do valor da compra como crédito para o próximo pedido. Incentiva compras recorrentes.</p>
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div><Label className="font-bold">Cashback ativo</Label><p className="text-xs text-muted-foreground">Devolve % do valor ao cliente</p></div>
                <Switch checked={getSetting('cashback_active') === 'true'} onCheckedChange={(v) => updateSetting('cashback_active', v ? 'true' : 'false')} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Percentual de cashback (%)</Label>
                <Input type="number" value={getSetting('cashback_percent')} onChange={e => updateSetting('cashback_percent', e.target.value)} className="h-11 rounded-xl bg-secondary border-0 max-w-[200px]" />
              </div>
              <div className="bg-secondary rounded-xl p-4 text-sm text-muted-foreground">
                <p><strong>Exemplo:</strong> Com {getSetting('cashback_percent') || '5'}% de cashback, uma compra de R$ 50 gera R$ {((50 * Number(getSetting('cashback_percent') || 5)) / 100).toFixed(2).replace('.', ',')} de crédito para o próximo pedido.</p>
              </div>
            </div>
          </TabsContent>

          {/* ═══ CANAIS DE COMUNICAÇÃO ═══ */}
          <TabsContent value="canais" className="space-y-4">
            <h2 className="text-lg font-extrabold text-foreground">📢 Canais de Marketing</h2>
            <p className="text-sm text-muted-foreground">Configure canais de comunicação para engajar clientes e promover vendas.</p>
            <div className="space-y-4">
              {/* Notifications */}
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Bell className="h-5 w-5 text-primary" /></div>
                  <div>
                    <h3 className="font-bold text-foreground">🔔 Notificações Push</h3>
                    <p className="text-xs text-muted-foreground">Envie alertas diretamente no navegador/celular do cliente</p>
                  </div>
                </div>
                <div className="bg-secondary rounded-xl p-3 text-xs text-muted-foreground space-y-1">
                  <p><strong>Melhores práticas:</strong></p>
                  <p>• Envie no máximo 2-3 notificações por semana</p>
                  <p>• Use títulos curtos e chamativos (ex: "🔥 Happy Hour começou!")</p>
                  <p>• Segmente por histórico de compras</p>
                  <p>• Melhores horários: 11h-12h e 17h-19h</p>
                </div>
              </div>

              {/* SMS */}
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Smartphone className="h-5 w-5 text-primary" /></div>
                  <div>
                    <h3 className="font-bold text-foreground">📲 SMS Marketing</h3>
                    <p className="text-xs text-muted-foreground">Taxa de abertura de 98% — ideal para promoções urgentes</p>
                  </div>
                </div>
                <div className="bg-secondary rounded-xl p-3 text-xs text-muted-foreground space-y-1">
                  <p><strong>Benefícios:</strong> Alta taxa de abertura, entrega imediata, funciona sem internet</p>
                  <p><strong>Quando usar:</strong> Cupons relâmpago, confirmação de pedido, lembrete de Happy Hour</p>
                  <p><strong>Integração:</strong> Configure via Twilio nos conectores para envio automático</p>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><MessageCircle className="h-5 w-5 text-primary" /></div>
                  <div>
                    <h3 className="font-bold text-foreground">💬 WhatsApp Marketing</h3>
                    <p className="text-xs text-muted-foreground">O canal mais popular — seus pedidos já vão por aqui!</p>
                  </div>
                </div>
                <div className="bg-secondary rounded-xl p-3 text-xs text-muted-foreground space-y-1">
                  <p><strong>Estratégias:</strong></p>
                  <p>• Listas de transmissão para promoções semanais</p>
                  <p>• Status do WhatsApp com fotos dos produtos</p>
                  <p>• Catálogo do WhatsApp Business</p>
                  <p>• Mensagens automáticas de boas-vindas e acompanhamento</p>
                  <p>• Grupos VIP para clientes fiéis com ofertas exclusivas</p>
                </div>
              </div>

              {/* Email */}
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Mail className="h-5 w-5 text-primary" /></div>
                  <div>
                    <h3 className="font-bold text-foreground">📧 Email Marketing</h3>
                    <p className="text-xs text-muted-foreground">Ideal para newsletters, cardápio novo e programas de fidelidade</p>
                  </div>
                </div>
                <div className="bg-secondary rounded-xl p-3 text-xs text-muted-foreground space-y-1">
                  <p><strong>Melhores estratégias:</strong></p>
                  <p>• Email de boas-vindas com cupom de primeira compra</p>
                  <p>• Newsletter semanal com novidades do cardápio</p>
                  <p>• Email de aniversário com desconto especial</p>
                  <p>• Recuperação de carrinho abandonado</p>
                  <p>• Pesquisa de satisfação pós-compra</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ═══ Modais ═══ */}
      <CouponModal open={!!editCoupon || newCoupon} coupon={editCoupon} onClose={() => { setEditCoupon(null); setNewCoupon(false); }} onSave={() => { loadAll(); setEditCoupon(null); setNewCoupon(false); }} />
      <ComboModal open={!!editCombo || newCombo} combo={editCombo} onClose={() => { setEditCombo(null); setNewCombo(false); }} onSave={() => { loadAll(); setEditCombo(null); setNewCombo(false); }} />
      <HappyHourModal open={!!editHH || newHH} hh={editHH} onClose={() => { setEditHH(null); setNewHH(false); }} onSave={() => { loadAll(); setEditHH(null); setNewHH(false); }} />
    </div>
  );
};

// ──────────────────────────────────────────
// Coupon Modal
// ──────────────────────────────────────────
const CouponModal = ({ open, coupon, onClose, onSave }: { open: boolean; coupon: Coupon | null; onClose: () => void; onSave: () => void }) => {
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code); setDescription(coupon.description || '');
      setDiscountType(coupon.discount_type); setDiscountValue(String(coupon.discount_value));
      setMinOrder(String(coupon.min_order_value || '')); setMaxUses(coupon.max_uses ? String(coupon.max_uses) : '');
      setExpiresAt(coupon.expires_at ? coupon.expires_at.split('T')[0] : ''); setActive(coupon.active);
    } else {
      setCode(''); setDescription(''); setDiscountType('percentage'); setDiscountValue('');
      setMinOrder(''); setMaxUses(''); setExpiresAt(''); setActive(true);
    }
  }, [coupon, open]);

  const handleSave = async () => {
    if (!code.trim() || !discountValue) { toast.error('Preencha código e valor'); return; }
    setSaving(true);
    const data = {
      code: code.trim().toUpperCase(),
      description: description.trim() || null,
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      min_order_value: minOrder ? parseFloat(minOrder) : 0,
      max_uses: maxUses ? parseInt(maxUses) : null,
      expires_at: expiresAt ? new Date(expiresAt + 'T23:59:59').toISOString() : null,
      active,
    };
    if (coupon) {
      const { error } = await supabase.from('coupons').update(data).eq('id', coupon.id);
      if (error) { toast.error('Erro ao salvar'); setSaving(false); return; }
      toast.success('Cupom atualizado!');
    } else {
      const { error } = await supabase.from('coupons').insert(data as any);
      if (error) { toast.error(error.message.includes('unique') ? 'Código já existe' : 'Erro ao criar'); setSaving(false); return; }
      toast.success('Cupom criado!');
    }
    setSaving(false);
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-0 shadow-2xl">
        <div className="bg-primary px-6 pt-6 pb-4 rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary-foreground text-lg font-extrabold flex items-center gap-2">
              <Ticket className="h-5 w-5" /> {coupon ? 'Editar Cupom' : 'Novo Cupom'}
            </DialogTitle>
          </DialogHeader>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Código *</Label>
            <Input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Ex: PASTEL10" className="h-11 rounded-xl bg-secondary border-0 font-mono font-bold" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Descrição</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: 10% off na primeira compra" className="h-11 rounded-xl bg-secondary border-0" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Tipo de desconto</Label>
              <select className="w-full h-11 rounded-xl bg-secondary border-0 px-3 text-sm" value={discountType} onChange={e => setDiscountType(e.target.value)}>
                <option value="percentage">Percentual (%)</option>
                <option value="fixed">Valor fixo (R$)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Valor *</Label>
              <Input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} placeholder={discountType === 'percentage' ? '10' : '5.00'} className="h-11 rounded-xl bg-secondary border-0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Pedido mínimo (R$)</Label>
              <Input type="number" value={minOrder} onChange={e => setMinOrder(e.target.value)} placeholder="0" className="h-11 rounded-xl bg-secondary border-0" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Máx. usos</Label>
              <Input type="number" value={maxUses} onChange={e => setMaxUses(e.target.value)} placeholder="Ilimitado" className="h-11 rounded-xl bg-secondary border-0" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Expira em</Label>
            <Input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className="h-11 rounded-xl bg-secondary border-0" />
          </div>
          <div className="flex items-center justify-between p-3 bg-card rounded-xl border border-border">
            <Label className="font-bold">Ativo</Label>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl py-5" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1 rounded-xl py-5 font-bold" onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ──────────────────────────────────────────
// Combo Modal
// ──────────────────────────────────────────
const ComboModal = ({ open, combo, onClose, onSave }: { open: boolean; combo: Combo | null; onClose: () => void; onSave: () => void }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [comboPrice, setComboPrice] = useState('');
  const [itemsText, setItemsText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (combo) {
      setName(combo.name); setDescription(combo.description || '');
      setOriginalPrice(String(combo.original_price)); setComboPrice(String(combo.combo_price));
      setItemsText(Array.isArray(combo.items) ? combo.items.map((i: any) => i.product_name || i).join('\n') : '');
    } else {
      setName(''); setDescription(''); setOriginalPrice(''); setComboPrice(''); setItemsText('');
    }
  }, [combo, open]);

  const handleSave = async () => {
    if (!name.trim() || !comboPrice) { toast.error('Preencha nome e preço'); return; }
    setSaving(true);
    const items = itemsText.split('\n').filter(l => l.trim()).map(l => ({ product_name: l.trim() }));
    const data = {
      name: name.trim(), description: description.trim() || null,
      original_price: parseFloat(originalPrice) || 0, combo_price: parseFloat(comboPrice),
      items: items as any, active: true,
    };
    if (combo) {
      const { error } = await supabase.from('combos').update(data).eq('id', combo.id);
      if (error) { toast.error('Erro'); setSaving(false); return; }
      toast.success('Combo atualizado!');
    } else {
      const { error } = await supabase.from('combos').insert(data as any);
      if (error) { toast.error('Erro'); setSaving(false); return; }
      toast.success('Combo criado!');
    }
    setSaving(false); onSave();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-0 shadow-2xl">
        <div className="bg-primary px-6 pt-6 pb-4 rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary-foreground text-lg font-extrabold flex items-center gap-2">
              <Package className="h-5 w-5" /> {combo ? 'Editar Combo' : 'Novo Combo'}
            </DialogTitle>
          </DialogHeader>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Nome *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Combo Família" className="h-11 rounded-xl bg-secondary border-0" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Descrição</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: 2 pastéis + 1 suco" className="h-11 rounded-xl bg-secondary border-0" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Itens do combo (um por linha)</Label>
            <Textarea value={itemsText} onChange={e => setItemsText(e.target.value)} placeholder="Pastel de Carne&#10;Pastel de Queijo&#10;Suco de Laranja" rows={4} className="rounded-xl bg-secondary border-0 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Preço original</Label>
              <Input type="number" step="0.01" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} placeholder="25.00" className="h-11 rounded-xl bg-secondary border-0" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Preço do combo *</Label>
              <Input type="number" step="0.01" value={comboPrice} onChange={e => setComboPrice(e.target.value)} placeholder="19.90" className="h-11 rounded-xl bg-secondary border-0" />
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl py-5" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1 rounded-xl py-5 font-bold" onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ──────────────────────────────────────────
// Happy Hour Modal
// ──────────────────────────────────────────
const HappyHourModal = ({ open, hh, onClose, onSave }: { open: boolean; hh: HappyHour | null; onClose: () => void; onSave: () => void }) => {
  const [name, setName] = useState('Happy Hour');
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('19:00');
  const [discount, setDiscount] = useState('10');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (hh) {
      setName(hh.name); setWeekdays(hh.weekdays);
      setStartTime(hh.start_time.slice(0, 5)); setEndTime(hh.end_time.slice(0, 5));
      setDiscount(String(hh.discount_percent));
    } else {
      setName('Happy Hour'); setWeekdays([1, 2, 3, 4, 5]);
      setStartTime('16:00'); setEndTime('19:00'); setDiscount('10');
    }
  }, [hh, open]);

  const toggleWeekday = (d: number) => {
    setWeekdays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort());
  };

  const handleSave = async () => {
    setSaving(true);
    const data = {
      name: name.trim(), weekdays, start_time: startTime, end_time: endTime,
      discount_percent: parseFloat(discount), active: true,
    };
    if (hh) {
      await supabase.from('happy_hour').update(data).eq('id', hh.id);
      toast.success('Happy Hour atualizado!');
    } else {
      await supabase.from('happy_hour').insert(data as any);
      toast.success('Happy Hour criado!');
    }
    setSaving(false); onSave();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-0 shadow-2xl">
        <div className="bg-primary px-6 pt-6 pb-4 rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary-foreground text-lg font-extrabold flex items-center gap-2">
              <Clock className="h-5 w-5" /> {hh ? 'Editar Happy Hour' : 'Novo Happy Hour'}
            </DialogTitle>
          </DialogHeader>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Nome</Label>
            <Input value={name} onChange={e => setName(e.target.value)} className="h-11 rounded-xl bg-secondary border-0" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Dias da semana</Label>
            <div className="flex gap-1.5">
              {WEEKDAYS.map((label, i) => (
                <button key={i} onClick={() => toggleWeekday(i)}
                  className={cn("h-9 w-9 rounded-lg text-xs font-bold transition-all",
                    weekdays.includes(i) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  )}>
                  {label.slice(0, 1)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Início</Label>
              <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="h-11 rounded-xl bg-secondary border-0" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Fim</Label>
              <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="h-11 rounded-xl bg-secondary border-0" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Desconto (%)</Label>
            <Input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="h-11 rounded-xl bg-secondary border-0 max-w-[120px]" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl py-5" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1 rounded-xl py-5 font-bold" onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DollarSignIcon = () => (
  <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
    <span className="text-xs font-bold text-primary">$</span>
  </div>
);

export default AdminMarketing;
