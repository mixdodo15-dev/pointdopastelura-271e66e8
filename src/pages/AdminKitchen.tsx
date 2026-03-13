import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChefHat, Clock, ArrowRight, Trash2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface OrderItem {
  product_name: string;
  quantity: number;
}

interface KitchenOrder {
  id: string;
  status: string;
  created_at: string;
  order_source: string | null;
  table_number: string | null;
  customer_name: string;
  items: OrderItem[];
}

const STATUS_COLUMNS = [
  { key: 'received', label: 'Novo', color: 'border-yellow-500', bg: 'bg-yellow-500/10' },
  { key: 'accepted', label: 'Aceito', color: 'border-blue-500', bg: 'bg-blue-500/10' },
  { key: 'preparing', label: 'Em Preparo', color: 'border-orange-500', bg: 'bg-orange-500/10' },
  { key: 'out_for_delivery', label: 'Saiu p/ Entrega', color: 'border-purple-500', bg: 'bg-purple-500/10' },
  { key: 'delivered', label: 'Pronto/Entregue', color: 'border-green-500', bg: 'bg-green-500/10' },
];

const NEXT_STATUS: Record<string, string> = {
  received: 'accepted',
  accepted: 'preparing',
  preparing: 'out_for_delivery',
  out_for_delivery: 'delivered',
};

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  pdv: { label: 'PDV', color: 'bg-primary text-primary-foreground' },
  delivery: { label: 'Delivery', color: 'bg-accent text-accent-foreground' },
  app: { label: 'App', color: 'bg-blue-500 text-primary-foreground' },
};

const getTimeDiff = (created: string) => {
  const diff = Math.floor((Date.now() - new Date(created).getTime()) / 60000);
  return diff < 1 ? '<1 min' : `${diff} min`;
};

const AdminKitchen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<KitchenOrder[]>([]);

  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const previousOrderIdsRef = useRef<Set<string>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);

  const playAlertSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      // Play a double beep
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('[KDS] Audio alert failed:', e);
    }
  }, []);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
      const hasAccess = roles?.some(r => r.role === 'admin' || r.role === 'moderator');
      if (!hasAccess) { toast.error('Acesso negado'); navigate('/login'); return; }
      setLoading(false);
    };
    check();
  }, [navigate]);

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('id, status, created_at, order_source, table_number, customer_name')
      .in('status', ['received', 'accepted', 'preparing', 'out_for_delivery', 'delivered'])
      .order('created_at', { ascending: true });

    if (error) { toast.error('Erro ao carregar pedidos'); return; }
    if (!data) return;

    const orderIds = data.map(o => o.id);
    const { data: items } = await supabase
      .from('order_items')
      .select('order_id, product_name, quantity')
      .in('order_id', orderIds);

    const enriched: KitchenOrder[] = data.map(o => ({
      ...o,
      order_source: o.order_source || 'delivery',
      items: items?.filter(i => i.order_id === o.id).map(i => ({
        product_name: i.product_name,
        quantity: i.quantity,
      })) || [],
    }));

    setOrders(enriched);
  };

  useEffect(() => {
    if (loading) return;
    loadOrders();

    // Realtime subscription
    const channel = supabase
      .channel('kds-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        console.log('[KDS:update]', 'order changed');
        loadOrders();
      })
      .subscribe();

    // Refresh every 30s
    const interval = setInterval(loadOrders, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [loading]);

  const moveOrder = async (orderId: string, currentStatus: string) => {
    const nextStatus = NEXT_STATUS[currentStatus];
    if (!nextStatus) return;

    const { error } = await supabase
      .from('orders')
      .update({ status: nextStatus as any })
      .eq('id', orderId);

    if (error) {
      toast.error('Erro ao atualizar');
      return;
    }

    console.log('[KDS:update]', { orderId, from: currentStatus, to: nextStatus });
    toast.success(nextStatus === 'out_for_delivery' ? 'Pedido pronto!' : 'Status atualizado');
    loadOrders();
  };

  const deleteOrder = async (orderId: string) => {
    setDeleting(true);
    await supabase.from('order_items').delete().eq('order_id', orderId);
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    setDeleting(false);
    setDeleteOrderId(null);
    if (error) {
      toast.error('Erro ao excluir pedido');
    } else {
      toast.success('Pedido excluído!');
      loadOrders();
    }
  };

  const clearAllKitchenOrders = async () => {
    setDeleting(true);
    for (const order of orders) {
      await supabase.from('order_items').delete().eq('order_id', order.id);
      await supabase.from('orders').delete().eq('id', order.id);
    }
    setDeleting(false);
    setShowClearDialog(false);
    toast.success('Todos os pedidos da cozinha foram excluídos!');
    loadOrders();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando KDS...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <header className="bg-card border-b border-border px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-extrabold text-foreground">Cozinha (KDS)</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">{orders.length} pedidos ativos</p>
          {orders.length > 0 && (
            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 text-xs" onClick={() => setShowClearDialog(true)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Limpar Tudo
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 p-4 overflow-hidden">
        {STATUS_COLUMNS.map(col => {
          const colOrders = orders.filter(o => o.status === col.key);
          return (
            <div key={col.key} className="flex flex-col overflow-hidden">
              <div className={cn("px-3 py-2 rounded-t-xl border-b-2 font-extrabold text-sm flex justify-between", col.color, col.bg)}>
                <span>{col.label}</span>
                <span className="text-muted-foreground">{colOrders.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 p-2">
                {colOrders.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-8">Nenhum pedido</p>
                )}
                {colOrders.map(order => {
                  const source = SOURCE_LABELS[order.order_source || 'delivery'] || SOURCE_LABELS.delivery;
                  return (
                    <div key={order.id} className="bg-card rounded-xl border border-border p-3 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-foreground text-sm">#{order.id.slice(0, 6).toUpperCase()}</span>
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold", source.color)}>{source.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {getTimeDiff(order.created_at)}
                          </div>
                          <button
                            onClick={() => setDeleteOrderId(order.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {order.table_number && (
                        <p className="text-xs font-bold text-accent mb-1">🪑 Mesa {order.table_number}</p>
                      )}
                      <p className="text-xs text-muted-foreground mb-2">{order.customer_name}</p>

                      <div className="space-y-0.5 mb-3">
                        {order.items.map((item, idx) => (
                          <p key={idx} className="text-sm text-foreground">
                            <span className="font-bold">{item.quantity}x</span> {item.product_name}
                          </p>
                        ))}
                      </div>

                      {NEXT_STATUS[order.status] && (
                        <Button
                          size="sm"
                          className="w-full rounded-xl text-xs font-bold"
                          onClick={() => moveOrder(order.id, order.status)}
                        >
                          {NEXT_STATUS[order.status] === 'out_for_delivery' ? '✅ Pronto' : NEXT_STATUS[order.status] === 'delivered' ? '✅ Entregue' : 'Avançar'}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete single order dialog */}
      <AlertDialog open={!!deleteOrderId} onOpenChange={() => setDeleteOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Excluir Pedido
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteOrderId && deleteOrder(deleteOrderId)}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear all kitchen orders dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Limpar Todos os Pedidos da Cozinha
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir TODOS os {orders.length} pedidos da cozinha? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={clearAllKitchenOrders}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Excluindo...' : 'Limpar Tudo'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminKitchen;
