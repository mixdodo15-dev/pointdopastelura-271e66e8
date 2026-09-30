import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Bell,
  BellOff,
  Bike,
  CalendarDays,
  CheckCircle2,
  ChefHat,
  Clock3,
  DollarSign,
  Globe,
  Package,
  PackageCheck,
  RefreshCw,
  Truck,
  XCircle,
  type LucideIcon,
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
  table_number: string | null;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface StatusOption {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

interface StatusGroup {
  key: string;
  title: string;
  icon: LucideIcon;
  statuses: string[];
  bg: string;
  text: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'received', label: 'Recebido', icon: Bell, color: 'bg-blue-100 text-blue-700' },
  { value: 'accepted', label: 'Aceito', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700' },
  { value: 'preparing', label: 'Em preparo', icon: ChefHat, color: 'bg-orange-100 text-orange-700' },
  { value: 'ready', label: 'Pronto', icon: PackageCheck, color: 'bg-amber-100 text-amber-800' },
  { value: 'out_for_delivery', label: 'Saiu pra entrega', icon: Truck, color: 'bg-purple-100 text-purple-700' },
  { value: 'pickup', label: 'Pronto para retirar', icon: Package, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'delivered', label: 'Entregue', icon: CheckCircle2, color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Cancelado', icon: XCircle, color: 'bg-red-100 text-red-700' },
];

const STATUS_GROUPS: StatusGroup[] = [
  {
    key: 'received',
    title: 'Recebido',
    icon: Bell,
    statuses: ['received'],
    bg: 'bg-blue-600',
    text: 'text-white',
  },
  {
    key: 'accepted',
    title: 'Aceito',
    icon: CheckCircle2,
    statuses: ['accepted'],
    bg: 'bg-emerald-600',
    text: 'text-white',
  },
  {
    key: 'preparing',
    title: 'Em preparo',
    icon: ChefHat,
    statuses: ['preparing'],
    bg: 'bg-orange-500',
    text: 'text-white',
  },
  {
    key: 'ready',
    title: 'Pronto',
    icon: PackageCheck,
    statuses: ['ready'],
    bg: 'bg-amber-400',
    text: 'text-black',
  },
  {
    key: 'out_for_delivery',
    title: 'Saiu pra entrega',
    icon: Bike,
    statuses: ['out_for_delivery'],
    bg: 'bg-blue-600',
    text: 'text-white',
  },
  {
    key: 'pickup',
    title: 'Pronto para retirar',
    icon: Package,
    statuses: ['pickup'],
    bg: 'bg-[hsl(var(--pdv-accent))]',
    text: 'text-black',
  },
  {
    key: 'closed',
    title: 'Finalizados',
    icon: CheckCircle2,
    statuses: ['delivered', 'cancelled'],
    bg: 'bg-slate-600',
    text: 'text-white',
  },
];

const getDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDateBounds = (dateValue: string) => {
  const [year, month, day] = dateValue.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  const end = new Date(year, month - 1, day + 1);
  return { start, end };
};

const formatSelectedDate = (dateValue: string) => {
  const [year, month, day] = dateValue.split('-').map(Number);
  return new Date(year, month - 1, day, 12).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const formatPrice = (price: number) => `R$ ${Number(price).toFixed(2).replace('.', ',')}`;
const formatOrderNumber = (number: number | null) => `Point-${String(number || 0).padStart(4, '0')}`;
const formatOrderTime = (createdAt: string) =>
  new Date(createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

const AdminMonitorPedidos = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [selectedDate, setSelectedDate] = useState(() => getDateInputValue(new Date()));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [now, setNow] = useState(Date.now());
  const [hasNewOrders, setHasNewOrders] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const lastSeenIdsRef = useRef<Set<string>>(new Set());
  const lastSeenDateRef = useRef<string | null>(null);

  const todayValue = getDateInputValue(new Date());
  const isToday = selectedDate === todayValue;

  const fetchOrders = useCallback(async () => {
    setRefreshing(true);
    const { start, end } = getDateBounds(selectedDate);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', start.toISOString())
      .lt('created_at', end.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Não foi possível carregar os pedidos dessa data');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const incoming = (data || []) as Order[];
    const siteOrders = incoming.filter((order) => order.order_source === 'app' || order.order_source === 'delivery');
    const currentIds = new Set(siteOrders.map((order) => order.id));

    if (lastSeenDateRef.current === selectedDate && isToday && lastSeenIdsRef.current.size > 0) {
      const freshIds = [...currentIds].filter((id) => !lastSeenIdsRef.current.has(id));
      if (freshIds.length > 0) {
        setHasNewOrders(true);
        try {
          const AudioContextConstructor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
          if (AudioContextConstructor) {
            const context = new AudioContextConstructor();
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.frequency.value = 880;
            gain.gain.setValueAtTime(0.2, context.currentTime);
            oscillator.start();
            oscillator.stop(context.currentTime + 0.3);
            oscillator.onended = () => void context.close();
          }
        } catch {
          // Audio notifications can be unavailable until the user interacts with the page.
        }
      }
    } else if (lastSeenDateRef.current !== selectedDate) {
      setHasNewOrders(false);
    }

    lastSeenDateRef.current = selectedDate;
    lastSeenIdsRef.current = currentIds;
    setOrders(incoming);
    setLoading(false);
    setRefreshing(false);
  }, [isToday, selectedDate]);

  useEffect(() => {
    let active = true;
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        navigate('/login');
        setAuthChecked(true);
        return;
      }
      const { data, error } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      if (!active) return;
      if (error || !data) {
        navigate('/');
      } else {
        setAuthorized(true);
      }
      setAuthChecked(true);
    };
    void checkAdmin();
    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!authorized) return;
    void fetchOrders();

    const channel = supabase
      .channel(`admin-monitor-pedidos-${selectedDate}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        void fetchOrders();
      })
      .subscribe();
    const interval = setInterval(() => void fetchOrders(), 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [authorized, fetchOrders, selectedDate]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchItems = async (orderId: string) => {
    if (orderItems[orderId]) return;
    const { data, error } = await supabase.from('order_items').select('*').eq('order_id', orderId);
    if (error) {
      toast.error('Não foi possível carregar os itens do pedido');
      return;
    }
    setOrderItems((previous) => ({ ...previous, [orderId]: (data || []) as OrderItem[] }));
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const previousOrders = orders;
    setUpdatingId(orderId);
    setOrders((previous) => previous.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)));

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus as Database['public']['Enums']['order_status'] })
      .eq('id', orderId);
    setUpdatingId(null);
    if (error) {
      setOrders(previousOrders);
      toast.error('Erro ao atualizar status');
      return;
    }
    toast.success('Status atualizado!');
  };

  const toggleOrder = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }
    setExpandedOrder(orderId);
    void fetchItems(orderId);
  };

  const dismissNewOrders = () => setHasNewOrders(false);
  const changeSelectedDate = (date: string) => {
    setExpandedOrder(null);
    setOrders([]);
    setLoading(true);
    setSelectedDate(date);
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'active') return !['delivered', 'cancelled'].includes(order.status);
    if (filter === 'site') return order.order_source === 'app' || order.order_source === 'delivery';
    if (filter === 'delivered') return order.status === 'delivered';
    if (filter === 'cancelled') return order.status === 'cancelled';
    return true;
  });

  const siteActiveOrders = orders.filter(
    (order) =>
      (order.order_source === 'app' || order.order_source === 'delivery') &&
      !['delivered', 'cancelled'].includes(order.status),
  );
  const dateRevenue = orders
    .filter((order) => order.status !== 'cancelled')
    .reduce((sum, order) => sum + Number(order.total_price), 0);

  const getElapsed = (createdAt: string) => {
    if (!isToday) return formatOrderTime(createdAt);
    const minutes = Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / 60000));
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}min` : ''}`;
  };

  if (!authChecked || (authorized && loading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando pedidos...</p>
      </div>
    );
  }
  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-[hsl(0,0%,96%)]">
      <header className="sticky top-0 z-40 bg-foreground text-background px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-background hover:bg-background/10"
            onClick={() => navigate('/admin')}
            aria-label="Voltar ao painel administrativo"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Pedidos &amp; Monitor
            </h1>
            <p className="text-xs opacity-80">Acompanhamento dos pedidos por etapa e data</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 text-background hover:bg-background/10 text-xs"
          onClick={() => void fetchOrders()}
          disabled={refreshing}
        >
          <RefreshCw className={cn('h-4 w-4 mr-1', refreshing && 'animate-spin')} />
          Atualizar
        </Button>
      </header>

      <main className="max-w-[1800px] mx-auto px-4 py-4 sm:px-6 sm:py-6">
        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label htmlFor="orders-date" className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
              <CalendarDays className="h-4 w-4 text-primary" /> Data dos pedidos
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                id="orders-date"
                type="date"
                value={selectedDate}
                max={todayValue}
                onChange={(event) => changeSelectedDate(event.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-3 text-sm font-semibold text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {!isToday && (
                <Button type="button" variant="outline" size="sm" onClick={() => changeSelectedDate(todayValue)}>
                  Ir para hoje
                </Button>
              )}
            </div>
            <p className="mt-2 text-xs capitalize text-muted-foreground">Exibindo pedidos de {formatSelectedDate(selectedDate)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[360px]">
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <DollarSign className="h-4 w-4" /> Faturamento do dia
              </div>
              <p className="text-lg font-extrabold text-primary">{formatPrice(dateRevenue)}</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Clock3 className="h-4 w-4" /> Pedidos do dia
              </div>
              <p className="text-lg font-extrabold text-foreground">{orders.length}</p>
            </div>
          </div>
        </section>

        {isToday && (
          <button
            type="button"
            onClick={dismissNewOrders}
            className={cn(
              'mt-4 flex w-full items-center justify-between rounded-2xl border p-4 text-left shadow-sm transition-colors',
              hasNewOrders
                ? 'animate-pulse border-red-700 bg-red-600 text-white'
                : siteActiveOrders.length > 0
                  ? 'border-emerald-700 bg-emerald-600 text-white'
                  : 'border-border bg-card text-foreground',
            )}
          >
            <span className="flex items-center gap-3">
              {siteActiveOrders.length > 0 ? <Bell className="h-7 w-7 shrink-0" /> : <BellOff className="h-7 w-7 shrink-0 opacity-60" />}
              <span>
                <span className="block text-base font-extrabold">
                  {siteActiveOrders.length > 0
                    ? `${siteActiveOrders.length} pedido(s) do site em andamento`
                    : 'Nenhum pedido do site em andamento'}
                </span>
                <span className="block text-xs opacity-80">
                  {hasNewOrders ? 'Novo pedido recebido — clique para dispensar o aviso' : 'Atualizado em tempo real'}
                </span>
              </span>
            </span>
            <Globe className="h-5 w-5 shrink-0 opacity-60" />
          </button>
        )}

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2" aria-label="Filtrar pedidos">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'active', label: 'Em andamento' },
            { key: 'site', label: 'Do site' },
            { key: 'delivered', label: 'Entregues' },
            { key: 'cancelled', label: 'Cancelados' },
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setFilter(option.key)}
              className={cn(
                'rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-colors',
                filter === option.key
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-muted-foreground hover:border-primary/50',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <section className="mt-2" aria-label="Monitor de pedidos por status">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-foreground">Monitor de pedidos</h2>
              <p className="text-xs text-muted-foreground">
                {filteredOrders.length} pedido(s) nesta data{isToday ? ' · em tempo real' : ''}
              </p>
            </div>
            {isToday && (
              <div className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 sm:flex">
                <Clock3 className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground">
                  {new Date(now).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-14 text-center">
              <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="font-bold text-foreground">Nenhum pedido encontrado</p>
              <p className="mt-1 text-sm text-muted-foreground">Selecione outra data para consultar pedidos anteriores.</p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-4">
              {STATUS_GROUPS.map((group) => {
                const groupOrders = filteredOrders.filter((order) => group.statuses.includes(order.status));
                const GroupIcon = group.icon;
                return (
                  <section
                    key={group.key}
                    aria-label={`${group.title}: ${groupOrders.length} pedido(s)`}
                    className="flex w-[min(84vw,320px)] shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm xl:min-w-[235px] xl:flex-1"
                  >
                    <div className={cn('flex items-center justify-between px-3 py-3', group.bg)}>
                      <div className={cn('flex items-center gap-2 font-extrabold', group.text)}>
                        <GroupIcon className="h-4 w-4" />
                        <h3 className="text-sm">{group.title}</h3>
                      </div>
                      <span className={cn('flex h-6 min-w-6 items-center justify-center rounded-full bg-white/20 px-2 text-xs font-extrabold', group.text)}>
                        {groupOrders.length}
                      </span>
                    </div>

                    <div className="max-h-[calc(100vh-360px)] min-h-36 space-y-2 overflow-y-auto p-2">
                      {groupOrders.length === 0 ? (
                        <div className="flex min-h-32 flex-col items-center justify-center text-muted-foreground">
                          <GroupIcon className="mb-2 h-9 w-9 opacity-20" />
                          <p className="text-xs font-bold">Nenhum pedido</p>
                        </div>
                      ) : (
                        groupOrders.map((order) => {
                          const statusOption = STATUS_OPTIONS.find((option) => option.value === order.status) || STATUS_OPTIONS[0];
                          const StatusIcon = statusOption.icon;
                          const isExpanded = expandedOrder === order.id;
                          const isSiteOrder = order.order_source === 'app' || order.order_source === 'delivery';

                          return (
                            <article key={order.id} className="rounded-xl border-2 border-border bg-background transition-colors hover:border-primary/40">
                              <button type="button" onClick={() => toggleOrder(order.id)} className="w-full p-3 text-left">
                                <div className="mb-1 flex items-center justify-between gap-2">
                                  <span className="text-sm font-extrabold text-primary">{formatOrderNumber(order.order_number)}</span>
                                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                                    {getElapsed(order.created_at)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <p className="min-w-0 truncate text-sm font-bold text-foreground">{order.customer_name || 'Cliente'}</p>
                                  <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold', statusOption.color)}>
                                    <StatusIcon className="h-3 w-3" /> {statusOption.label}
                                  </span>
                                </div>
                                <div className="mt-1 flex items-center justify-between gap-2">
                                  <p className="truncate text-[10px] font-semibold uppercase text-muted-foreground">
                                    {isSiteOrder ? 'Pedido do site' : order.table_number ? `Mesa ${order.table_number}` : order.order_source || 'Pedido'}
                                  </p>
                                  <span className="text-xs font-extrabold text-primary">{formatPrice(order.total_price)}</span>
                                </div>
                              </button>

                              <div className="px-3 pb-3">
                                <Select
                                  value={order.status}
                                  onValueChange={(status) => void updateStatus(order.id, status)}
                                  disabled={updatingId === order.id}
                                >
                                  <SelectTrigger className="h-8 text-xs font-bold">
                                    <SelectValue placeholder="Alterar status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {STATUS_OPTIONS.map((option) => (
                                      <SelectItem key={option.value} value={option.value} className="text-xs font-semibold">
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {isExpanded && (
                                <div className="space-y-3 border-t border-border px-3 pb-3 pt-3 text-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <span className="text-xs text-muted-foreground">Horário</span>
                                      <p className="font-medium">{formatOrderTime(order.created_at)}</p>
                                    </div>
                                    <div>
                                      <span className="text-xs text-muted-foreground">Telefone</span>
                                      <p className="font-medium">{order.customer_phone || '—'}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <span className="text-xs text-muted-foreground">Pagamento</span>
                                      <p className="font-medium">{order.payment_method || '—'}</p>
                                    </div>
                                    {order.delivery_address && (
                                      <div className="col-span-2">
                                        <span className="text-xs text-muted-foreground">Endereço</span>
                                        <p className="font-medium">{order.delivery_address}</p>
                                      </div>
                                    )}
                                    {order.notes && (
                                      <div className="col-span-2">
                                        <span className="text-xs text-muted-foreground">Observação</span>
                                        <p className="font-medium">{order.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                  {orderItems[order.id] && (
                                    <div className="space-y-1 rounded-xl bg-secondary p-3">
                                      {orderItems[order.id].length === 0 ? (
                                        <p className="text-xs text-muted-foreground">Nenhum item detalhado.</p>
                                      ) : (
                                        orderItems[order.id].map((item) => (
                                          <div key={item.id} className="flex justify-between gap-2 text-xs">
                                            <span>{item.quantity}x {item.product_name}</span>
                                            <span className="font-semibold">{formatPrice(item.unit_price * item.quantity)}</span>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </article>
                          );
                        })
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminMonitorPedidos;
