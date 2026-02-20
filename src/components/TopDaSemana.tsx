import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Plus, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import AnimatedCard from './AnimatedCard';
import SectionTitle from './SectionTitle';

const formatPrice = (price: number) =>
  `R$ ${price.toFixed(2).replace('.', ',')}`;

const TopDaSemana = () => {
  const { products, loading } = useProducts();
  const { addItem } = useCart();

  const topProducts = products.filter(p => p.isTopWeek);

  if (loading || topProducts.length === 0) return null;

  const handleAdd = (item: typeof topProducts[0]) => {
    addItem({ id: item.id, name: item.name, price: item.price });
    toast.success(`${item.name} adicionado!`);
  };

  return (
    <section className="max-w-3xl mx-auto px-4 pt-6">
      <SectionTitle icon="🏆" label="TOP Da Semana" />
      <div className="grid gap-3">
        {topProducts.map((item, idx) => (
          <AnimatedCard key={item.id} index={idx}>
            <div className="bg-card rounded-xl p-4 shadow-md border-2 border-primary/30 hover:border-primary hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                TOP
              </div>
              <div className="flex items-center gap-3">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} className="h-20 w-20 rounded-lg object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Trophy className="h-4 w-4 text-primary" />
                    <h3 className="font-bold text-foreground truncate">{item.name}</h3>
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-lg font-extrabold text-primary">{formatPrice(item.price)}</span>
                  <Button size="sm" className="rounded-full" onClick={() => handleAdd(item)}>
                    <Plus className="h-4 w-4 mr-1" /> Pedir
                  </Button>
                </div>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </section>
  );
};

export default TopDaSemana;
