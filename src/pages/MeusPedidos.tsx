import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Package, Clock, ChefHat, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Order {
  id: string;
  order_number: number | null;
  customer_name: string;
  total_price: number;
  status: string;
  payment_method: string;
  delivery_address: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Package; color: string; step: number }> = {
  received: { label: 'Pedido Recebido', icon: Package, color: 'text-blue-500', step: 1 },
  accepted: { label: 'Pedido Aceito', icon: CheckCircle2, color: 'text-emerald-500', step: 2 },
  preparing: { label: 'Preparando', icon: ChefHat, color: 'text-orange-500', step: 3 },
  out_for_delivery: { label: 'Saiu para Entrega', icon: Truck, color: 'text-purple-500', step: 4 },
  delivered: { label: 'Entregue', icon: CheckCircle2, color: 'text-green-600', step: 5 },
  cancelled: { label: 'Cancelado', icon: XCircle, color: 'text-destructive', step: 0 },
};

const STEPS = ['received', 'accepted', 'preparing', 'out_for_delivery', 'delivered'];

const formatPrice = (price: number) => `R$ ${Number(price).toFixed(2).replace('.', ',')}`;
const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const MeusPedidos = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // Allow both logged in and guest users
      fetchOrders(user);
    };
    checkAuth();
  }, [navigate]);

  const fetchOrders = async (user: any = null) => {
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (user) {
      // Fetch orders for authenticated users
      query = query.eq('user_id', user.id);
    } else {
      // Fetch orders for guest users using localStorage
      const guestOrderIds = JSON.parse(localStorage.getItem('guest-orders') || '[]');
      if (guestOrderIds.length > 0) {
        query = query.in('id', guestOrderIds).is('user_id', null);
      } else {
        // No guest orders found
        setOrders([]);
        setLoading(false);
        return;
      }
    }

    const { data, error } = await query;

    if (!error && data) {
      setOrders(data as Order[]);
      // Auto-expand the latest active order
      const active = data.find((o: any) => !['delivered', 'cancelled'].includes(o.status));
      if (active) setExpandedOrder(active.id);
    }
    setLoading(false);
  };

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('my-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
        const { data: { user } } = await supabase.auth.getUser();
        fetchOrders(user);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchItems = async (orderId: string) => {
    if (orderItems[orderId]) return;
    const { data } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    if (data) {
      setOrderItems(prev => ({ ...prev, [orderId]: data as OrderItem[] }));
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
      <div className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3 sticky top-0 z-40">
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-extrabold" style={{ fontFamily: "'Poppins', sans-serif" }}>Meus Pedidos</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Nenhum pedido ainda</p>
            <Button className="mt-4 rounded-full" onClick={() => navigate('/')}>
              Ver Cardápio
            </Button>
          </div>
        ) : (
          orders.map(order => {
            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.received;
            const StatusIcon = config.icon;
            const isExpanded = expandedOrder === order.id;
            const isActive = !['delivered', 'cancelled'].includes(order.status);

            return (
              <div
                key={order.id}
                className={`bg-card rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${isActive ? 'border-primary/30' : 'border-border'}`}
              >
                {/* Order header */}
                <button
                  onClick={() => toggleOrder(order.id)}
                  className="w-full text-left p-4 flex items-center gap-3"
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-secondary ${config.color}`}>
                    <StatusIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-foreground">
                        Pedido #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <span className="text-primary font-extrabold text-sm">{formatPrice(order.total_price)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
                      <span className="text-[10px] text-muted-foreground">• {formatDate(order.created_at)}</span>
                    </div>
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4">
                    {/* Progress bar */}
                    {order.status !== 'cancelled' && (
                      <div className="flex items-center gap-1">
                        {STEPS.map((step, i) => {
                          const currentStep = STATUS_CONFIG[order.status]?.step || 1;
                          const isCompleted = i + 1 <= currentStep;
                          const isCurrent = i + 1 === currentStep;
                          return (
                            <div key={step} className="flex-1 flex flex-col items-center gap-1">
                              <div className={`h-2 w-full rounded-full transition-all duration-500 ${
                                isCompleted ? 'bg-primary' : 'bg-secondary'
                              } ${isCurrent ? 'animate-pulse' : ''}`} />
                              <span className={`text-[9px] font-medium ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                                {STATUS_CONFIG[step]?.label.split(' ').slice(-1)[0]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Order details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pagamento</span>
                        <span className="font-medium text-foreground">{order.payment_method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Endereço</span>
                        <span className="font-medium text-foreground text-right max-w-[200px]">{order.delivery_address}</span>
                      </div>
                    </div>

                    {/* Items */}
                    {orderItems[order.id] && (
                      <div className="bg-secondary rounded-xl p-3 space-y-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase">Itens</p>
                        {orderItems[order.id].map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-foreground">{item.quantity}x {item.product_name}</span>
                            <span className="font-semibold text-foreground">{formatPrice(item.unit_price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MeusPedidos;
