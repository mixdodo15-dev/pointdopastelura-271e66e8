import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, TrendingUp, Clock, ShoppingBag, Truck, Award, TrendingDown, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const formatPrice = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

interface DailySales { date: string; total: number; count: number; }
interface ProductSales { name: string; count: number; revenue: number; }
interface HourlySales { hour: string; total: number; count: number; avg: number; }

interface OrderRow {
  total_price: number;
  created_at: string;
  delivery_fee: number;
  delivery_address: string;
  order_source: string | null;
  user_id: string | null;
}

const AdminRelatorios = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [todaySales, setTodaySales] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [weekSales, setWeekSales] = useState(0);
  const [monthSales, setMonthSales] = useState(0);
  const [monthCount, setMonthCount] = useState(0);
  const [avgTicket, setAvgTicket] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [dailyChart, setDailyChart] = useState<DailySales[]>([]);
  const [allProducts, setAllProducts] = useState<ProductSales[]>([]);
  const [hourlyChart, setHourlyChart] = useState<HourlySales[]>([]);
  const [peakHour, setPeakHour] = useState('');
  const [deliveryTotal, setDeliveryTotal] = useState(0);
  const [deliveryCount, setDeliveryCount] = useState(0);
  const [employeeSales, setEmployeeSales] = useState<{ name: string; count: number; total: number }[]>([]);

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

      const { data: allOrders } = await supabase
        .from('orders')
        .select('total_price, created_at, delivery_fee, delivery_address, order_source, user_id')
        .in('status', ['received', 'accepted', 'preparing', 'out_for_delivery', 'delivered'])
        .gte('created_at', monthAgo)
        .order('created_at');

      if (!allOrders) return;

      const todayOrders = allOrders.filter(o => o.created_at.startsWith(today));
      const weekOrders = allOrders.filter(o => o.created_at >= weekAgo);

      const todayTotal = todayOrders.reduce((s, o) => s + Number(o.total_price), 0);
      const monthTotal = allOrders.reduce((s, o) => s + Number(o.total_price), 0);
      const totalDeliveryFees = allOrders.reduce((s, o) => s + Number(o.delivery_fee || 0), 0);

      setTodaySales(todayTotal);
      setTodayCount(todayOrders.length);
      setWeekSales(weekOrders.reduce((s, o) => s + Number(o.total_price), 0));
      setMonthSales(monthTotal);
      setMonthCount(allOrders.length);
      setAvgTicket(allOrders.length > 0 ? monthTotal / allOrders.length : 0);
      setTotalProfit(monthTotal - totalDeliveryFees);

      // Delivery stats
      const deliveryOrders = allOrders.filter(o => o.delivery_address !== 'RETIRADA NO LOCAL');
      setDeliveryCount(deliveryOrders.length);
      setDeliveryTotal(deliveryOrders.reduce((s, o) => s + Number(o.total_price), 0));

      // Employee sales (by user_id via profiles)
      const userIds = [...new Set(allOrders.filter(o => o.user_id).map(o => o.user_id!))];
      let profileMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, email')
          .in('user_id', userIds);
        if (profiles) {
          profiles.forEach(p => {
            profileMap[p.user_id] = p.display_name || p.email || 'Sem nome';
          });
        }
      }
      const empMap: Record<string, { name: string; count: number; total: number }> = {};
      allOrders.forEach(o => {
        const key = o.user_id || 'anonymous';
        const label = o.user_id ? (profileMap[o.user_id] || 'Funcionário') : 'Pedido anônimo';
        if (!empMap[key]) empMap[key] = { name: label, count: 0, total: 0 };
        empMap[key].count += 1;
        empMap[key].total += Number(o.total_price);
      });
      setEmployeeSales(Object.values(empMap).sort((a, b) => b.total - a.total));

      // Daily chart (last 7 days)
      const daily: Record<string, DailySales> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        const key = d.toISOString().split('T')[0];
        daily[key] = { date: d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }), total: 0, count: 0 };
      }
      allOrders.forEach(o => {
        const key = o.created_at.split('T')[0];
        if (daily[key]) { daily[key].total += Number(o.total_price); daily[key].count += 1; }
      });
      setDailyChart(Object.values(daily));

      // Hourly sales (today)
      const hourly: Record<number, { total: number; count: number }> = {};
      for (let h = 0; h < 24; h++) hourly[h] = { total: 0, count: 0 };
      todayOrders.forEach(o => {
        const h = new Date(o.created_at).getHours();
        hourly[h].total += Number(o.total_price);
        hourly[h].count += 1;
      });
      const hourlyData: HourlySales[] = Object.entries(hourly).map(([h, v]) => ({
        hour: `${String(h).padStart(2, '0')}h`,
        total: v.total, count: v.count,
        avg: v.count > 0 ? v.total / v.count : 0,
      }));
      setHourlyChart(hourlyData);
      const peak = hourlyData.reduce((best, cur) => cur.total > best.total ? cur : best, hourlyData[0]);
      setPeakHour(peak.count > 0 ? peak.hour : '--');

      // All products
      const { data: items } = await supabase
        .from('order_items')
        .select('product_name, quantity, unit_price');
      if (items) {
        const productMap: Record<string, ProductSales> = {};
        items.forEach(i => {
          if (!productMap[i.product_name]) productMap[i.product_name] = { name: i.product_name, count: 0, revenue: 0 };
          productMap[i.product_name].count += i.quantity;
          productMap[i.product_name].revenue += i.quantity * Number(i.unit_price);
        });
        setAllProducts(Object.values(productMap).sort((a, b) => b.count - a.count));
      }
    };

    loadReports();
  }, [loading]);

  const top5 = allProducts.slice(0, 5);
  const bottom5 = allProducts.length > 5 ? [...allProducts].reverse().slice(0, 5) : [...allProducts].reverse();

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
        <h1 className="text-lg font-extrabold text-foreground">Relatórios Detalhados</h1>
      </header>

      <div className="p-4 max-w-4xl mx-auto space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Vendas Hoje', value: formatPrice(todaySales), sub: `${todayCount} pedidos`, icon: <DollarSignIcon /> },
            { label: 'Vendas Mês', value: formatPrice(monthSales), sub: `${monthCount} pedidos`, icon: <BarChart3 className="h-5 w-5 text-primary" /> },
            { label: 'Ticket Médio', value: formatPrice(avgTicket), sub: 'por pedido', icon: <ShoppingBag className="h-5 w-5 text-primary" /> },
            { label: 'Lucro (Mês)', value: formatPrice(totalProfit), sub: 'vendas - taxas entrega', icon: <TrendingUp className="h-5 w-5 text-primary" /> },
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

        {/* Delivery Stats */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h2 className="text-sm font-extrabold flex items-center gap-2 mb-3">
            <Truck className="h-4 w-4 text-primary" /> Vendas via Delivery
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Pedidos Delivery</p>
              <p className="text-2xl font-extrabold text-foreground">{deliveryCount}</p>
            </div>
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Total Delivery</p>
              <p className="text-2xl font-extrabold text-foreground">{formatPrice(deliveryTotal)}</p>
            </div>
          </div>
        </div>

        {/* Daily Chart */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h2 className="text-sm font-extrabold mb-4">Vendas por Dia (7 dias)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(value: number) => [formatPrice(value), 'Vendas']} />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Sales */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Vendas por Horário (Hoje)
            </h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Pico:</span>
              <span className="font-bold text-primary">{peakHour}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Transações</p>
              <p className="text-lg font-extrabold text-foreground">{todayCount}</p>
            </div>
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-extrabold text-foreground">{formatPrice(todaySales)}</p>
            </div>
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Média/Hora</p>
              <p className="text-lg font-extrabold text-foreground">{formatPrice(todayCount > 0 ? todaySales / 24 : 0)}</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyChart.filter(h => parseInt(h.hour) >= 8 && parseInt(h.hour) <= 23)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(value: number, name: string) => name === 'count' ? [value, 'Pedidos'] : [formatPrice(value), 'Vendas']} />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 max-h-48 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-1.5 font-semibold">Horário</th>
                  <th className="text-right py-1.5 font-semibold">Pedidos</th>
                  <th className="text-right py-1.5 font-semibold">Total</th>
                  <th className="text-right py-1.5 font-semibold">Média</th>
                </tr>
              </thead>
              <tbody>
                {hourlyChart.filter(h => h.count > 0).map(h => (
                  <tr key={h.hour} className="border-b border-border/50">
                    <td className="py-1.5 font-bold text-foreground">{h.hour}</td>
                    <td className="text-right text-foreground">{h.count}</td>
                    <td className="text-right font-semibold text-foreground">{formatPrice(h.total)}</td>
                    <td className="text-right text-muted-foreground">{formatPrice(h.avg)}</td>
                  </tr>
                ))}
                {hourlyChart.filter(h => h.count > 0).length === 0 && (
                  <tr><td colSpan={4} className="text-center py-4 text-muted-foreground">Sem vendas hoje</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 5 Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <h2 className="text-sm font-extrabold flex items-center gap-2 mb-3">
              <Award className="h-4 w-4 text-primary" /> 🏆 Top 5 Mais Vendidos
            </h2>
            {top5.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Sem dados</p>
            ) : (
              <div className="space-y-2">
                {top5.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-primary w-6">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.count} un. • {formatPrice(p.revenue)}</p>
                    </div>
                    <div className="w-20 bg-secondary rounded-full h-2 shrink-0">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${(p.count / top5[0].count) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <h2 className="text-sm font-extrabold flex items-center gap-2 mb-3">
              <TrendingDown className="h-4 w-4 text-destructive" /> 📉 Top 5 Menos Vendidos
            </h2>
            {bottom5.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Sem dados</p>
            ) : (
              <div className="space-y-2">
                {bottom5.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-destructive w-6">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.count} un. • {formatPrice(p.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* All Products Sales Table */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h2 className="text-sm font-extrabold mb-3">📋 Vendas por Produto (Todos)</h2>
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 font-semibold">#</th>
                  <th className="text-left py-2 font-semibold">Produto</th>
                  <th className="text-right py-2 font-semibold">Qtd</th>
                  <th className="text-right py-2 font-semibold">Receita</th>
                </tr>
              </thead>
              <tbody>
                {allProducts.map((p, i) => (
                  <tr key={p.name} className="border-b border-border/50">
                    <td className="py-1.5 text-muted-foreground">{i + 1}</td>
                    <td className="py-1.5 font-semibold text-foreground">{p.name}</td>
                    <td className="text-right py-1.5 text-foreground">{p.count}</td>
                    <td className="text-right py-1.5 font-semibold text-foreground">{formatPrice(p.revenue)}</td>
                  </tr>
                ))}
                {allProducts.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-4 text-muted-foreground">Sem dados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Employee Sales */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h2 className="text-sm font-extrabold flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-primary" /> Vendas por Usuário
          </h2>
          {employeeSales.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Sem dados</p>
          ) : (
            <div className="space-y-2">
              {employeeSales.map((e, i) => (
                <div key={i} className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{e.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{e.count} pedidos</p>
                  </div>
                  <span className="text-sm font-extrabold text-foreground">{formatPrice(e.total)}</span>
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
