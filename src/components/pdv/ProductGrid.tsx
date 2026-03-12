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
  onAdd: (p: any) => void;
  loading: boolean;
}

const formatPrice = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const ProductGrid = ({ products, onAdd, loading }: ProductGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border-2 border-border h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <ImageIcon className="h-12 w-12 mb-2 opacity-40" />
        <p className="font-bold">Nenhum produto encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
      {products.map(p => (
        <button
          key={p.id}
          onClick={() => onAdd(p)}
          className={cn(
            "bg-card rounded-xl border-2 border-border p-2.5 flex flex-col items-center gap-1.5",
            "hover:border-[hsl(var(--pdv-red))] hover:shadow-lg hover:shadow-[hsl(var(--pdv-red))]/10 hover:scale-105 transition-all duration-200",
            "active:scale-95 cursor-pointer text-center"
          )}
          aria-label={`Adicionar ${p.name}`}
        >
          {p.image_url ? (
            <img src={p.image_url} alt={p.name} className="h-14 w-14 rounded-lg object-cover" />
          ) : (
            <div className="h-14 w-14 rounded-lg bg-[hsl(var(--pdv-accent))]/10 flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-[hsl(var(--pdv-accent))]" />
            </div>
          )}
          <div className="w-full text-center">
            <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
            <p className="text-sm font-extrabold text-[hsl(var(--pdv-red))]">{formatPrice(p.price)}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ProductGrid;
