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
import { Plus, Pencil, Trash2, LogOut, ArrowLeft, Package, IceCream, Droplets, Upload, X, Image, LayoutGrid, Truck, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
  is_top_week: boolean;
}

interface Flavor {
  id: string;
  name: string;
  type: string;
  active: boolean;
}

interface Category {
  id: string;
  slug: string;
  label: string;
  icon: string;
  sort_order: number;
  active: boolean;
}

const formatPrice = (price: number) => `R$ ${Number(price).toFixed(2).replace('.', ',')}`;

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'flavors' | 'categories' | 'drivers' | 'clients'>('products');
  const [drivers, setDrivers] = useState<{id: string; user_id: string; email: string}[]>([]);
  const [newDriverEmail, setNewDriverEmail] = useState('');
  const [addingDriver, setAddingDriver] = useState(false);
  const [clients, setClients] = useState<{user_id: string; display_name: string | null; email: string | null; phone: string | null; created_at: string}[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState(false);
  const [editFlavor, setEditFlavor] = useState<Flavor | null>(null);
  const [newFlavor, setNewFlavor] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState(false);

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

  useEffect(() => {
    if (loading) return;
    loadProducts();
    loadFlavors();
    loadCategories();
    loadDrivers();
    loadClients();
  }, [loading]);

  const loadProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('sort_order');
    if (error) { toast.error('Erro ao carregar produtos'); return; }
    setProducts(data || []);
  };

  const loadFlavors = async () => {
    const { data, error } = await supabase.from('flavors').select('*').order('name');
    if (error) { toast.error('Erro ao carregar sabores'); return; }
    setFlavors(data || []);
  };

  const loadCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*').order('sort_order');
    if (error) { toast.error('Erro ao carregar categorias'); return; }
    setCategories(data || []);
    if (data && data.length > 0 && !activeCategory) {
      setActiveCategory(data[0].slug);
    }
  };

  const toggleProductActive = async (product: Product) => {
    const { error } = await supabase.from('products').update({ active: !product.active }).eq('id', product.id);
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
    const { error } = await supabase.from('flavors').update({ active: !flavor.active }).eq('id', flavor.id);
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

  const toggleCategoryActive = async (cat: Category) => {
    const { error } = await supabase.from('categories').update({ active: !cat.active }).eq('id', cat.id);
    if (error) { toast.error('Erro ao atualizar'); return; }
    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, active: !c.active } : c));
    toast.success(cat.active ? 'Categoria desativada' : 'Categoria ativada');
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir'); return; }
    setCategories(prev => prev.filter(c => c.id !== id));
    toast.success('Categoria excluída');
  };

  const loadDrivers = async () => {
    const { data, error } = await supabase.from('user_roles').select('id, user_id').eq('role', 'driver');
    if (error) { toast.error('Erro ao carregar entregadores'); return; }
    if (!data || data.length === 0) { setDrivers([]); return; }
    const userIds = data.map(d => d.user_id);
    const { data: profiles } = await supabase.from('profiles').select('user_id, email').in('user_id', userIds);
    const merged = data.map(d => ({
      id: d.id,
      user_id: d.user_id,
      email: profiles?.find(p => p.user_id === d.user_id)?.email || 'Email não encontrado',
    }));
    setDrivers(merged);
  };

  const addDriver = async () => {
    if (!newDriverEmail.trim()) return;
    setAddingDriver(true);
    const { data: profile, error: pErr } = await supabase.from('profiles').select('user_id').eq('email', newDriverEmail.trim()).maybeSingle();
    if (pErr || !profile) {
      toast.error('Usuário não encontrado. O entregador precisa estar cadastrado.');
      setAddingDriver(false);
      return;
    }
    const { error } = await supabase.from('user_roles').insert({ user_id: profile.user_id, role: 'driver' as any });
    if (error) {
      if (error.code === '23505') toast.error('Este usuário já é entregador');
      else toast.error('Erro ao adicionar entregador');
      setAddingDriver(false);
      return;
    }
    toast.success('Entregador adicionado!');
    setNewDriverEmail('');
    setAddingDriver(false);
    loadDrivers();
  };

  const removeDriver = async (roleId: string) => {
    const { error } = await supabase.from('user_roles').delete().eq('id', roleId);
    if (error) { toast.error('Erro ao remover'); return; }
    toast.success('Entregador removido');
    loadDrivers();
  };
  const loadClients = async () => {
    const { data, error } = await supabase.from('profiles').select('user_id, display_name, email, phone, created_at').order('created_at', { ascending: false });
    if (error) { toast.error('Erro ao carregar clientes'); return; }
    setClients(data || []);
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
        <div className="flex gap-2 mb-4 overflow-x-auto">
          <Button variant={activeTab === 'products' ? 'default' : 'outline'} className="rounded-full" onClick={() => setActiveTab('products')}>
            <Package className="h-4 w-4 mr-1" /> Produtos
          </Button>
          <Button variant={activeTab === 'flavors' ? 'default' : 'outline'} className="rounded-full" onClick={() => setActiveTab('flavors')}>
            <IceCream className="h-4 w-4 mr-1" /> Sabores
          </Button>
          <Button variant={activeTab === 'categories' ? 'default' : 'outline'} className="rounded-full" onClick={() => setActiveTab('categories')}>
            <LayoutGrid className="h-4 w-4 mr-1" /> Categorias
          </Button>
          <Button variant={activeTab === 'drivers' ? 'default' : 'outline'} className="rounded-full" onClick={() => setActiveTab('drivers')}>
            <Truck className="h-4 w-4 mr-1" /> Entregadores
          </Button>
          <Button variant={activeTab === 'clients' ? 'default' : 'outline'} className="rounded-full" onClick={() => setActiveTab('clients')}>
            <Users className="h-4 w-4 mr-1" /> Clientes
          </Button>
          <Button variant="outline" className="rounded-full border-primary text-primary" onClick={() => navigate('/admin/pedidos')}>
            📋 Pedidos
          </Button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            <div className="flex overflow-x-auto gap-1 mb-4 pb-1">
              {categories.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all",
                    activeCategory === cat.slug
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
              <h2 className="text-lg font-bold">{categories.find(c => c.slug === activeCategory)?.label || 'Produtos'}</h2>
              <Button size="sm" className="rounded-full" onClick={() => setNewProduct(true)}>
                <Plus className="h-4 w-4 mr-1" /> Novo Produto
              </Button>
            </div>

            <div className="space-y-2">
              {filteredProducts.map(product => (
                <div key={product.id} className={cn("bg-card rounded-lg p-4 border flex items-center gap-3 transition-opacity", !product.active && "opacity-50")}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-12 w-12 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Image className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-sm truncate">{product.name}</p>
                      {product.is_top_week && <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold shrink-0">TOP</span>}
                    </div>
                    {product.description && <p className="text-xs text-muted-foreground truncate">{product.description}</p>}
                    <p className="text-sm font-bold text-primary">{formatPrice(product.price)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={product.active} onCheckedChange={() => toggleProductActive(product)} />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditProduct(product)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteProduct(product.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum produto nesta categoria.</p>}
            </div>
          </>
        )}

        {/* Flavors Tab */}
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
                    <div key={flavor.id} className={cn("bg-card rounded-lg p-3 border flex items-center gap-3 transition-opacity", !flavor.active && "opacity-50")}>
                      <span className="flex-1 font-medium text-sm">{flavor.name}</span>
                      <Switch checked={flavor.active} onCheckedChange={() => toggleFlavorActive(flavor)} />
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

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold">Categorias do Menu</h2>
              <Button size="sm" className="rounded-full" onClick={() => setNewCategory(true)}>
                <Plus className="h-4 w-4 mr-1" /> Nova Categoria
              </Button>
            </div>
            <div className="space-y-2">
              {categories.map(cat => (
                <div key={cat.id} className={cn("bg-card rounded-lg p-4 border flex items-center gap-3 transition-opacity", !cat.active && "opacity-50")}>
                  <span className="text-2xl">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{cat.label}</p>
                    <p className="text-xs text-muted-foreground">slug: {cat.slug} · ordem: {cat.sort_order}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={cat.active} onCheckedChange={() => toggleCategoryActive(cat)} />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditCategory(cat)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteCategory(cat.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma categoria cadastrada.</p>}
            </div>
          </>
        )}

        {/* Drivers Tab */}
        {activeTab === 'drivers' && (
          <>
            <h2 className="text-lg font-bold mb-3">Gerenciar Entregadores</h2>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Email do usuário cadastrado"
                value={newDriverEmail}
                onChange={e => setNewDriverEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addDriver()}
              />
              <Button onClick={addDriver} disabled={addingDriver} className="shrink-0">
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              {drivers.map(driver => (
                <div key={driver.id} className="bg-card rounded-lg p-4 border flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{driver.email}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeDriver(driver.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {drivers.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum entregador cadastrado.</p>}
            </div>
          </>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        open={!!editProduct || newProduct}
        product={editProduct}
        defaultCategory={activeCategory}
        categories={categories}
        onClose={() => { setEditProduct(null); setNewProduct(false); }}
        onSave={() => { loadProducts(); setEditProduct(null); setNewProduct(false); }}
      />

      {/* Flavor Modal */}
      <FlavorEditModal
        open={!!editFlavor || newFlavor}
        flavor={editFlavor}
        onClose={() => { setEditFlavor(null); setNewFlavor(false); }}
        onSave={() => { loadFlavors(); setEditFlavor(null); setNewFlavor(false); }}
      />

      {/* Category Modal */}
      <CategoryModal
        open={!!editCategory || newCategory}
        category={editCategory}
        onClose={() => { setEditCategory(null); setNewCategory(false); }}
        onSave={() => { loadCategories(); setEditCategory(null); setNewCategory(false); }}
      />
    </div>
  );
};

// Product Modal
const ProductModal = ({
  open, product, defaultCategory, categories, onClose, onSave,
}: {
  open: boolean;
  product: Product | null;
  defaultCategory: string;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [maxFlavors, setMaxFlavors] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isTopWeek, setIsTopWeek] = useState(false);
  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || '');
      setPrice(String(product.price));
      setCategory(product.category);
      setSubcategory(product.subcategory || '');
      setMaxFlavors(product.max_flavors ? String(product.max_flavors) : '');
      setSortOrder(String(product.sort_order));
      setImageUrl(product.image_url || '');
      setIsTopWeek(product.is_top_week || false);
    } else {
      setName(''); setDescription(''); setPrice('');
      setCategory(defaultCategory);
      setSubcategory(''); setMaxFlavors(''); setSortOrder('0'); setImageUrl('');
      setIsTopWeek(false);
    }
  }, [product, defaultCategory, open]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Selecione uma imagem'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Imagem deve ter no máximo 5MB'); return; }
    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
    if (uploadError) { toast.error('Erro ao enviar imagem'); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
    setImageUrl(publicUrl);
    setUploading(false);
    toast.success('Imagem enviada!');
  };

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
      image_url: imageUrl || null,
      is_top_week: isTopWeek,
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
            <Label>Imagem</Label>
            {imageUrl ? (
              <div className="relative w-full h-40 rounded-lg overflow-hidden bg-secondary">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <button onClick={() => setImageUrl('')} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-secondary/50">
                <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">{uploading ? 'Enviando...' : 'Clique para enviar imagem'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            )}
          </div>
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
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={category} onChange={e => setCategory(e.target.value)}>
                {categories.map(c => (
                  <option key={c.slug} value={c.slug}>{c.icon} {c.label}</option>
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
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <div>
              <Label className="font-bold">🏆 TOP da Semana</Label>
              <p className="text-xs text-muted-foreground">Destacar na seção TOP</p>
            </div>
            <Switch checked={isTopWeek} onCheckedChange={setIsTopWeek} />
          </div>
          <div className="space-y-1">
            <Label>Ordem</Label>
            <Input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} placeholder="0" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
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
    if (flavor) { setName(flavor.name); setType(flavor.type); }
    else { setName(''); setType('salgado'); }
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
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={type} onChange={e => setType(e.target.value)}>
              <option value="salgado">Salgado</option>
              <option value="doce">Doce</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Category Modal
const CategoryModal = ({
  open, category, onClose, onSave,
}: {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSave: () => void;
}) => {
  const [label, setLabel] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('📦');
  const [sortOrder, setSortOrder] = useState('0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (category) {
      setLabel(category.label);
      setSlug(category.slug);
      setIcon(category.icon);
      setSortOrder(String(category.sort_order));
    } else {
      setLabel(''); setSlug(''); setIcon('📦'); setSortOrder('0');
    }
  }, [category, open]);

  // Auto-generate slug from label
  const handleLabelChange = (value: string) => {
    setLabel(value);
    if (!category) {
      setSlug(value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  };

  const handleSave = async () => {
    if (!label.trim() || !slug.trim()) { toast.error('Preencha nome e slug'); return; }
    setSaving(true);
    const data = {
      label: label.trim(),
      slug: slug.trim(),
      icon: icon.trim() || '📦',
      sort_order: parseInt(sortOrder) || 0,
    };
    if (category) {
      const { error } = await supabase.from('categories').update(data).eq('id', category.id);
      if (error) { toast.error('Erro ao salvar'); setSaving(false); return; }
      toast.success('Categoria atualizada');
    } else {
      const { error } = await supabase.from('categories').insert(data);
      if (error) { toast.error('Erro ao criar'); setSaving(false); return; }
      toast.success('Categoria criada');
    }
    setSaving(false);
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{category ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Nome *</Label>
            <Input value={label} onChange={e => handleLabelChange(e.target.value)} placeholder="Ex: Combos" />
          </div>
          <div className="space-y-1">
            <Label>Slug *</Label>
            <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="ex: combos" />
            <p className="text-xs text-muted-foreground">Identificador único (sem espaços)</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Ícone (emoji)</Label>
              <Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="📦" />
            </div>
            <div className="space-y-1">
              <Label>Ordem</Label>
              <Input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} placeholder="0" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Admin;
