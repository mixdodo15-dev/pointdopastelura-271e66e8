import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Wallet, DollarSign, Lock, Unlock } from 'lucide-react';

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

const AdminCaixa = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [currentRegister, setCurrentRegister] = useState<CashRegister | null>(null);
  const [history, setHistory] = useState<CashRegister[]>([]);
  const [openAmount, setOpenAmount] = useState('');
  const [closeAmount, setCloseAmount] = useState('');
  const [todaySales, setTodaySales] = useState(0);

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
    // Current open register
    const { data: open } = await supabase
      .from('cash_register')
      .select('*')
      .eq('status', 'open')
      .eq('user_id', userId)
      .order('opened_at', { ascending: false })
      .limit(1);

    setCurrentRegister(open?.[0] || null);

    // History
    const { data: hist } = await supabase
      .from('cash_register')
      .select('*')
      .eq('user_id', userId)
      .order('opened_at', { ascending: false })
      .limit(10);

    setHistory(hist || []);

    // Today's sales
    const today = new Date().toISOString().split('T')[0];
    const { data: sales } = await supabase
      .from('orders')
      .select('total_price')
      .gte('created_at', today + 'T00:00:00')
      .in('status', ['received', 'accepted', 'preparing', 'out_for_delivery', 'delivered']);

    const total = sales?.reduce((s, o) => s + Number(o.total_price), 0) || 0;
    setTodaySales(total);
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
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-2 flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Wallet className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-extrabold text-foreground">Controle de Caixa</h1>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Status */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            {currentRegister ? (
              <>
                <Unlock className="h-5 w-5 text-green-500" />
                <span className="font-extrabold text-green-600">Caixa Aberto</span>
              </>
            ) : (
              <>
                <Lock className="h-5 w-5 text-destructive" />
                <span className="font-extrabold text-destructive">Caixa Fechado</span>
              </>
            )}
          </div>

          {currentRegister ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/50 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground">Abertura</p>
                  <p className="text-lg font-extrabold">{formatPrice(currentRegister.opening_amount)}</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground">Vendas Hoje</p>
                  <p className="text-lg font-extrabold text-primary">{formatPrice(todaySales)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-muted-foreground block mb-1">Valor em caixa (R$)</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="0,00"
                    value={closeAmount}
                    onChange={e => setCloseAmount(e.target.value)}
                    className="rounded-xl"
                  />
                  <Button className="rounded-xl" onClick={closeRegister}>
                    <Lock className="h-4 w-4 mr-1" /> Fechar Caixa
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm font-bold text-muted-foreground block mb-1">Valor inicial (R$)</label>
              <div className="flex gap-2">
                <Input
                  placeholder="0,00"
                  value={openAmount}
                  onChange={e => setOpenAmount(e.target.value)}
                  className="rounded-xl"
                />
                <Button className="rounded-xl" onClick={openRegister}>
                  <Unlock className="h-4 w-4 mr-1" /> Abrir Caixa
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* History */}
        <div>
          <h2 className="text-sm font-extrabold text-foreground mb-3">Histórico</h2>
          {history.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum registro</p>
          ) : (
            <div className="space-y-2">
              {history.map(r => (
                <div key={r.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold">{new Date(r.opened_at).toLocaleDateString('pt-BR')}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.status === 'open' ? 'bg-green-500/20 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                      {r.status === 'open' ? 'Aberto' : 'Fechado'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div><p className="text-xs text-muted-foreground">Abertura</p><p className="font-bold">{formatPrice(r.opening_amount)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Vendas</p><p className="font-bold">{formatPrice(r.total_sales)}</p></div>
                    <div>
                      <p className="text-xs text-muted-foreground">Diferença</p>
                      <p className={`font-bold ${r.difference > 0 ? 'text-green-600' : r.difference < 0 ? 'text-destructive' : ''}`}>
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
