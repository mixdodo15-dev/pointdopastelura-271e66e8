import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Wallet, DollarSign, Lock, Unlock, TrendingUp,
  CreditCard, Smartphone, Banknote, Clock, Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils';

const formatPrice = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

interface CashRegister {
  id: string;
  opening_amount: number;
  closing_amount: number | null;
  total_sales: number;
  difference: number;
  opened_at: string;
  closed_at: string | null;
  status: string;
}

interface PaymentSummary {
  dinheiro: number;
  pix: number;
  debito: number;
  credito: number;
  cartao: number;
  misto: number;
}

const AdminCaixa = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [currentRegister, setCurrentRegister] = useState<CashRegister | null>(null);
  const [history, setHistory] = useState<CashRegister[]>([]);
  const [openAmount, setOpenAmount] = useState('');
  const [closeAmount, setCloseAmount] = useState('');
  const [todaySales, setTodaySales] = useState(0);
  const [todayOrderCount, setTodayOrderCount] = useState(0);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({
    dinheiro: 0, pix: 0, debito: 0, credito: 0, cartao: 0, misto: 0
  });

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin');
      if (!roles?.length) { toast.error('Acesso negado'); navigate('/login'); return; }
      setUserId(user.id);
      setLoading(false);
    };
    check();
  }, [navigate]);

  const loadData = async () => {
    const { data: open } = await supabase
      .from('cash_register')
      .select('*')
      .eq('status', 'open')
      .eq('user_id', userId)
      .order('opened_at', { ascending: false })
      .limit(1);

    setCurrentRegister(open?.[0] || null);

    const { data: hist } = await supabase
      .from('cash_register')
      .select('*')
      .eq('user_id', userId)
      .order('opened_at', { ascending: false })
      .limit(10);

    setHistory(hist || []);

    // Today's sales with payment breakdown
    const today = new Date().toISOString().split('T')[0];
    const { data: sales } = await supabase
      .from('orders')
      .select('total_price, payment_method')
      .gte('created_at', today + 'T00:00:00')
      .in('status', ['received', 'accepted', 'preparing', 'out_for_delivery', 'delivered']);

    const total = sales?.reduce((s, o) => s + Number(o.total_price), 0) || 0;
    setTodaySales(total);
    setTodayOrderCount(sales?.length || 0);

    // Payment breakdown
    const summary: PaymentSummary = { dinheiro: 0, pix: 0, debito: 0, credito: 0, cartao: 0, misto: 0 };
    sales?.forEach(o => {
      const method = (o.payment_method || '').toLowerCase() as keyof PaymentSummary;
      if (method in summary) {
        summary[method] += Number(o.total_price);
      }
    });
    setPaymentSummary(summary);
  };

  useEffect(() => {
    if (!loading && userId) loadData();
  }, [loading, userId]);

  const openRegister = async () => {
    const amount = parseFloat(openAmount.replace(',', '.'));
    if (isNaN(amount) || amount < 0) { toast.error('Valor inválido'); return; }

    const { error } = await supabase.from('cash_register').insert({
      user_id: userId,
      opening_amount: amount,
      status: 'open',
    });

    if (error) { toast.error('Erro ao abrir caixa'); return; }
    toast.success('Caixa aberto!');
    setOpenAmount('');
    loadData();
  };

  const closeRegister = async () => {
    if (!currentRegister) return;
    const amount = parseFloat(closeAmount.replace(',', '.'));
    if (isNaN(amount) || amount < 0) { toast.error('Valor inválido'); return; }

    const diff = amount - (currentRegister.opening_amount + todaySales);

    const { error } = await supabase
      .from('cash_register')
      .update({
        closing_amount: amount,
        total_sales: todaySales,
        difference: diff,
        closed_at: new Date().toISOString(),
        status: 'closed',
      })
      .eq('id', currentRegister.id);

    if (error) { toast.error('Erro ao fechar caixa'); return; }
    toast.success('Caixa fechado!');
    setCloseAmount('');
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const paymentRows = [
    { icon: <Banknote className="h-4 w-4 text-green-600" />, label: 'Dinheiro', value: paymentSummary.dinheiro },
    { icon: <Smartphone className="h-4 w-4 text-blue-500" />, label: 'PIX', value: paymentSummary.pix },
    { icon: <CreditCard className="h-4 w-4 text-orange-500" />, label: 'Débito', value: paymentSummary.debito },
    { icon: <DollarSign className="h-4 w-4 text-purple-500" />, label: 'Crédito', value: paymentSummary.credito },
    { icon: <CreditCard className="h-4 w-4 text-muted-foreground" />, label: 'Cartão', value: paymentSummary.cartao },
    { icon: <Receipt className="h-4 w-4 text-muted-foreground" />, label: 'Misto', value: paymentSummary.misto },
  ].filter(r => r.value > 0 || ['Dinheiro', 'PIX', 'Débito', 'Crédito'].includes(r.label));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Wallet className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-extrabold text-foreground">Controle de Caixa</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left - Status do Caixa */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-extrabold text-foreground">Status do Caixa</h2>
              <span className={cn(
                "text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider",
                currentRegister
                  ? "bg-green-500/15 text-green-600 border border-green-500/30"
                  : "bg-destructive/15 text-destructive border border-destructive/30"
              )}>
                {currentRegister ? 'Aberto' : 'Fechado'}
              </span>
            </div>

            {currentRegister ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Caixa aberto desde {new Date(currentRegister.opened_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground font-semibold">Saldo Inicial</p>
                    <p className="text-lg font-extrabold text-foreground">{formatPrice(currentRegister.opening_amount)}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground font-semibold">Esperado</p>
                    <p className="text-lg font-extrabold text-primary">{formatPrice(currentRegister.opening_amount + todaySales)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-muted-foreground block mb-2">Valor em caixa (R$)</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="0,00"
                      value={closeAmount}
                      onChange={e => setCloseAmount(e.target.value)}
                      className="rounded-xl text-base"
                      onKeyDown={e => e.key === 'Enter' && closeRegister()}
                    />
                    <Button className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-extrabold px-6" onClick={closeRegister}>
                      <Lock className="h-4 w-4 mr-2" /> Fechar Caixa
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  O caixa está fechado. Informe o saldo inicial para abrir.
                </p>
                <div>
                  <label className="text-sm font-bold text-foreground block mb-2">Saldo Inicial (Troco)</label>
                  <Input
                    placeholder="0.00"
                    value={openAmount}
                    onChange={e => setOpenAmount(e.target.value)}
                    className="rounded-xl text-base mb-3"
                    onKeyDown={e => e.key === 'Enter' && openRegister()}
                  />
                  <Button
                    className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-base shadow-lg"
                    onClick={openRegister}
                  >
                    Abrir Caixa
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right - Sales Summary */}
          <div className="space-y-6">
            {/* Vendas do Dia */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-extrabold text-foreground">Vendas do Dia</h2>
              </div>
              <p className="text-3xl font-extrabold text-foreground mb-1">{formatPrice(todaySales)}</p>
              <p className="text-sm text-muted-foreground">
                Total de {todayOrderCount} pedido{todayOrderCount !== 1 ? 's' : ''} hoje
              </p>
            </div>

            {/* Payment Breakdown */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-extrabold text-foreground mb-4">Formas de Pagamento</h2>
              <div className="space-y-3">
                {paymentRows.map(row => (
                  <div key={row.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {row.icon}
                      <span className="text-sm font-bold text-foreground">{row.label}</span>
                    </div>
                    <span className="text-sm font-extrabold text-foreground">{formatPrice(row.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="mt-8">
          <h2 className="text-lg font-extrabold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Histórico de Caixa
          </h2>
          {history.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-8 text-center">
              <p className="text-muted-foreground">Nenhum registro encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {history.map(r => (
                <div key={r.id} className="bg-card rounded-xl border border-border p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-foreground">
                      {new Date(r.opened_at).toLocaleDateString('pt-BR')}
                    </span>
                    <span className={cn(
                      "text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase",
                      r.status === 'open'
                        ? "bg-green-500/15 text-green-600"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {r.status === 'open' ? 'Aberto' : 'Fechado'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-semibold">Abertura</p>
                      <p className="font-bold">{formatPrice(r.opening_amount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-semibold">Vendas</p>
                      <p className="font-bold">{formatPrice(r.total_sales)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-semibold">Diferença</p>
                      <p className={cn("font-bold", r.difference > 0 ? 'text-green-600' : r.difference < 0 ? 'text-destructive' : '')}>
                        {formatPrice(r.difference)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCaixa;
