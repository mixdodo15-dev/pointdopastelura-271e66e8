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

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  active: boolean;
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
        supabase.from('products').select('id, name, price, category, image_url, active').eq('active', true).order('sort_order'),
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
      if (e.key === 'F4') { e.preventDefault(); /* trigger dinheiro checkout via event */ }
      if (e.key === 'F6') { e.preventDefault(); }
      if (e.key === 'F8') { e.preventDefault(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [store]);

  const handleAddProduct = useCallback((p: Product) => {
    store.addItem({ id: p.id, name: p.name, price: p.price, imageUrl: p.image_url || undefined });
  }, [store]);

  const filtered = products.filter(p => {
    const matchCat = !activeCategory || p.category === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando PDV...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-extrabold text-foreground">PDV</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>ESC limpar</span>
          <span>•</span>
          <span>F2 buscar</span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Products area - 65% */}
        <div className="flex-1 lg:w-[65%] flex flex-col p-4 gap-3 overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-3">
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
        <div className="lg:w-[25%] border-t lg:border-t-0 lg:border-l border-border bg-card p-4 flex flex-col overflow-hidden">
          <h2 className="text-sm font-extrabold text-foreground mb-3 flex items-center gap-2">
            🛒 Carrinho <span className="text-xs text-muted-foreground">({store.items.length})</span>
          </h2>
          <div className="flex-1 overflow-hidden">
            <CartPanel />
          </div>
        </div>

        {/* Checkout - 10% */}
        <div className="lg:w-[10%] lg:min-w-[200px] border-t lg:border-t-0 lg:border-l border-border bg-secondary/30 p-4 flex flex-col overflow-y-auto">
          <CheckoutPanel />
        </div>
      </div>
    </div>
  );
};

export default AdminPdv;
