import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  ShoppingCart, ClipboardList, ChefHat, Wallet, BarChart3,
  Settings, Moon, Sun, LogOut, Search, Store, ShoppingBag, Truck,
  CheckCircle, Printer, MessageCircle, Minus, Plus, Trash2, Image as ImageIcon,
  TrendingUp, FileText, Package, Menu, X, Monitor
} from 'lucide-react';

const AdminPedidos = lazy(() => import('@/pages/AdminPedidos'));
const AdminKitchen = lazy(() => import('@/pages/AdminKitchen'));
const AdminCaixa = lazy(() => import('@/pages/AdminCaixa'));
const AdminRelatorios = lazy(() => import('@/pages/AdminRelatorios'));
const FichaTecnica = lazy(() => import('@/components/pdv/FichaTecnica'));
const Embalagens = lazy(() => import('@/components/pdv/Embalagens'));
const PdvProductEditor = lazy(() => import('@/components/pdv/PdvProductEditor'));
const PdvMonitor = lazy(() => import('@/components/pdv/PdvMonitor'));
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { usePdvStore } from '@/store/pdvStore';
import { cn } from '@/lib/utils';
import { printOrder } from '@/utils/printOrder';
import PdvFlavorModal from '@/components/pdv/PdvFlavorModal';
import PdvAdicionaisModal from '@/components/pdv/PdvAdicionaisModal';
import PdvChocolateModal from '@/components/pdv/PdvChocolateModal';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  active: boolean;
  max_flavors: number | null;
  description: string | null;
}

interface Category {
  id: string;
  slug: string;
  label: string;
  icon: string;
}

type PaymentMethod = 'dinheiro' | 'pix' | 'debito' | 'credito';

const formatPrice = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const AdminPdv = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('monte');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('pdv');
  const [darkMode, setDarkMode] = useState(false);
  const [payment, setPayment] = useState<PaymentMethod>('dinheiro');
  const [notes, setNotes] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mobileView, setMobileView] = useState<'products' | 'cart'>('products');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const store = usePdvStore();

  const [flavorModal, setFlavorModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [adicionaisModal, setAdicionaisModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [chocolateModal, setChocolateModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin');
      if (!roles || roles.length === 0) { toast.error('Acesso negado'); navigate('/login'); return; }
      setLoading(false);
    };
    check();
  }, [navigate]);

  useEffect(() => {
    if (loading) return;
    const loadData = async () => {
      const [prodRes, catRes] = await Promise.all([
        supabase.from('products').select('id, name, price, category, image_url, active, max_flavors, description').eq('active', true).order('sort_order'),
        supabase.from('categories').select('id, slug, label, icon').eq('active', true).order('sort_order'),
      ]);
      if (prodRes.data) setProducts(prodRes.data);
      if (catRes.data) setCategories(catRes.data);
    };
    loadData();
  }, [loading]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const handleAddProduct = useCallback((p: Product) => {
    if (p.category === 'monte' && p.max_flavors && p.max_flavors > 0) {
      setFlavorModal({ open: true, product: p });
      return;
    }
    if (p.category === 'especiais') {
      setAdicionaisModal({ open: true, product: p });
      return;
    }
    if (p.category === 'doces' && p.name.toLowerCase().includes('especial')) {
      setChocolateModal({ open: true, product: p });
      return;
    }
    store.addItem({ id: p.id, name: p.name, price: p.price, imageUrl: p.image_url || undefined });
  }, [store]);

  const handleFlavorConfirm = (flavors: string[]) => {
    const p = flavorModal.product;
    if (!p) return;
    store.addItem({ id: p.id, name: `${p.name} (${flavors.join(', ')})`, price: p.price, imageUrl: p.image_url || undefined, flavors });
    setFlavorModal({ open: false, product: null });
  };

  const handleAdicionaisConfirm = (adicionais: { name: string; price: number }[]) => {
    const p = adicionaisModal.product;
    if (!p) return;
    const extras = adicionais.length > 0 ? ` + ${adicionais.map(a => a.name).join(', ')}` : '';
    store.addItem({ id: p.id, name: `${p.name}${extras}`, price: p.price, imageUrl: p.image_url || undefined, adicionais });
    setAdicionaisModal({ open: false, product: null });
  };

  const handleChocolateConfirm = (flavor: string) => {
    const p = chocolateModal.product;
    if (!p) return;
    store.addItem({ id: p.id, name: `${p.name} (${flavor})`, price: p.price, imageUrl: p.image_url || undefined, flavors: [flavor] });
    setChocolateModal({ open: false, product: null });
  };

  const handleCheckout = async () => {
    if (store.items.length === 0) { toast.error('Carrinho vazio'); return; }
    if (store.orderType === 'mesa' && !store.tableNumber.trim()) { toast.error('Informe o número da mesa'); return; }

    setSubmitting(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      const orderData = {
        customer_name: store.customerName || 'PDV',
        customer_phone: phone,
        delivery_address: store.orderType === 'mesa' ? `Mesa ${store.tableNumber}` : store.orderType === 'delivery' ? 'Delivery' : 'Balcão/Retirada',
        payment_method: payment,
        total_price: store.total,
        delivery_fee: store.deliveryFee,
        status: 'received' as const,
        user_id: user?.user?.id || null,
        order_source: 'pdv',
        table_number: store.orderType === 'mesa' ? store.tableNumber : null,
        notes: notes || (store.discount > 0 ? `Desconto: R$ ${store.discount.toFixed(2)}` : null),
      };

      const { data: order, error } = await supabase.from('orders').insert(orderData).select('id, order_number').single();
      if (error) throw error;

      const itemsInsert = store.items.map(i => ({
        order_id: order.id,
        product_name: i.adicionais && i.adicionais.length > 0
          ? `${i.name} [+${i.adicionais.map(a => a.name).join(', ')}]`
          : i.name,
        quantity: i.quantity,
        unit_price: i.price + (i.adicionais?.reduce((s, a) => s + a.price, 0) || 0),
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(itemsInsert);
      if (itemsErr) throw itemsErr;

      printOrder({
        orderId: order.id,
        orderNumber: order.order_number,
        items: store.items,
        subtotal: store.subtotal,
        discount: store.discount,
        deliveryFee: store.deliveryFee,
        total: store.total,
        paymentMethod: payment,
        orderType: store.orderType,
        tableNumber: store.tableNumber,
        customerName: store.customerName,
      });

      toast.success('✅ Pedido registrado com sucesso!');
      store.clearCart();
      setNotes('');
      setPhone('');
      setMobileView('products');
    } catch (err: any) {
      console.error('[PDV:checkout:error]', err);
      toast.error(err.message || 'Erro ao registrar pedido');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = search ? true : (!activeCategory || p.category === activeCategory);
    return matchCat && matchSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-14 w-14 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-bold text-lg">Carregando PDV...</p>
        </div>
      </div>
    );
  }

  const navTabs = [
    { id: 'pdv', label: 'PDV', icon: <ShoppingCart className="h-4 w-4" /> },
    { id: 'editar-produtos', label: 'Produtos', icon: <Settings className="h-4 w-4" /> },
    { id: 'pedidos', label: 'Pedidos', icon: <ClipboardList className="h-4 w-4" /> },
    { id: 'cozinha', label: 'Cozinha', icon: <ChefHat className="h-4 w-4" /> },
    { id: 'caixa', label: 'Caixa', icon: <Wallet className="h-4 w-4" /> },
    { id: 'relatorios', label: 'Relatório', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'mais-vendidos', label: 'Mais Vendidos', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'ficha-tecnica', label: 'Ficha Técnica', icon: <FileText className="h-4 w-4" /> },
    { id: 'embalagens', label: 'Embalagens', icon: <Package className="h-4 w-4" /> },
  ];

  const paymentMethods: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { value: 'dinheiro', label: 'Dinheiro', icon: <span className="text-sm">💵</span> },
    { value: 'pix', label: 'Pix', icon: <span className="text-sm">📱</span> },
    { value: 'debito', label: 'Débito', icon: <span className="text-sm">💳</span> },
    { value: 'credito', label: 'Crédito', icon: <span className="text-sm">💳</span> },
  ];

  const orderTypes: { value: typeof store.orderType; label: string; icon: React.ReactNode }[] = [
    { value: 'balcao', label: 'Balcão', icon: <Store className="h-3.5 w-3.5" /> },
    { value: 'retirada', label: 'Retirada', icon: <ShoppingBag className="h-3.5 w-3.5" /> },
    { value: 'delivery', label: 'Delivery', icon: <Truck className="h-3.5 w-3.5" /> },
  ];

  // Cart panel content (reused for both desktop sidebar and mobile view)
  const cartContent = (
    <div className="flex-1 flex flex-col overflow-y-auto p-3 sm:p-4 gap-3">
      {/* Customer Info */}
      <Input
        placeholder="Nome do cliente"
        value={store.customerName}
        onChange={e => store.setCustomerName(e.target.value)}
        className="rounded-xl bg-background border h-10 text-sm"
      />
      <Input
        placeholder="Telefone"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        className="rounded-xl bg-background border h-10 text-sm"
      />

      {/* Order Type */}
      <div className="flex gap-1.5">
        {orderTypes.map(t => (
          <button
            key={t.value}
            onClick={() => store.setOrderType(t.value)}
            className={cn(
              "flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition-all flex-1 justify-center",
              store.orderType === t.value
                ? "bg-[hsl(var(--pdv-accent))] text-black font-extrabold border-[hsl(var(--pdv-accent))] shadow-sm"
                : "bg-background text-foreground border-border hover:border-accent/50"
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {store.orderType === 'mesa' && (
        <Input
          placeholder="Nº da mesa"
          value={store.tableNumber}
          onChange={e => store.setTableNumber(e.target.value)}
          className="rounded-xl bg-background border h-9 text-sm"
          autoFocus
        />
      )}

      {store.orderType === 'delivery' && (
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary shrink-0" />
          <Input
            type="number"
            step="0.50"
            min="0"
            placeholder="Taxa de entrega (R$)"
            value={store.deliveryFee > 0 ? store.deliveryFee : ''}
            onChange={e => {
              const val = parseFloat(e.target.value);
              store.setDeliveryFee(isNaN(val) ? 0 : val);
            }}
            className="rounded-xl bg-background border h-9 text-sm"
            autoFocus
          />
        </div>
      )}

      {/* Cart Items */}
      <div className="flex-1 min-h-[80px]">
        {store.items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm py-8">
            Clique em um produto para adicionar
          </div>
        ) : (
          <div className="space-y-2">
            {store.items.map(item => {
              const adicionaisTotal = item.adicionais?.reduce((s, a) => s + a.price, 0) || 0;
              const unitTotal = item.price + adicionaisTotal;
              return (
                <div key={item.id} className="bg-background rounded-xl p-3 border border-border group">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <p className="text-xs font-bold text-foreground leading-tight flex-1">{item.name}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive/60 hover:text-destructive shrink-0 md:opacity-0 md:group-hover:opacity-100"
                      onClick={() => store.removeItem(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  {item.adicionais && item.adicionais.length > 0 && (
                    <p className="text-[10px] text-accent font-semibold mb-1">
                      + {item.adicionais.map(a => a.name).join(', ')}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0 bg-card rounded-lg overflow-hidden border border-border">
                      <button onClick={() => store.decreaseQty(item.id)} className="h-7 w-7 sm:h-6 sm:w-6 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-extrabold w-7 sm:w-6 text-center">{item.quantity}</span>
                      <button onClick={() => store.increaseQty(item.id)} className="h-7 w-7 sm:h-6 sm:w-6 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-sm font-extrabold text-primary">{formatPrice(unitTotal * item.quantity)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Observations */}
      <Textarea
        placeholder="Observações do pedido..."
        value={notes}
        onChange={e => setNotes(e.target.value)}
        className="rounded-xl bg-background border text-sm min-h-[60px] resize-none"
      />

      {/* Payment Methods */}
      <div className="grid grid-cols-4 gap-1.5">
        {paymentMethods.map(pm => (
          <button
            key={pm.value}
            onClick={() => setPayment(pm.value)}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-[10px] sm:text-xs font-bold border transition-all",
              payment === pm.value
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background text-foreground border-border hover:border-primary/50"
            )}
          >
            {pm.icon}
            {pm.label}
          </button>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-1 pt-1 border-t border-border">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatPrice(store.subtotal)}</span>
        </div>
        {store.discount > 0 && (
          <div className="flex justify-between text-sm text-green-600 font-bold">
            <span>Desconto</span>
            <span>-{formatPrice(store.discount)}</span>
          </div>
        )}
        <div className="flex justify-between items-baseline pt-1">
          <span className="text-base font-extrabold text-foreground">Total</span>
          <span className="text-xl font-extrabold text-primary">{formatPrice(store.total)}</span>
        </div>
      </div>

      {/* Actions */}
      <Button
        className="w-full rounded-xl h-12 text-base font-extrabold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
        disabled={submitting || store.items.length === 0}
        onClick={handleCheckout}
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Registrando...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Finalizar Pedido
          </span>
        )}
      </Button>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 rounded-xl text-xs font-bold h-9 border"
          onClick={() => {
            if (store.items.length > 0) {
              printOrder({
                orderId: 'preview',
                items: store.items,
                subtotal: store.subtotal,
                discount: store.discount,
                deliveryFee: store.deliveryFee,
                total: store.total,
                paymentMethod: payment,
                orderType: store.orderType,
                tableNumber: store.tableNumber,
                customerName: store.customerName,
              });
            }
          }}
        >
          <Printer className="h-3.5 w-3.5 mr-1" />
          Imprimir
        </Button>
        <Button
          variant="outline"
          className="flex-1 rounded-xl text-xs font-bold h-9 border"
        >
          <MessageCircle className="h-3.5 w-3.5 mr-1" />
          WhatsApp
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[hsl(var(--pdv-red))] px-3 sm:px-4 py-2.5 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xl sm:text-2xl">🥟</span>
          <h1 className="text-sm sm:text-lg font-extrabold text-white tracking-tight">POINT DO PASTEL</h1>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {navTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-white text-[hsl(var(--pdv-red))] shadow-md"
                  : "text-white/80 hover:bg-white/15 hover:text-white"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Mobile Nav Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-8 w-8 rounded-lg text-white hover:bg-white/15 flex items-center justify-center transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="h-8 w-8 rounded-lg text-white/70 hover:bg-white/15 flex items-center justify-center transition-colors"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="h-8 w-8 rounded-lg text-white/70 hover:bg-white/15 flex items-center justify-center transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[hsl(var(--pdv-red))] border-t border-white/10 px-3 py-2 shrink-0 shadow-lg z-20">
          <div className="grid grid-cols-3 gap-1.5">
            {navTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-[10px] font-bold transition-all",
                  activeTab === tab.id
                    ? "bg-white text-[hsl(var(--pdv-red))] shadow-md"
                    : "text-white/80 hover:bg-white/15"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab !== 'pdv' ? (
          <div className="flex-1 overflow-y-auto">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
            }>
              {activeTab === 'editar-produtos' && <PdvProductEditor />}
              {activeTab === 'pedidos' && <AdminPedidos />}
              {activeTab === 'cozinha' && <AdminKitchen />}
              {activeTab === 'caixa' && <AdminCaixa />}
              {(activeTab === 'relatorios' || activeTab === 'mais-vendidos') && <AdminRelatorios />}
              {activeTab === 'ficha-tecnica' && <FichaTecnica />}
              {activeTab === 'embalagens' && <Embalagens />}
            </Suspense>
          </div>
        ) : (
        <>
          {/* Products Panel - Hidden on mobile when viewing cart */}
          <div className={cn(
            "flex-1 flex flex-col overflow-hidden",
            mobileView === 'cart' && "hidden md:flex"
          )}>
            {/* Search */}
            <div className="p-3 sm:p-4 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produto..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10 rounded-xl bg-card border h-11 text-sm font-medium"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="px-3 sm:px-4 pb-3">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {categories.map(cat => (
                  <button
                    key={cat.slug}
                    onClick={() => setActiveCategory(activeCategory === cat.slug ? '' : cat.slug)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap border transition-all",
                      activeCategory === cat.slug
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-foreground border-border hover:border-primary/50"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto px-3 sm:px-4 pb-20 md:pb-4">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 opacity-30 mb-3" />
                  <p className="font-bold">Nenhum produto encontrado</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  {filtered.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleAddProduct(p)}
                      className={cn(
                        "bg-card rounded-2xl border border-border p-3 sm:p-4 flex flex-col items-center gap-2",
                        "hover:border-primary hover:shadow-lg hover:-translate-y-0.5",
                        "active:scale-95 cursor-pointer text-center transition-all duration-200"
                      )}
                    >
                      {p.image_url ? (
                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl overflow-hidden">
                          <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl bg-accent/10 flex items-center justify-center">
                          <span className="text-2xl sm:text-3xl">🥟</span>
                        </div>
                      )}
                      <div className="w-full space-y-0.5">
                        <p className="text-xs sm:text-sm font-bold text-foreground leading-tight line-clamp-2">{p.name}</p>
                        {p.description && (
                          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                        )}
                        <p className="text-xs sm:text-sm font-extrabold text-primary">{formatPrice(p.price)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart Panel - Desktop sidebar / Mobile full screen */}
          <div className={cn(
            // Desktop: fixed sidebar
            "md:w-[380px] md:shrink-0 md:border-l md:border-border md:flex md:flex-col md:overflow-hidden md:bg-card",
            // Mobile: full screen when cart view is active
            mobileView === 'cart' ? "flex flex-col flex-1 bg-card" : "hidden md:flex"
          )}>
            {/* Comanda Header */}
            <div className="bg-[hsl(var(--pdv-red))] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">📋</span>
                <h2 className="text-base sm:text-lg font-extrabold text-white">Nova Comanda</h2>
              </div>
              {/* Mobile back button */}
              <button
                onClick={() => setMobileView('products')}
                className="md:hidden h-8 px-3 rounded-lg bg-white/15 text-white text-xs font-bold flex items-center gap-1"
              >
                <X className="h-3.5 w-3.5" /> Voltar
              </button>
            </div>

            {cartContent}
          </div>

          {/* Mobile FAB - Show cart button */}
          {mobileView === 'products' && (
            <button
              onClick={() => setMobileView('cart')}
              className={cn(
                "md:hidden fixed bottom-4 right-4 z-30 rounded-2xl shadow-2xl px-5 py-3.5",
                "bg-primary text-primary-foreground font-extrabold text-sm",
                "flex items-center gap-2 active:scale-95 transition-transform"
              )}
            >
              <ShoppingCart className="h-5 w-5" />
              {store.items.length > 0 ? (
                <span>Carrinho ({store.items.length}) • {formatPrice(store.total)}</span>
              ) : (
                <span>Carrinho</span>
              )}
            </button>
          )}
        </>
        )}
      </div>

      {/* Modals */}
      {flavorModal.product && (
        <PdvFlavorModal
          open={flavorModal.open}
          onClose={() => setFlavorModal({ open: false, product: null })}
          maxFlavors={flavorModal.product.max_flavors || 1}
          itemName={flavorModal.product.name}
          price={flavorModal.product.price}
          onConfirm={handleFlavorConfirm}
        />
      )}
      {adicionaisModal.product && (
        <PdvAdicionaisModal
          open={adicionaisModal.open}
          onClose={() => setAdicionaisModal({ open: false, product: null })}
          itemName={adicionaisModal.product.name}
          price={adicionaisModal.product.price}
          onConfirm={handleAdicionaisConfirm}
        />
      )}
      {chocolateModal.product && (
        <PdvChocolateModal
          open={chocolateModal.open}
          onClose={() => setChocolateModal({ open: false, product: null })}
          itemName={chocolateModal.product.name}
          price={chocolateModal.product.price}
          onConfirm={handleChocolateConfirm}
        />
      )}
    </div>
  );
};

export default AdminPdv;
