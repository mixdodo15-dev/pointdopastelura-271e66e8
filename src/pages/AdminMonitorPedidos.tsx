import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  ChefHat,
  Truck,
  XCircle,
  DollarSign,
  Clock,
  Bell,
  BellOff,
  RefreshCw,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  order_number: number | null;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  payment_method: string;
  notes: string | null;
  total_price: number;
  status: string;
  created_at: string;
  order_source: string | null;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

const STATUS_OPTIONS = [
  { value: 'received', label: 'Novo', icon: Package, color: 'bg-blue-100 text-blue-700' },
  { value: 'accepted', label: 'Aceito', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700' },
  { value: 'preparing', label: 'Em Preparo', icon: ChefHat, color: 'bg-orange-100 text-orange-700' },
  { value: 'out_for_delivery', label: 'Saiu p/ Entrega', icon: Truck, color: 'bg-purple-100 text-purple-700' },
  { value: 'delivered', label: 'Pronto', icon: CheckCircle2, color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Cancelado', icon: XCircle, color: 'bg-red-100 text-red-700' },
];

const formatPrice = (price: number) => `R$ ${Number(price).toFixed(2).replace('.', ',')}`;
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

const formatOrderNumber = (n: number | null) => `Point-${String(n || 0).padStart(4, '0')}`;

const AdminMonitorPedidos = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('active');
  const [now, setNow] = useState(Date.now());
  const [lastSeenIds, setLastSeenIds] = useState<Set<string>>(new Set());
  const [hasNewOrders, setHasNewOrders] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      const { data } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      if (!data) {
        navigate('/');
        return;
      }
      fetchOrders();
    };
    checkAdmin();
  }, [navigate]);

  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const incoming = data as Order[];
      setOrders(incoming);

      // Detect new site orders (app/delivery source) since last fetch
      const siteOrders = incoming.filter(
        (o) => o.order_source === 'app' || o.order_source === 'delivery',
      );
      const currentSiteIds = new Set(siteOrders.map((o) => o.id));
      if (lastSeenIds.size > 0) {
        const fresh = [...currentSiteIds].filter((id) => !lastSeenIds.has(id));
        if (fresh.length > 0) {
          setHasNewOrders(true);
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
          } catch {
            // noop
          }
        }
      }
      setLastSeenIds(currentSiteIds);
    }
    setLoading(false);
  }, [lastSeenIds]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-monitor-pedidos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  // Auto-refresh every 30s as a safety net
  useEffect(() => {
    const interval = setInterval(() => fetchOrders(), 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Clock tick
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchItems = async (orderId: string) => {
    if (orderItems[orderId]) return;
    const { data } = await supabase.from('order_items').select('*').eq('order_id', orderId);
    if (data) setOrderItems((prev) => ({ ...prev, [orderId]: data as OrderItem[] }));
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus as any }).eq('id', orderId);
    if (error) {
      toast.error('Erro ao atualizar status');
    } else {
      toast.success('Status atualizado!');
      fetchOrders();
    }
  };

  const toggleOrder = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      fetchItems(orderId);
    }
  };

  const dismissNewOrders = () => setHasNewOrders(false);

  // Site orders (arrive from website) — the Monitor focus
  const siteOrders = orders.filter(
    (o) => o.order_source === 'app' || o.order_source === 'delivery',
  );
  const activeSiteOrders = siteOrders.filter(
    (o) => !['delivered', 'cancelled'].includes(o.status),
  );

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return !['delivered', 'cancelled'].includes(o.status);
    if (filter === 'site') return o.order_source === 'app' || o.order_source === 'delivery';
    if (filter === 'delivered') return o.status === 'delivered';
    if (filter === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  // Today's revenue
  const today = new Date().toDateString();
  const todayRevenue = orders
    .filter((o) => new Date(o.created_at).toDateString() === today && o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total_price), 0);
  const todayCount = orders.filter((o) => new Date(o.created_at).toDateString() === today).length;

  const getElapsed = (createdAt: string) => {
    const minutes = Math.floor((now - new Date(createdAt).getTime()) / 60000);
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h${m > 0 ? ` ${m}min` : ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(0,0%,96%)]">
      {/* Header */}
      <div className="bg-foreground text-background px-4 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-background hover:bg-background/10"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-extrabold" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Pedidos & Monitor
            </h1>
            <p className="text-xs opacity-80">Pedidos do site em tempo real</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-background hover:bg-background/10 text-xs"
            onClick={() => fetchOrders()}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* MONITOR — status de pedidos do site */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <button
          onClick={dismissNewOrders}
          className={cn(
            'w-full rounded-2xl p-5 shadow-sm border transition-all text-left',
            activeSiteOrders.length > 0
              ? hasNewOrders
                ? 'bg-red-600 text-white border-red-700 animate-pulse'
                : 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-card text-foreground border-border',
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeSiteOrders.length > 0 ? (
                <Bell className="h-8 w-8" />
              ) : (
                <BellOff className="h-8 w-8 opacity-60" />
              )}
              <div>
                <p className="text-xl font-extrabold">
                  {activeSiteOrders.length > 0
                    ? `${activeSiteOrders.length} pedido(s) do site ativo(s)`
                    : 'Nenhum pedido do site no momento'}
                </p>
                <p className="text-xs opacity-80">
                  {hasNewOrders
                    ? '🔔 Novo pedido chegou! Clique para ver'
                    : activeSiteOrders.length > 0
                      ? 'Acompanhando em tempo real'
                      : 'Aguardando novos pedidos do site...'}
                </p>
              </div>
            </div>
            <Globe className="h-6 w-6 opacity-60" />
          </div>
        </button>

        {/* Quick monitor cards for active site orders */}
        {activeSiteOrders.length > 0 && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {activeSiteOrders.slice(0, 6).map((o) => {
              const statusConfig = STATUS_OPTIONS.find((s) => s.value === o.status) || STATUS_OPTIONS[0];
              const StatusIcon = statusConfig.icon;
              return (
                <div
                  key={o.id}
                  className="bg-card rounded-xl border border-border p-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-extrabold text-primary">
                      {formatOrderNumber(o.order_number)}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                      {getElapsed(o.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={cn('h-6 w-6 rounded-full flex items-center justify-center', statusConfig.color)}>
                      <StatusIcon className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-xs font-bold text-foreground line-clamp-1">{o.customer_name}</p>
                  </div>
                  <p className="text-xs font-extrabold text-primary mt-1">{formatPrice(o.total_price)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="max-w-2xl mx-auto px-4 grid grid-cols-2 gap-3 pb-2">
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold mb-1">
            <DollarSign className="h-4 w-4" /> Faturamento Hoje
          </div>
          <p className="text-xl font-extrabold text-primary">{formatPrice(todayRevenue)}</p>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold mb-1">
            <Clock className="h-4 w-4" /> Pedidos Hoje
          </div>
          <p className="text-xl font-extrabold text-foreground">{todayCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-2xl mx-auto px-4 flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'active', label: 'Ativos' },
          { key: 'site', label: 'Do Site' },
          { key: 'all', label: 'Todos' },
          { key: 'delivered', label: 'Entregues' },
          { key: 'cancelled', label: 'Cancelados' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all',
              filter === f.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground border border-border',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {filteredOrders.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhum pedido encontrado</p>
        ) : (
          filteredOrders.map((order) => {
            const statusConfig = STATUS_OPTIONS.find((s) => s.value === order.status) || STATUS_OPTIONS[0];
            const StatusIcon = statusConfig.icon;
            const isExpanded = expandedOrder === order.id;
            const isSite = order.order_source === 'app' || order.order_source === 'delivery';

            return (
              <div key={order.id} className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                <button onClick={() => toggleOrder(order.id)} className="w-full text-left p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', statusConfig.color)}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm text-foreground">
                            {formatOrderNumber(order.order_number)}
                            {isSite && (
                              <span className="ml-1.5 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold align-middle">
                                SITE
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.customer_name} • {formatDate(order.created_at)}
                          </p>
                        </div>
                        <span className="text-primary font-extrabold text-sm">{formatPrice(order.total_price)}</span>
                      </div>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground text-xs">Telefone</span>
                        <p className="font-medium">{order.customer_phone}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Pagamento</span>
                        <p className="font-medium">{order.payment_method}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground text-xs">Endereço</span>
                        <p className="font-medium">{order.delivery_address}</p>
                      </div>
                      {order.notes && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground text-xs">Obs</span>
                          <p className="font-medium">{order.notes}</p>
                        </div>
                      )}
                    </div>

                    {orderItems[order.id] && (
                      <div className="bg-secondary rounded-xl p-3 space-y-1">
                        {orderItems[order.id].map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>
                              {item.quantity}x {item.product_name}
                            </span>
                            <span className="font-semibold">{formatPrice(item.unit_price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s.value}
                          onClick={() => updateStatus(order.id, s.value)}
                          disabled={order.status === s.value}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-bold transition-all',
                            order.status === s.value
                              ? `${s.color} ring-2 ring-offset-1 ring-current`
                              : 'bg-secondary text-muted-foreground hover:bg-secondary/80',
                          )}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer button */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <Button className="w-full" onClick={() => fetchOrders()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar Status dos Pedidos
        </Button>
      </div>
    </div>
  );
};

export default AdminMonitorPedidos;
