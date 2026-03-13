import { cn } from '@/lib/utils';
import { Image as ImageIcon, Plus } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
}

interface ProductGridProps {
  products: Product[];
  onAdd: (p: any) => void;
  loading: boolean;
}

const formatPrice = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const ProductGrid = ({ products, onAdd, loading }: ProductGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border h-36 animate-pulse" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-3">
          <ImageIcon className="h-8 w-8 opacity-40" />
        </div>
        <p className="font-bold text-base">Nenhum produto encontrado</p>
        <p className="text-sm opacity-60">Tente outra categoria ou busca</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
      {products.map(p => (
        <button
          key={p.id}
          onClick={() => onAdd(p)}
          className={cn(
            "group bg-card rounded-2xl border border-border p-3 flex flex-col items-center gap-2",
            "hover:border-primary hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5",
            "active:scale-95 cursor-pointer text-center transition-all duration-200 relative overflow-hidden"
          )}
          aria-label={`Adicionar ${p.name}`}
        >
          {/* Quick add indicator */}
          <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
            <Plus className="h-3.5 w-3.5" />
          </div>

          {p.image_url ? (
            <div className="h-16 w-16 rounded-xl overflow-hidden shadow-sm">
              <img src={p.image_url} alt={p.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center">
              <ImageIcon className="h-7 w-7 text-accent" />
            </div>
          )}
          <div className="w-full text-center space-y-0.5">
            <p className="text-xs font-bold text-foreground line-clamp-2 leading-tight">{p.name}</p>
            <p className="text-sm font-extrabold text-primary">{formatPrice(p.price)}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ProductGrid;
