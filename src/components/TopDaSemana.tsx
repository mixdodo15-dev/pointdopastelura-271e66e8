import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
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
  const { categories } = useCategories();
  const { addItem } = useCart();

  const topProducts = products.filter(p => p.isTopWeek);

  // Map category slug to label
  const categoryLabelMap = Object.fromEntries(
    categories.map(c => [c.slug, c.label])
  );

  if (loading || topProducts.length === 0) return null;

  const handleAdd = (item: typeof topProducts[0]) => {
    addItem({ id: item.id, name: item.name, price: item.price });
    toast.success(`${item.name} adicionado!`);
  };

  return (
    <section className="max-w-3xl mx-auto px-4 pt-6 overflow-hidden">
      <SectionTitle icon="🏆" label="TOP Da Semana" />
      <div className="grid gap-3">
        {topProducts.map((item, idx) => (
          <AnimatedCard key={item.id} index={idx}>
            <div className="bg-card rounded-xl p-3 shadow-md border-2 border-primary/30 hover:border-primary hover:shadow-lg transition-all duration-200 cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-bl-lg z-10">
                TOP
              </div>
              <div className="flex items-center gap-2 min-w-0">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} className="h-14 w-14 rounded-lg object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Trophy className="h-3.5 w-3.5 text-primary shrink-0" />
                    <h3 className="font-bold text-sm text-foreground truncate">{item.name}</h3>
                  </div>
                  {item.description && (
                    <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-[11px] text-muted-foreground truncate">{categoryLabelMap[item.category] || item.category}</p>
                    <span className="text-sm font-extrabold text-primary whitespace-nowrap">{formatPrice(item.price)}</span>
                  </div>
                </div>
              </div>
              <Button size="sm" className="rounded-full h-8 text-xs w-full mt-2" onClick={() => handleAdd(item)}>
                <Plus className="h-3.5 w-3.5 mr-0.5" /> Pedir
              </Button>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </section>
  );
};

export default TopDaSemana;
