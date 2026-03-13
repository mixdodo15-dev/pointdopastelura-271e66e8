import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Users, Search, Star, StarOff, ChevronDown, ChevronUp, Phone, MapPin, ShoppingBag, Award, Coins, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Customer {
  id: string;
  user_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  street: string | null;
  number: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  complement: string | null;
  is_favorite: boolean;
  notes: string | null;
  cashback_balance: number;
  cashback_percent: number;
  loyalty_points: number;
  loyalty_tier: string;
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
  created_at: string;
}

interface OrderHistory {
  id: string;
  order_number: number;
  total_price: number;
  status: string;
  created_at: string;
  items: { product_name: string; quantity: number; unit_price: number }[];
}

const formatPrice = (v: number) => `R$ ${Number(v).toFixed(2).replace('.', ',')}`;

const tierColors: Record<string, string> = {
  bronze: 'bg-amber-700/20 text-amber-800 border-amber-700/30',
  prata: 'bg-gray-300/30 text-gray-700 border-gray-400/30',
  ouro: 'bg-yellow-400/20 text-yellow-700 border-yellow-500/30',
  diamante: 'bg-cyan-400/20 text-cyan-700 border-cyan-500/30',
};

const tierLabels: Record<string, string> = {
  bronze: '🥉 Bronze',
  prata: '🥈 Prata',
  ouro: '🥇 Ouro',
  diamante: '💎 Diamante',
};

const AdminClientes = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState(false);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'total_spent' | 'total_orders' | 'created_at'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [filterFavorite, setFilterFavorite] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');
    if (error) { toast.error('Erro ao carregar clientes'); return; }
    setCustomers((data as Customer[]) || []);
  };

  const toggleFavorite = async (customer: Customer) => {
    const { error } = await supabase.from('customers').update({ is_favorite: !customer.is_favorite }).eq('id', customer.id);
    if (error) { toast.error('Erro ao atualizar'); return; }
    setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, is_favorite: !c.is_favorite } : c));
    toast.success(customer.is_favorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
  };

  const deleteCustomer = async (id: string, name: string) => {
    if (!confirm(`Excluir cliente "${name}"? Esta ação é irreversível.`)) return;
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir'); return; }
    setCustomers(prev => prev.filter(c => c.id !== id));
    toast.success('Cliente excluído');
  };

  const loadOrderHistory = async (customer: Customer) => {
    setDetailCustomer(customer);
    setLoadingHistory(true);
    // Try to match by phone in orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, order_number, total_price, status, created_at')
      .eq('customer_phone', customer.phone)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) { toast.error('Erro ao carregar histórico'); setLoadingHistory(false); return; }

    const history: OrderHistory[] = [];
    for (const order of orders || []) {
      const { data: items } = await supabase
        .from('order_items')
        .select('product_name, quantity, unit_price')
        .eq('order_id', order.id);
      history.push({
        ...order,
        items: items || [],
      });
    }
    setOrderHistory(history);
    setLoadingHistory(false);
  };

  // Sorting and filtering
  const filtered = customers
    .filter(c => {
      if (filterFavorite && !c.is_favorite) return false;
      if (!search) return true;
      const s = search.toLowerCase();
      return c.name.toLowerCase().includes(s) || c.phone.includes(s) || (c.email?.toLowerCase().includes(s));
    })
    .sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'total_spent': cmp = a.total_spent - b.total_spent; break;
        case 'total_orders': cmp = a.total_orders - b.total_orders; break;
        case 'created_at': cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break;
      }
      return sortAsc ? cmp : -cmp;
    });

  // Ranking position
  const ranking = [...customers].sort((a, b) => b.total_spent - a.total_spent);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Clientes ({filtered.length})
        </h2>
        <Button size="sm" className="rounded-full" onClick={() => setNewCustomer(true)}>
          <Plus className="h-4 w-4 mr-1" /> Novo Cliente
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, telefone ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-full"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterFavorite ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => setFilterFavorite(!filterFavorite)}
          >
            <Star className="h-4 w-4 mr-1" /> Favoritos
          </Button>
          <select
            className="text-xs border rounded-full px-3 py-1 bg-card"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
          >
            <option value="name">Nome</option>
            <option value="total_spent">Total Gasto</option>
            <option value="total_orders">Nº Pedidos</option>
            <option value="created_at">Data Cadastro</option>
          </select>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSortAsc(!sortAsc)}>
            {sortAsc ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Customer List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((customer, idx) => {
            const rank = ranking.findIndex(c => c.id === customer.id) + 1;
            return (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-card rounded-xl p-4 border shadow-sm"
              >
                <div className="flex items-start gap-3">
                  {/* Ranking Badge */}
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 relative">
                    {rank <= 3 ? (
                      <span className="text-lg">{rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</span>
                    ) : (
                      <span className="text-xs font-bold text-primary">#{rank}</span>
                    )}
                    {customer.is_favorite && (
                      <Star className="absolute -top-1 -right-1 h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm">{customer.name}</p>
                      <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', tierColors[customer.loyalty_tier] || tierColors.bronze)}>
                        {tierLabels[customer.loyalty_tier] || customer.loyalty_tier}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{customer.phone}</span>
                      {customer.neighborhood && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{customer.neighborhood}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs font-medium flex items-center gap-1">
                        <ShoppingBag className="h-3 w-3 text-primary" /> {customer.total_orders} pedidos
                      </span>
                      <span className="text-xs font-medium flex items-center gap-1">
                        <Coins className="h-3 w-3 text-green-600" /> {formatPrice(customer.total_spent)}
                      </span>
                      {customer.loyalty_points > 0 && (
                        <span className="text-xs font-medium flex items-center gap-1">
                          <Award className="h-3 w-3 text-purple-600" /> {customer.loyalty_points} pts
                        </span>
                      )}
                      {customer.cashback_balance > 0 && (
                        <Badge variant="secondary" className="text-[10px]">
                          💰 Cashback: {formatPrice(customer.cashback_balance)}
                        </Badge>
                      )}
                    </div>
                    {customer.notes && (
                      <p className="text-[11px] text-muted-foreground mt-1 italic line-clamp-1">📝 {customer.notes}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleFavorite(customer)}>
                      {customer.is_favorite ? <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" /> : <StarOff className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => loadOrderHistory(customer)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditCustomer(customer)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteCustomer(customer.id, customer.name)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Nenhum cliente encontrado.</p>
        )}
      </div>

      {/* Customer Form Modal */}
      <CustomerFormModal
        open={!!editCustomer || newCustomer}
        customer={editCustomer}
        onClose={() => { setEditCustomer(null); setNewCustomer(false); }}
        onSave={() => { loadCustomers(); setEditCustomer(null); setNewCustomer(false); }}
      />

      {/* Detail Modal */}
      <CustomerDetailModal
        customer={detailCustomer}
        orders={orderHistory}
        loading={loadingHistory}
        ranking={detailCustomer ? ranking.findIndex(c => c.id === detailCustomer.id) + 1 : 0}
        totalCustomers={customers.length}
        onClose={() => { setDetailCustomer(null); setOrderHistory([]); }}
      />
    </>
  );
};

// === Form Modal ===
const CustomerFormModal = ({
  open, customer, onClose, onSave,
}: {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSave: () => void;
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [complement, setComplement] = useState('');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [cashbackPercent, setCashbackPercent] = useState('0');
  const [loyaltyTier, setLoyaltyTier] = useState('bronze');
  const [loyaltyPoints, setLoyaltyPoints] = useState('0');
  const [cashbackBalance, setCashbackBalance] = useState('0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
      setEmail(customer.email || '');
      setStreet(customer.street || '');
      setNumber(customer.number || '');
      setNeighborhood(customer.neighborhood || '');
      setCity(customer.city || '');
      setState(customer.state || 'SP');
      setComplement(customer.complement || '');
      setNotes(customer.notes || '');
      setIsFavorite(customer.is_favorite);
      setCashbackPercent(String(customer.cashback_percent));
      setLoyaltyTier(customer.loyalty_tier);
      setLoyaltyPoints(String(customer.loyalty_points));
      setCashbackBalance(String(customer.cashback_balance));
    } else {
      setName(''); setPhone(''); setEmail(''); setStreet(''); setNumber('');
      setNeighborhood(''); setCity(''); setState('SP'); setComplement('');
      setNotes(''); setIsFavorite(false); setCashbackPercent('0');
      setLoyaltyTier('bronze'); setLoyaltyPoints('0'); setCashbackBalance('0');
    }
  }, [customer, open]);

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) { toast.error('Nome e telefone são obrigatórios'); return; }
    setSaving(true);
    const data = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      street: street.trim() || null,
      number: number.trim() || null,
      neighborhood: neighborhood.trim() || null,
      city: city.trim() || 'Não informado',
      state: state.trim() || 'SP',
      complement: complement.trim() || null,
      notes: notes.trim() || null,
      is_favorite: isFavorite,
      cashback_percent: parseFloat(cashbackPercent) || 0,
      loyalty_tier: loyaltyTier,
      loyalty_points: parseInt(loyaltyPoints) || 0,
      cashback_balance: parseFloat(cashbackBalance) || 0,
    };
    if (customer) {
      const { error } = await supabase.from('customers').update(data).eq('id', customer.id);
      if (error) { toast.error('Erro ao salvar'); setSaving(false); return; }
      toast.success('Cliente atualizado');
    } else {
      const { error } = await supabase.from('customers').insert(data);
      if (error) { toast.error('Erro ao criar cliente'); setSaving(false); return; }
      toast.success('Cliente cadastrado');
    }
    setSaving(false);
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-0 shadow-2xl">
        <div className="bg-primary px-6 pt-6 pb-4 rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary-foreground text-lg font-extrabold flex items-center gap-2">
              <Users className="h-5 w-5" />
              {customer ? 'Editar Cliente' : 'Novo Cliente'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-sm font-semibold">Nome Completo *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do cliente" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Telefone *</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" />
            </div>
          </div>

          {/* Address */}
          <div>
            <Label className="text-sm font-semibold flex items-center gap-1 mb-2"><MapPin className="h-3.5 w-3.5" /> Endereço</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input className="col-span-2" value={street} onChange={e => setStreet(e.target.value)} placeholder="Rua" />
              <Input value={number} onChange={e => setNumber(e.target.value)} placeholder="Nº" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Input value={neighborhood} onChange={e => setNeighborhood(e.target.value)} placeholder="Bairro" />
              <Input value={complement} onChange={e => setComplement(e.target.value)} placeholder="Complemento" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Cidade" />
              <Input value={state} onChange={e => setState(e.target.value)} placeholder="Estado" maxLength={2} />
            </div>
          </div>

          {/* Loyalty & Cashback */}
          <div>
            <Label className="text-sm font-semibold flex items-center gap-1 mb-2"><Award className="h-3.5 w-3.5" /> Fidelidade & Cashback</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Tier</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-card"
                  value={loyaltyTier}
                  onChange={e => setLoyaltyTier(e.target.value)}
                >
                  <option value="bronze">🥉 Bronze</option>
                  <option value="prata">🥈 Prata</option>
                  <option value="ouro">🥇 Ouro</option>
                  <option value="diamante">💎 Diamante</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Pontos Fidelidade</Label>
                <Input type="number" value={loyaltyPoints} onChange={e => setLoyaltyPoints(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Cashback (%)</Label>
                <Input type="number" step="0.5" value={cashbackPercent} onChange={e => setCashbackPercent(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Saldo Cashback (R$)</Label>
                <Input type="number" step="0.01" value={cashbackBalance} onChange={e => setCashbackBalance(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Notes & Favorite */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Observações</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anotações sobre o cliente..." rows={3} />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={isFavorite} onCheckedChange={setIsFavorite} />
            <Label className="text-sm flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500" /> Cliente Favorito</Label>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-full">Cancelar</Button>
          <Button onClick={handleSave} disabled={saving} className="rounded-full">
            {saving ? 'Salvando...' : customer ? 'Salvar' : 'Cadastrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// === Detail Modal ===
const CustomerDetailModal = ({
  customer, orders, loading, ranking, totalCustomers, onClose,
}: {
  customer: Customer | null;
  orders: OrderHistory[];
  loading: boolean;
  ranking: number;
  totalCustomers: number;
  onClose: () => void;
}) => {
  if (!customer) return null;

  const statusLabels: Record<string, string> = {
    received: 'Recebido',
    accepted: 'Aceito',
    preparing: 'Preparando',
    out_for_delivery: 'Saiu p/ Entrega',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
  };

  return (
    <Dialog open={!!customer} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-0 shadow-2xl">
        <div className="bg-primary px-6 pt-6 pb-4 rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary-foreground text-lg font-extrabold flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Detalhes do Cliente
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Summary Cards */}
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              {ranking <= 3 ? (
                <span className="text-2xl">{ranking === 1 ? '🥇' : ranking === 2 ? '🥈' : '🥉'}</span>
              ) : (
                <span className="text-sm font-bold text-primary">#{ranking}</span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg">{customer.name}</h3>
              <p className="text-sm text-muted-foreground">{customer.phone} {customer.email && `• ${customer.email}`}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className={cn('text-xs', tierColors[customer.loyalty_tier] || tierColors.bronze)}>
                  {tierLabels[customer.loyalty_tier] || customer.loyalty_tier}
                </Badge>
                <span className="text-xs text-muted-foreground">Ranking {ranking}/{totalCustomers}</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-primary">{customer.total_orders}</p>
              <p className="text-[10px] text-muted-foreground">Pedidos</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-green-600">{formatPrice(customer.total_spent)}</p>
              <p className="text-[10px] text-muted-foreground">Total Gasto</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-purple-600">{customer.loyalty_points}</p>
              <p className="text-[10px] text-muted-foreground">Pontos</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-amber-600">{formatPrice(customer.cashback_balance)}</p>
              <p className="text-[10px] text-muted-foreground">Cashback</p>
            </div>
          </div>

          {/* Address */}
          {customer.street && (
            <div className="bg-secondary/30 rounded-lg p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> Endereço</p>
              <p className="text-sm">
                {customer.street}, {customer.number}
                {customer.complement && ` - ${customer.complement}`}
                <br />
                {customer.neighborhood && `${customer.neighborhood} - `}{customer.city}/{customer.state}
              </p>
            </div>
          )}

          {/* Notes */}
          {customer.notes && (
            <div className="bg-secondary/30 rounded-lg p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1">📝 Observações</p>
              <p className="text-sm">{customer.notes}</p>
            </div>
          )}

          {/* Order History */}
          <div>
            <h4 className="font-bold text-sm mb-2 flex items-center gap-1">
              <ShoppingBag className="h-4 w-4 text-primary" /> Histórico de Pedidos
            </h4>
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum pedido encontrado.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {orders.map(order => (
                  <div key={order.id} className="bg-card border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold">Pedido #{String(order.order_number).padStart(4, '0')}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('pt-BR')} às {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{formatPrice(order.total_price)}</p>
                        <Badge variant="outline" className="text-[10px]">{statusLabels[order.status] || order.status}</Badge>
                      </div>
                    </div>
                    {order.items.length > 0 && (
                      <div className="mt-2 space-y-0.5">
                        {order.items.map((item, i) => (
                          <p key={i} className="text-[11px] text-muted-foreground">
                            {item.quantity}x {item.product_name} — {formatPrice(item.unit_price)}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={onClose} className="rounded-full w-full">Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminClientes;
