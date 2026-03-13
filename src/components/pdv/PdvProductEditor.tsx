import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Search, Upload, X, Package, Image as ImageIcon } from 'lucide-react';
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
  is_top_week: boolean;
  available_on: string;
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

const PdvProductEditor = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [prodRes, catRes] = await Promise.all([
      supabase.from('products').select('*').in('available_on', ['pdv', 'both']).order('sort_order'),
      supabase.from('categories').select('*').eq('active', true).order('sort_order'),
    ]);
    if (prodRes.data) setProducts(prodRes.data as Product[]);
    if (catRes.data) {
      setCategories(catRes.data as Category[]);
      if (!activeCategory && catRes.data.length > 0) setActiveCategory(catRes.data[0].slug);
    }
  };

  const toggleActive = async (product: Product) => {
    const { error } = await supabase.from('products').update({ active: !product.active }).eq('id', product.id);
    if (error) { toast.error('Erro ao atualizar'); return; }
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, active: !p.active } : p));
    toast.success(product.active ? 'Produto desativado' : 'Produto ativado');
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Excluir este produto?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir'); return; }
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Produto excluído');
  };

  const filtered = products.filter(p => {
    const matchCat = !activeCategory || p.category === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-full bg-background p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Pencil className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-foreground">Editar Produtos</h2>
              <p className="text-sm text-muted-foreground">Gerencie todos os produtos do cardápio</p>
            </div>
          </div>
          <Button className="rounded-xl font-bold" onClick={() => setNewProduct(true)}>
            <Plus className="h-4 w-4 mr-1" /> Novo Produto
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 rounded-xl h-11"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto mb-6 pb-1">
          <button
            onClick={() => setActiveCategory('')}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all",
              !activeCategory
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/50"
            )}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all",
                activeCategory === cat.slug
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              )}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products List */}
        <div className="space-y-2">
          {filtered.map(product => (
            <div
              key={product.id}
              className={cn(
                "bg-card rounded-2xl border border-border p-4 flex items-center gap-4 transition-all hover:shadow-md",
                !product.active && "opacity-50"
              )}
            >
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="h-14 w-14 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-foreground truncate">{product.name}</p>
                  {product.is_top_week && (
                    <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold shrink-0">TOP</span>
                  )}
                </div>
                {product.description && (
                  <p className="text-xs text-muted-foreground truncate">{product.description}</p>
                )}
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-sm font-extrabold text-primary">{formatPrice(product.price)}</span>
                  <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                    {categories.find(c => c.slug === product.category)?.label || product.category}
                  </span>
                  {product.max_flavors && product.max_flavors > 0 && (
                    <span className="text-[10px] text-muted-foreground">até {product.max_flavors} sabores</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch checked={product.active} onCheckedChange={() => toggleActive(product)} />
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setEditProduct(product)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-destructive" onClick={() => deleteProduct(product.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Package className="h-12 w-12 opacity-30 mx-auto mb-3" />
              <p className="font-bold">Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit/Create Modal */}
      <ProductEditModal
        open={!!editProduct || newProduct}
        product={editProduct}
        defaultCategory={activeCategory || (categories[0]?.slug ?? '')}
        categories={categories}
        onClose={() => { setEditProduct(null); setNewProduct(false); }}
        onSave={() => { loadData(); setEditProduct(null); setNewProduct(false); }}
      />
    </div>
  );
};

// Product Edit Modal
const ProductEditModal = ({
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
      toast.success('Produto atualizado!');
    } else {
      const { error } = await supabase.from('products').insert(data);
      if (error) { toast.error('Erro ao criar'); setSaving(false); return; }
      toast.success('Produto criado!');
    }
    setSaving(false);
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-0 shadow-2xl">
        <div className="bg-primary px-6 pt-6 pb-4 rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary-foreground text-lg font-extrabold flex items-center gap-2">
              <Package className="h-5 w-5" />
              {product ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Image */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Imagem</Label>
            {imageUrl ? (
              <div className="relative w-full h-40 rounded-xl overflow-hidden bg-secondary">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <button onClick={() => setImageUrl('')} className="absolute top-2 right-2 bg-foreground/60 text-background rounded-full p-1 hover:bg-foreground/80">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors bg-secondary/50">
                <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">{uploading ? 'Enviando...' : 'Clique para enviar imagem'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Nome *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do produto" className="h-11 rounded-xl bg-secondary border-0" />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Descrição</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição do produto" rows={2} className="rounded-xl bg-secondary border-0 resize-none" />
          </div>

          {/* Price + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Preço *</Label>
              <Input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className="h-11 rounded-xl bg-secondary border-0" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Categoria</Label>
              <select className="w-full h-11 rounded-xl bg-secondary border-0 px-3 text-sm" value={category} onChange={e => setCategory(e.target.value)}>
                {categories.map(c => (
                  <option key={c.slug} value={c.slug}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Subcategory + Max Flavors */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Subcategoria</Label>
              <Input value={subcategory} onChange={e => setSubcategory(e.target.value)} placeholder="ex: Lata, 600ml" className="h-11 rounded-xl bg-secondary border-0" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Máx. Sabores</Label>
              <Input type="number" value={maxFlavors} onChange={e => setMaxFlavors(e.target.value)} placeholder="0" className="h-11 rounded-xl bg-secondary border-0" />
            </div>
          </div>

          {/* Top da Semana */}
          <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
            <div>
              <Label className="font-bold">🏆 TOP da Semana</Label>
              <p className="text-xs text-muted-foreground">Destacar na seção TOP</p>
            </div>
            <Switch checked={isTopWeek} onCheckedChange={setIsTopWeek} />
          </div>

          {/* Sort Order */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Ordem de exibição</Label>
            <Input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} placeholder="0" className="h-11 rounded-xl bg-secondary border-0" />
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl py-5" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1 rounded-xl py-5 font-bold" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdvProductEditor;
