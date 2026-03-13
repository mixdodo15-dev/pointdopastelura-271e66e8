import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Monitor, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePdvStore } from '@/store/pdvStore';
import ProductGrid from '@/components/pdv/ProductGrid';
import CartPanel from '@/components/pdv/CartPanel';
import CheckoutPanel from '@/components/pdv/CheckoutPanel';
import CategoryFilter from '@/components/pdv/CategoryFilter';
import SearchProduct from '@/components/pdv/SearchProduct';
import OrderTypeSelector from '@/components/pdv/OrderTypeSelector';
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
}

interface Category {
  id: string;
  slug: string;
  label: string;
  icon: string;
}

const AdminPdv = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
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
        supabase.from('products').select('id, name, price, category, image_url, active, max_flavors').eq('active', true).order('sort_order'),
        supabase.from('categories').select('id, slug, label, icon').eq('active', true).order('sort_order'),
      ]);
      if (prodRes.data) setProducts(prodRes.data);
      if (catRes.data) setCategories(catRes.data);
    };
    loadData();
  }, [loading]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { store.clearCart(); toast.info('Carrinho limpo'); }
      if (e.key === 'F11') { e.preventDefault(); toggleFullscreen(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [store]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

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

  const filtered = products.filter(p => {
    const matchCat = !activeCategory || p.category === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
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

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="bg-gradient-to-r from-[hsl(var(--pdv-red))] via-[hsl(0_85%_40%)] to-[hsl(var(--pdv-red))] px-4 py-2 flex items-center justify-between shrink-0 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMNDAgMCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48L3N2Zz4=')] opacity-30" />
        <div className="flex items-center gap-3 relative z-10">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-white/90 hover:bg-white/20 rounded-xl" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[hsl(var(--pdv-accent))] flex items-center justify-center shadow-lg">
              <Monitor className="h-5 w-5 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white tracking-tight leading-none">Ponto de Venda</h1>
              <p className="text-[10px] text-white/60 font-medium">Point do Pastel • Sistema PDV</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-white/70 font-bold">
            <kbd className="bg-white/15 backdrop-blur px-2 py-1 rounded-lg border border-white/10">ESC</kbd>
            <span>limpar</span>
            <kbd className="bg-white/15 backdrop-blur px-2 py-1 rounded-lg border border-white/10 ml-2">F2</kbd>
            <span>buscar</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:bg-white/20 rounded-lg" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Products Panel */}
        <div className="flex-1 lg:w-[62%] flex flex-col overflow-hidden">
          {/* Controls Bar */}
          <div className="p-3 pb-0 space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <SearchProduct value={search} onChange={setSearch} />
              </div>
              <div className="sm:w-auto">
                <OrderTypeSelector
                  current={store.orderType}
                  tableNumber={store.tableNumber}
                  onTypeChange={store.setOrderType}
                  onTableChange={store.setTableNumber}
                />
              </div>
            </div>
            <CategoryFilter categories={categories} active={activeCategory} onSelect={setActiveCategory} />
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-3 pt-2">
            <ProductGrid products={filtered} onAdd={handleAddProduct} loading={loading} />
          </div>
        </div>

        {/* Right Panel - Cart + Checkout */}
        <div className="lg:w-[38%] flex flex-col lg:flex-row border-t lg:border-t-0 lg:border-l border-border/50 overflow-hidden bg-card/50">
          {/* Cart */}
          <div className="flex-1 lg:w-[60%] flex flex-col overflow-hidden border-b lg:border-b-0 lg:border-r border-border/50 p-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                🛒 Carrinho
                {store.items.length > 0 && (
                  <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-extrabold animate-pulse">
                    {store.items.length}
                  </span>
                )}
              </h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <CartPanel />
            </div>
          </div>

          {/* Checkout */}
          <div className="lg:w-[40%] lg:min-w-[240px] p-3 flex flex-col overflow-y-auto bg-secondary/20">
            <CheckoutPanel />
          </div>
        </div>
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
