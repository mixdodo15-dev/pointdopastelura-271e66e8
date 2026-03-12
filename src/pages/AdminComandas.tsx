import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UtensilsCrossed, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Comanda {
  id: string;
  table_number: string;
  customer_name: string;
  total_price: number;
  created_at: string;
  status: string;
  items: { product_name: string; quantity: number; unit_price: number }[];
}

const formatPrice = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const getTimeDiff = (created: string) => {
  const diff = Math.floor((Date.now() - new Date(created).getTime()) / 60000);
  if (diff < 60) return `${diff} min`;
  return `${Math.floor(diff / 60)}h ${diff % 60}min`;
};

const AdminComandas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [comandas, setComandas] = useState<Comanda[]>([]);

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

  const loadComandas = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('id, table_number, customer_name, total_price, created_at, status')
      .not('table_number', 'is', null)
      .in('status', ['received', 'accepted', 'preparing'])
      .order('created_at', { ascending: true });

    if (error) { toast.error('Erro ao carregar comandas'); return; }
    if (!data) return;

    const ids = data.map(o => o.id);
    const { data: items } = await supabase
      .from('order_items')
      .select('order_id, product_name, quantity, unit_price')
      .in('order_id', ids);

    setComandas(data.map(o => ({
      ...o,
      table_number: o.table_number || '',
      items: items?.filter(i => i.order_id === o.id) || [],
    })));
  };

  useEffect(() => {
    if (loading) return;
    loadComandas();
    const interval = setInterval(loadComandas, 15000);
    return () => clearInterval(interval);
  }, [loading]);

  const closeComanda = async (id: string) => {
    const { error } = await supabase.from('orders').update({ status: 'delivered' }).eq('id', id);
    if (error) { toast.error('Erro ao fechar comanda'); return; }
    toast.success('Comanda fechada!');
    loadComandas();
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
        <UtensilsCrossed className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-extrabold text-foreground">Comandas</h1>
      </header>

      <div className="p-4 max-w-5xl mx-auto">
        {comandas.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <UtensilsCrossed className="h-12 w-12 mx-auto mb-2 opacity-40" />
            <p className="font-semibold">Nenhuma comanda aberta</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {comandas.map(c => (
              <div key={c.id} className="bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-extrabold text-primary">Mesa {c.table_number}</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {getTimeDiff(c.created_at)}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{c.customer_name}</p>
                <div className="space-y-1 mb-3">
                  {c.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.product_name}</span>
                      <span className="text-muted-foreground">{formatPrice(item.unit_price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="font-extrabold text-lg text-foreground">{formatPrice(c.total_price)}</span>
                  </div>
                  <Button size="sm" className="rounded-xl" onClick={() => closeComanda(c.id)}>
                    Fechar Conta
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminComandas;
