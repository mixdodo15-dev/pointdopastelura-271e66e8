import { cn } from '@/lib/utils';
import { Image as ImageIcon } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
}

interface ProductGridProps {
  products: Product[];
  onAdd: (p: Product) => void;
  loading: boolean;
}

const formatPrice = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const ProductGrid = ({ products, onAdd, loading }: ProductGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border h-36 animate-pulse" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <ImageIcon className="h-12 w-12 mb-2 opacity-40" />
        <p className="font-semibold">Nenhum produto encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {products.map(p => (
        <button
          key={p.id}
          onClick={() => onAdd(p)}
          className={cn(
            "bg-card rounded-xl border border-border p-3 flex flex-col items-center gap-2",
            "hover:border-primary hover:shadow-lg hover:scale-105 transition-all duration-200",
            "active:scale-95 cursor-pointer text-left"
          )}
          aria-label={`Adicionar ${p.name}`}
        >
          {p.image_url ? (
            <img src={p.image_url} alt={p.name} className="h-16 w-16 rounded-lg object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-lg bg-secondary flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="w-full text-center">
            <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
            <p className="text-sm font-extrabold text-primary">{formatPrice(p.price)}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ProductGrid;
