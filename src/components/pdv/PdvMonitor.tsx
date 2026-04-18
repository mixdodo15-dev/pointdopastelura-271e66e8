import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { ChefHat, Package, CheckCircle2, Clock, Bell } from 'lucide-react';

interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  status: string;
  table_number: string | null;
  created_at: string;
}

const STATUS_GROUPS = [
  {
    key: 'preparing',
    title: 'Em Preparo',
    icon: ChefHat,
    statuses: ['received', 'accepted', 'preparing'],
    bg: 'bg-[hsl(var(--pdv-red))]',
    text: 'text-white',
  },
  {
    key: 'ready',
    title: 'Prontos para Retirar',
    icon: Package,
    statuses: ['out_for_delivery'],
    bg: 'bg-[hsl(var(--pdv-accent))]',
    text: 'text-black',
  },
  {
    key: 'delivered',
    title: 'Entregues',
    icon: CheckCircle2,
    statuses: ['delivered'],
    bg: 'bg-emerald-600',
    text: 'text-white',
  },
];

const formatOrderNumber = (n: number) => `#${String(n).padStart(4, '0')}`;

const PdvMonitor = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [now, setNow] = useState(Date.now());
  const [lastReadyIds, setLastReadyIds] = useState<Set<string>>(new Set());
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, status, table_number, created_at')
        .in('status', ['received', 'accepted', 'preparing', 'out_for_delivery', 'delivered'])
        .order('created_at', { ascending: false })
        .limit(60);
      if (data) setOrders(data as Order[]);
    };
    load();

    const channel = supabase
      .channel('pdv-monitor-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => load())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Detect transitions to "ready" to highlight + beep
  useEffect(() => {
    const readyNow = new Set(
      orders.filter((o) => o.status === 'out_for_delivery').map((o) => o.id),
    );
    const newlyReady = [...readyNow].find((id) => !lastReadyIds.has(id));
    if (newlyReady && lastReadyIds.size > 0) {
      setHighlightId(newlyReady);
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
      setTimeout(() => setHighlightId(null), 4000);
    }
    setLastReadyIds(readyNow);
  }, [orders]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const getElapsed = (createdAt: string) => {
    const minutes = Math.floor((now - new Date(createdAt).getTime()) / 60000);
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h${m > 0 ? ` ${m}min` : ''}`;
  };

  return (
    <div className="min-h-full bg-background p-4 sm:p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[hsl(var(--pdv-red))] flex items-center justify-center shadow-lg">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                Monitor de Pedidos
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Acompanhamento em tempo real
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-foreground">
              {new Date(now).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATUS_GROUPS.map((group) => {
            const groupOrders = orders.filter((o) => group.statuses.includes(o.status));
            const Icon = group.icon;
            return (
              <div
                key={group.key}
                className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col"
              >
                <div className={cn('px-4 py-3 flex items-center justify-between', group.bg)}>
                  <div className={cn('flex items-center gap-2 font-extrabold', group.text)}>
                    <Icon className="h-5 w-5" />
                    <span className="text-base">{group.title}</span>
                  </div>
                  <span
                    className={cn(
                      'h-7 min-w-7 px-2 rounded-full bg-white/20 flex items-center justify-center text-sm font-extrabold',
                      group.text,
                    )}
                  >
                    {groupOrders.length}
                  </span>
                </div>
                <div className="p-3 space-y-2 min-h-[200px] max-h-[calc(100vh-260px)] overflow-y-auto">
                  {groupOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Icon className="h-10 w-10 opacity-20 mb-2" />
                      <p className="text-xs font-bold">Nenhum pedido</p>
                    </div>
                  ) : (
                    groupOrders.map((o) => (
                      <div
                        key={o.id}
                        className={cn(
                          'rounded-xl border-2 p-3 transition-all',
                          highlightId === o.id
                            ? 'border-[hsl(var(--pdv-accent))] bg-[hsl(var(--pdv-accent))]/10 animate-pulse shadow-lg'
                            : 'border-border bg-background hover:border-primary/40',
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-lg font-extrabold text-primary">
                            {formatOrderNumber(o.order_number)}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {getElapsed(o.created_at)}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-foreground line-clamp-1">
                          {o.customer_name || 'Cliente'}
                        </p>
                        {o.table_number && (
                          <p className="text-xs font-semibold text-accent mt-0.5">
                            Mesa {o.table_number}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PdvMonitor;
