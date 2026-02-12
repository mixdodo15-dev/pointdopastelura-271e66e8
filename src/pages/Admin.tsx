import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, LogOut, ArrowLeft, Package, IceCream, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  subcategory: string | null;
  max_flavors: number | null;
  image_url: string | null;
  active: boolean;
  sort_order: number;
}

interface Flavor {
  id: string;
  name: string;
  type: string;
  active: boolean;
}

const CATEGORIES = [
  { id: 'monte', label: 'Monte Seu Pastel', icon: '🥟' },
  { id: 'especiais', label: 'Pastel Especial', icon: '⭐' },
  { id: 'doces', label: 'Pastel Doce', icon: '🍫' },
  { id: 'bebidas', label: 'Bebidas', icon: '🥤' },
  { id: 'adicionais', label: 'Adicionais', icon: '➕' },
];

const formatPrice = (price: number) => `R$ ${Number(price).toFixed(2).replace('.', ',')}`;

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'flavors'>('products');
  const [activeCategory, setActiveCategory] = useState('monte');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState(false);
  const [editFlavor, setEditFlavor] = useState<Flavor | null>(null);
  const [newFlavor, setNewFlavor] = useState(false);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');

      if (!roles || roles.length === 0) {
        toast.error('Acesso negado');
        navigate('/login');
        return;
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  // Load data
  useEffect(() => {
    if (loading) return;
    loadProducts();
    loadFlavors();
  }, [loading]);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('sort_order');
    if (error) { toast.error('Erro ao carregar produtos'); return; }
    setProducts(data || []);
  };

  const loadFlavors = async () => {
    const { data, error } = await supabase
      .from('flavors')
      .select('*')
      .order('name');
    if (error) { toast.error('Erro ao carregar sabores'); return; }
    setFlavors(data || []);
  };

  const toggleProductActive = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ active: !product.active })
      .eq('id', product.id);
    if (error) { toast.error('Erro ao atualizar'); return; }
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, active: !p.active } : p));
    toast.success(product.active ? 'Produto desativado' : 'Produto ativado');
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir'); return; }
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Produto excluído');
  };

  const toggleFlavorActive = async (flavor: Flavor) => {
    const { error } = await supabase
      .from('flavors')
      .update({ active: !flavor.active })
      .eq('id', flavor.id);
    if (error) { toast.error('Erro ao atualizar'); return; }
    setFlavors(prev => prev.map(f => f.id === flavor.id ? { ...f, active: !f.active } : f));
    toast.success(flavor.active ? 'Sabor desativado' : 'Sabor ativado');
  };

  const deleteFlavor = async (id: string) => {
    const { error } = await supabase.from('flavors').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir'); return; }
    setFlavors(prev => prev.filter(f => f.id !== id));
    toast.success('Sabor excluído');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const filteredProducts = products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-3 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="hover:opacity-80">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-extrabold">Painel Admin</h1>
              <p className="text-xs opacity-80">Point do Pastel</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" /> Sair
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === 'products' ? 'default' : 'outline'}
            className="rounded-full"
            onClick={() => setActiveTab('products')}
          >
            <Package className="h-4 w-4 mr-1" /> Produtos
          </Button>
          <Button
            variant={activeTab === 'flavors' ? 'default' : 'outline'}
            className="rounded-full"
            onClick={() => setActiveTab('flavors')}
          >
            <IceCream className="h-4 w-4 mr-1" /> Sabores
          </Button>
        </div>

        {activeTab === 'products' && (
          <>
            {/* Category filter */}
            <div className="flex overflow-x-auto gap-1 mb-4 pb-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all",
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:border-primary"
                  )}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold">{CATEGORIES.find(c => c.id === activeCategory)?.label}</h2>
              <Button size="sm" className="rounded-full" onClick={() => setNewProduct(true)}>
                <Plus className="h-4 w-4 mr-1" /> Novo Produto
              </Button>
            </div>

            <div className="space-y-2">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className={cn(
                    "bg-card rounded-lg p-4 border flex items-center gap-3 transition-opacity",
                    !product.active && "opacity-50"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-muted-foreground truncate">{product.description}</p>
                    )}
                    <p className="text-sm font-bold text-primary">{formatPrice(product.price)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={product.active}
                      onCheckedChange={() => toggleProductActive(product)}
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditProduct(product)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteProduct(product.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Nenhum produto nesta categoria.</p>
              )}
            </div>
          </>
        )}

        {activeTab === 'flavors' && (
          <>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold">Sabores de Pastel</h2>
              <Button size="sm" className="rounded-full" onClick={() => setNewFlavor(true)}>
                <Plus className="h-4 w-4 mr-1" /> Novo Sabor
              </Button>
            </div>

            {['salgado', 'doce'].map(type => (
              <div key={type} className="mb-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase mb-2">
                  {type === 'salgado' ? '🥩 Salgados' : '🍬 Doces'}
                </h3>
                <div className="space-y-2">
                  {flavors.filter(f => f.type === type).map(flavor => (
                    <div
                      key={flavor.id}
                      className={cn(
                        "bg-card rounded-lg p-3 border flex items-center gap-3 transition-opacity",
                        !flavor.active && "opacity-50"
                      )}
                    >
                      <span className="flex-1 font-medium text-sm">{flavor.name}</span>
                      <Switch
                        checked={flavor.active}
                        onCheckedChange={() => toggleFlavorActive(flavor)}
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditFlavor(flavor)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteFlavor(flavor.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Product Edit/Create Modal */}
      <ProductModal
        open={!!editProduct || newProduct}
        product={editProduct}
        defaultCategory={activeCategory}
        onClose={() => { setEditProduct(null); setNewProduct(false); }}
        onSave={() => { loadProducts(); setEditProduct(null); setNewProduct(false); }}
      />

      {/* Flavor Edit/Create Modal */}
      <FlavorEditModal
        open={!!editFlavor || newFlavor}
        flavor={editFlavor}
        onClose={() => { setEditFlavor(null); setNewFlavor(false); }}
        onSave={() => { loadFlavors(); setEditFlavor(null); setNewFlavor(false); }}
      />
    </div>
  );
};

// Product Modal
const ProductModal = ({
  open, product, defaultCategory, onClose, onSave,
}: {
  open: boolean;
  product: Product | null;
  defaultCategory: string;
  onClose: () => void;
  onSave: () => void;
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('monte');
  const [subcategory, setSubcategory] = useState('');
  const [maxFlavors, setMaxFlavors] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || '');
      setPrice(String(product.price));
      setCategory(product.category);
      setSubcategory(product.subcategory || '');
      setMaxFlavors(product.max_flavors ? String(product.max_flavors) : '');
      setSortOrder(String(product.sort_order));
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setCategory(defaultCategory);
      setSubcategory('');
      setMaxFlavors('');
      setSortOrder('0');
    }
  }, [product, defaultCategory, open]);

  const handleSave = async () => {
    if (!name.trim() || !price) { toast.error('Preencha nome e preço'); return; }
    setSaving(true);

    const data = {
      name: name.trim(),
      description: description.trim() || null,
      price: parseFloat(price),
      category,
      subcategory: subcategory.trim() || null,
      max_flavors: maxFlavors ? parseInt(maxFlavors) : null,
      sort_order: parseInt(sortOrder) || 0,
    };

    if (product) {
      const { error } = await supabase.from('products').update(data).eq('id', product.id);
      if (error) { toast.error('Erro ao salvar'); setSaving(false); return; }
      toast.success('Produto atualizado');
    } else {
      const { error } = await supabase.from('products').insert(data);
      if (error) { toast.error('Erro ao criar'); setSaving(false); return; }
      toast.success('Produto criado');
    }

    setSaving(false);
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Nome *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do produto" />
          </div>
          <div className="space-y-1">
            <Label>Descrição</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Preço *</Label>
              <Input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-1">
              <Label>Categoria</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Subcategoria</Label>
              <Input value={subcategory} onChange={e => setSubcategory(e.target.value)} placeholder="ex: Refrigerante Lata" />
            </div>
            <div className="space-y-1">
              <Label>Máx. Sabores</Label>
              <Input type="number" value={maxFlavors} onChange={e => setMaxFlavors(e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Ordem</Label>
            <Input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} placeholder="0" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Flavor Modal
const FlavorEditModal = ({
  open, flavor, onClose, onSave,
}: {
  open: boolean;
  flavor: Flavor | null;
  onClose: () => void;
  onSave: () => void;
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('salgado');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (flavor) {
      setName(flavor.name);
      setType(flavor.type);
    } else {
      setName('');
      setType('salgado');
    }
  }, [flavor, open]);

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Preencha o nome'); return; }
    setSaving(true);

    const data = { name: name.trim(), type };

    if (flavor) {
      const { error } = await supabase.from('flavors').update(data).eq('id', flavor.id);
      if (error) { toast.error('Erro ao salvar'); setSaving(false); return; }
      toast.success('Sabor atualizado');
    } else {
      const { error } = await supabase.from('flavors').insert(data);
      if (error) { toast.error('Erro ao criar'); setSaving(false); return; }
      toast.success('Sabor criado');
    }

    setSaving(false);
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{flavor ? 'Editar Sabor' : 'Novo Sabor'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Nome *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do sabor" />
          </div>
          <div className="space-y-1">
            <Label>Tipo</Label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option value="salgado">Salgado</option>
              <option value="doce">Doce</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Admin;
