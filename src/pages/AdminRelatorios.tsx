import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, TrendingUp, Clock, ShoppingBag, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const formatPrice = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

interface DailySales {
  date: string;
  total: number;
  count: number;
}

interface TopProduct {
  name: string;
  count: number;
  revenue: number;
}

interface HourlySales {
  hour: string;
  total: number;
  count: number;
  avg: number;
}

const AdminRelatorios = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [todaySales, setTodaySales] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [weekSales, setWeekSales] = useState(0);
  const [monthSales, setMonthSales] = useState(0);
  const [avgTicket, setAvgTicket] = useState(0);
  const [dailyChart, setDailyChart] = useState<DailySales[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

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

    const loadReports = async () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // All delivered/completed orders
      const { data: allOrders } = await supabase
        .from('orders')
        .select('total_price, created_at')
        .in('status', ['received', 'accepted', 'preparing', 'out_for_delivery', 'delivered'])
        .gte('created_at', monthAgo)
        .order('created_at');

      if (!allOrders) return;

      const todayOrders = allOrders.filter(o => o.created_at.startsWith(today));
      const weekOrders = allOrders.filter(o => o.created_at >= weekAgo);

      setTodaySales(todayOrders.reduce((s, o) => s + Number(o.total_price), 0));
      setTodayCount(todayOrders.length);
      setWeekSales(weekOrders.reduce((s, o) => s + Number(o.total_price), 0));
      setMonthSales(allOrders.reduce((s, o) => s + Number(o.total_price), 0));
      setAvgTicket(allOrders.length > 0 ? allOrders.reduce((s, o) => s + Number(o.total_price), 0) / allOrders.length : 0);

      // Daily chart (last 7 days)
      const daily: Record<string, DailySales> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        const key = d.toISOString().split('T')[0];
        daily[key] = { date: d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }), total: 0, count: 0 };
      }
      allOrders.forEach(o => {
        const key = o.created_at.split('T')[0];
        if (daily[key]) {
          daily[key].total += Number(o.total_price);
          daily[key].count += 1;
        }
      });
      setDailyChart(Object.values(daily));

      // Top products
      const { data: items } = await supabase
        .from('order_items')
        .select('product_name, quantity, unit_price');

      if (items) {
        const productMap: Record<string, TopProduct> = {};
        items.forEach(i => {
          if (!productMap[i.product_name]) {
            productMap[i.product_name] = { name: i.product_name, count: 0, revenue: 0 };
          }
          productMap[i.product_name].count += i.quantity;
          productMap[i.product_name].revenue += i.quantity * Number(i.unit_price);
        });
        setTopProducts(Object.values(productMap).sort((a, b) => b.count - a.count).slice(0, 10));
      }
    };

    loadReports();
  }, [loading]);

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
        <BarChart3 className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-extrabold text-foreground">Relatórios</h1>
      </header>

      <div className="p-4 max-w-4xl mx-auto space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Vendas Hoje', value: formatPrice(todaySales), sub: `${todayCount} pedidos`, icon: <DollarSignIcon /> },
            { label: 'Semana', value: formatPrice(weekSales), sub: 'últimos 7 dias', icon: <TrendingUp className="h-5 w-5 text-primary" /> },
            { label: 'Mês', value: formatPrice(monthSales), sub: 'mês atual', icon: <BarChart3 className="h-5 w-5 text-primary" /> },
            { label: 'Ticket Médio', value: formatPrice(avgTicket), sub: 'por pedido', icon: <ShoppingBag className="h-5 w-5 text-primary" /> },
          ].map((kpi, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                {kpi.icon}
                <span className="text-xs font-bold text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-xl font-extrabold text-foreground">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h2 className="text-sm font-extrabold mb-4">Vendas por Dia (7 dias)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  formatter={(value: number) => [formatPrice(value), 'Vendas']}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h2 className="text-sm font-extrabold mb-3">Produtos Mais Vendidos</h2>
          {topProducts.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Sem dados</p>
          ) : (
            <div className="space-y-2">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-primary w-6">{i + 1}.</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.count} vendidos • {formatPrice(p.revenue)}</p>
                  </div>
                  <div className="w-24 bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(p.count / topProducts[0].count) * 100}%` }}
                    />
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

const DollarSignIcon = () => (
  <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
    <span className="text-xs font-bold text-primary">$</span>
  </div>
);

export default AdminRelatorios;
