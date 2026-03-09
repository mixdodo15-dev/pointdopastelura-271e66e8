import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut, MapPin, Phone, Package, Truck, CheckCircle2, Clock, User } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  payment_method: string;
  notes: string | null;
  total_price: number;
  status: string;
  driver_id: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

const formatPrice = (price: number) => `R$ ${Number(price).toFixed(2).replace('.', ',')}`;
const formatTime = (d: string) => new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

const Entregador = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'available' | 'mine'>('available');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      const { data } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'driver' as any });
      if (!data) {
        toast.error('Acesso negado - apenas entregadores');
        navigate('/');
        return;
      }
      setUserId(user.id);
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setOrders(data as unknown as Order[]);
  }, []);

  useEffect(() => {
    if (!loading) fetchOrders();
  }, [loading, fetchOrders]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('driver-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  const fetchItems = async (orderId: string) => {
    if (orderItems[orderId]) return;
    const { data } = await supabase.from('order_items').select('*').eq('order_id', orderId);
    if (data) setOrderItems(prev => ({ ...prev, [orderId]: data as OrderItem[] }));
  };

  const acceptDelivery = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ driver_id: userId, status: 'out_for_delivery' as any })
      .eq('id', orderId);
    if (error) {
      toast.error('Erro ao aceitar entrega');
    } else {
      toast.success('Entrega aceita! 🏍️');
    }
  };

  const markDelivered = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'delivered' as any })
      .eq('id', orderId);
    if (error) {
      toast.error('Erro ao marcar como entregue');
    } else {
      toast.success('Pedido entregue! ✅');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const availableOrders = orders.filter(o =>
    ['accepted', 'preparing'].includes(o.status) && !o.driver_id
  );

  const myOrders = orders.filter(o => o.driver_id === userId);
  const myActiveOrders = myOrders.filter(o => o.status === 'out_for_delivery');
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const myDelivered = myOrders.filter(o => o.status === 'delivered' && new Date(o.updated_at) >= todayStart);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>;
  }

  return (
    <div className="min-h-screen bg-[hsl(0,0%,96%)]">
      {/* Header */}
      <div className="bg-purple-700 text-white px-4 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Truck className="h-6 w-6" />
          <div>
            <h1 className="text-lg font-extrabold" style={{ fontFamily: "'Poppins', sans-serif" }}>Entregador</h1>
            <p className="text-xs opacity-80">Point do Pastel</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="max-w-lg mx-auto px-4 py-4 grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border text-center">
          <p className="text-2xl font-extrabold text-purple-700">{myActiveOrders.length}</p>
          <p className="text-xs text-muted-foreground font-semibold">Em Entrega</p>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border text-center">
          <p className="text-2xl font-extrabold text-green-600">{myDelivered.length}</p>
          <p className="text-xs text-muted-foreground font-semibold">Entregues Hoje</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-lg mx-auto px-4 flex gap-2 mb-4">
        <button
          onClick={() => setTab('available')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
            tab === 'available' ? 'bg-purple-700 text-white' : 'bg-card text-muted-foreground border border-border'
          }`}
        >
          Disponíveis ({availableOrders.length})
        </button>
        <button
          onClick={() => setTab('mine')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
            tab === 'mine' ? 'bg-purple-700 text-white' : 'bg-card text-muted-foreground border border-border'
          }`}
        >
          Minhas Entregas ({myActiveOrders.length})
        </button>
      </div>

      {/* Orders */}
      <div className="max-w-lg mx-auto px-4 space-y-3 pb-8">
        {tab === 'available' && (
          availableOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Nenhum pedido disponível no momento</p>
            </div>
          ) : (
            availableOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                items={orderItems[order.id]}
                onExpand={() => fetchItems(order.id)}
                action={
                  <Button
                    className="w-full rounded-xl py-5 text-sm font-bold gap-2 bg-purple-700 hover:bg-purple-800"
                    onClick={() => acceptDelivery(order.id)}
                  >
                    <Truck className="h-4 w-4" /> Aceitar Entrega
                  </Button>
                }
              />
            ))
          )
        )}

        {tab === 'mine' && (
          myActiveOrders.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Nenhuma entrega ativa</p>
            </div>
          ) : (
            myActiveOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                items={orderItems[order.id]}
                onExpand={() => fetchItems(order.id)}
                action={
                  <Button
                    className="w-full rounded-xl py-5 text-sm font-bold gap-2 bg-green-600 hover:bg-green-700"
                    onClick={() => markDelivered(order.id)}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Marcar como Entregue
                  </Button>
                }
              />
            ))
          )
        )}
      </div>
    </div>
  );
};

const OrderCard = ({
  order,
  items,
  onExpand,
  action,
}: {
  order: Order;
  items?: OrderItem[];
  onExpand: () => void;
  action: React.ReactNode;
}) => {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    if (!expanded) onExpand();
    setExpanded(!expanded);
  };

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
      <button onClick={toggle} className="w-full text-left p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold text-sm text-foreground">#{order.id.slice(0, 8).toUpperCase()}</p>
          <span className="text-primary font-extrabold text-sm">{formatPrice(order.total_price)}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><User className="h-3 w-3" /> {order.customer_name}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatTime(order.created_at)}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          {/* Address */}
          <div className="bg-purple-50 rounded-xl p-3 flex items-start gap-2">
            <MapPin className="h-4 w-4 text-purple-700 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-purple-700">Endereço de Entrega</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{order.delivery_address}</p>
            </div>
          </div>

          {/* Phone */}
          <a
            href={`tel:${order.customer_phone}`}
            className="flex items-center gap-2 bg-secondary rounded-xl p-3 text-sm font-medium text-foreground"
          >
            <Phone className="h-4 w-4 text-primary" />
            {order.customer_phone}
          </a>

          {/* Payment */}
          <div className="text-sm">
            <span className="text-muted-foreground">Pagamento: </span>
            <span className="font-semibold">{order.payment_method}</span>
          </div>

          {order.notes && (
            <div className="text-sm">
              <span className="text-muted-foreground">Obs: </span>
              <span>{order.notes}</span>
            </div>
          )}

          {/* Items */}
          {items && (
            <div className="bg-secondary rounded-xl p-3 space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Itens</p>
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.product_name}</span>
                  <span className="font-semibold">{formatPrice(item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action button */}
          {action}
        </div>
      )}
    </div>
  );
};

export default Entregador;
