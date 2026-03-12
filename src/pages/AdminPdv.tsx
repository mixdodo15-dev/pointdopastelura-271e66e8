import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Monitor } from 'lucide-react';
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
  const store = usePdvStore();

  // Modal states
  const [flavorModal, setFlavorModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [adicionaisModal, setAdicionaisModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [chocolateModal, setChocolateModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });

  // Auth check
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

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { store.clearCart(); toast.info('Carrinho limpo'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [store]);

  const handleAddProduct = useCallback((p: Product) => {
    // Monte Seu Pastel (has max_flavors and category 'monte')
    if (p.category === 'monte' && p.max_flavors && p.max_flavors > 0) {
      setFlavorModal({ open: true, product: p });
      return;
    }

    // Pastel Especial → show adicionais
    if (p.category === 'especiais') {
      setAdicionaisModal({ open: true, product: p });
      return;
    }

    // Pastel Doce Especial → chocolate flavor selection
    if (p.category === 'doces' && p.name.toLowerCase().includes('especial')) {
      setChocolateModal({ open: true, product: p });
      return;
    }

    // Direct add for other products
    store.addItem({ id: p.id, name: p.name, price: p.price, imageUrl: p.image_url || undefined });
  }, [store]);

  const handleFlavorConfirm = (flavors: string[]) => {
    const p = flavorModal.product;
    if (!p) return;
    const displayName = `${p.name} (${flavors.join(', ')})`;
    store.addItem({ id: p.id, name: displayName, price: p.price, imageUrl: p.image_url || undefined, flavors });
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
          <div className="h-12 w-12 rounded-full border-4 border-[hsl(var(--pdv-red))] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground font-bold">Carregando PDV...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header - Red themed */}
      <header className="bg-[hsl(var(--pdv-red))] px-4 py-2.5 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-white hover:bg-white/20" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Monitor className="h-6 w-6 text-[hsl(var(--pdv-accent))]" />
            <h1 className="text-xl font-extrabold text-white tracking-tight">PDV</h1>
            <span className="text-xs bg-[hsl(var(--pdv-accent))] text-black font-extrabold px-2 py-0.5 rounded-full">CAIXA</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/80 font-bold">
          <span className="bg-white/20 px-2 py-1 rounded-lg">ESC limpar</span>
          <span className="bg-white/20 px-2 py-1 rounded-lg">F2 buscar</span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Products area - 65% */}
        <div className="flex-1 lg:w-[65%] flex flex-col p-3 gap-2 overflow-hidden">
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

          <div className="flex-1 overflow-y-auto">
            <ProductGrid products={filtered} onAdd={handleAddProduct} loading={loading} />
          </div>
        </div>

        {/* Cart - 25% */}
        <div className="lg:w-[25%] border-t lg:border-t-0 lg:border-l-2 border-[hsl(var(--pdv-accent))]/30 bg-card p-3 flex flex-col overflow-hidden">
          <h2 className="text-sm font-extrabold text-[hsl(var(--pdv-red))] mb-2 flex items-center gap-2">
            🛒 Carrinho <span className="text-xs bg-[hsl(var(--pdv-accent))] text-black px-2 py-0.5 rounded-full">{store.items.length}</span>
          </h2>
          <div className="flex-1 overflow-hidden">
            <CartPanel />
          </div>
        </div>

        {/* Checkout - 10% */}
        <div className="lg:w-[10%] lg:min-w-[220px] border-t lg:border-t-0 lg:border-l-2 border-[hsl(var(--pdv-red))]/20 bg-secondary/30 p-3 flex flex-col overflow-y-auto">
          <CheckoutPanel />
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
