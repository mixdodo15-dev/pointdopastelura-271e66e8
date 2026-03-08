import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, CheckCircle2, ChefHat, Truck, XCircle, DollarSign, Clock } from 'lucide-react';
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
  created_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

const STATUS_OPTIONS = [
  { value: 'received', label: 'Recebido', icon: Package, color: 'bg-blue-100 text-blue-700' },
  { value: 'accepted', label: 'Aceito', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700' },
  { value: 'preparing', label: 'Preparando', icon: ChefHat, color: 'bg-orange-100 text-orange-700' },
  { value: 'out_for_delivery', label: 'Em Entrega', icon: Truck, color: 'bg-purple-100 text-purple-700' },
  { value: 'delivered', label: 'Entregue', icon: CheckCircle2, color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Cancelado', icon: XCircle, color: 'bg-red-100 text-red-700' },
];

const formatPrice = (price: number) => `R$ ${Number(price).toFixed(2).replace('.', ',')}`;
const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

const AdminPedidos = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('active');

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      const { data } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      if (!data) { navigate('/'); return; }
      fetchOrders();
    };
    checkAdmin();
  }, [navigate]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setOrders(data as Order[]);
    setLoading(false);
  };

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchItems = async (orderId: string) => {
    if (orderItems[orderId]) return;
    const { data } = await supabase.from('order_items').select('*').eq('order_id', orderId);
    if (data) setOrderItems(prev => ({ ...prev, [orderId]: data as OrderItem[] }));
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus as any })
      .eq('id', orderId);

    if (error) {
      toast.error('Erro ao atualizar status');
    } else {
      toast.success('Status atualizado!');
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

  // Filter orders
  const filteredOrders = orders.filter(o => {
    if (filter === 'active') return !['delivered', 'cancelled'].includes(o.status);
    if (filter === 'delivered') return o.status === 'delivered';
    if (filter === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  // Today's revenue
  const today = new Date().toDateString();
  const todayRevenue = orders
    .filter(o => new Date(o.created_at).toDateString() === today && o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total_price), 0);

  const todayCount = orders.filter(o => new Date(o.created_at).toDateString() === today).length;

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>;
  }

  return (
    <div className="min-h-screen bg-[hsl(0,0%,96%)]">
      {/* Header */}
      <div className="bg-foreground text-background px-4 py-4 flex items-center gap-3 sticky top-0 z-40">
        <Button variant="ghost" size="icon" className="text-background hover:bg-background/10" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-extrabold" style={{ fontFamily: "'Poppins', sans-serif" }}>Pedidos</h1>
      </div>

      {/* Stats */}
      <div className="max-w-2xl mx-auto px-4 py-4 grid grid-cols-2 gap-3">
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
          { key: 'all', label: 'Todos' },
          { key: 'delivered', label: 'Entregues' },
          { key: 'cancelled', label: 'Cancelados' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filter === f.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground border border-border'
            }`}
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
          filteredOrders.map(order => {
            const statusConfig = STATUS_OPTIONS.find(s => s.value === order.status) || STATUS_OPTIONS[0];
            const StatusIcon = statusConfig.icon;
            const isExpanded = expandedOrder === order.id;

            return (
              <div key={order.id} className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                <button onClick={() => toggleOrder(order.id)} className="w-full text-left p-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${statusConfig.color}`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm text-foreground">#{order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground">{order.customer_name} • {formatDate(order.created_at)}</p>
                        </div>
                        <span className="text-primary font-extrabold text-sm">{formatPrice(order.total_price)}</span>
                      </div>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                    {/* Customer info */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground text-xs">Telefone</span><p className="font-medium">{order.customer_phone}</p></div>
                      <div><span className="text-muted-foreground text-xs">Pagamento</span><p className="font-medium">{order.payment_method}</p></div>
                      <div className="col-span-2"><span className="text-muted-foreground text-xs">Endereço</span><p className="font-medium">{order.delivery_address}</p></div>
                      {order.notes && <div className="col-span-2"><span className="text-muted-foreground text-xs">Obs</span><p className="font-medium">{order.notes}</p></div>}
                    </div>

                    {/* Items */}
                    {orderItems[order.id] && (
                      <div className="bg-secondary rounded-xl p-3 space-y-1">
                        {orderItems[order.id].map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.product_name}</span>
                            <span className="font-semibold">{formatPrice(item.unit_price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Status buttons */}
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map(s => (
                        <button
                          key={s.value}
                          onClick={() => updateStatus(order.id, s.value)}
                          disabled={order.status === s.value}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                            order.status === s.value
                              ? `${s.color} ring-2 ring-offset-1 ring-current`
                              : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                          }`}
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
    </div>
  );
};

export default AdminPedidos;
