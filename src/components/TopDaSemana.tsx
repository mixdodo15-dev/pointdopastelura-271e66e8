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
    <section className="max-w-3xl mx-auto px-4 pt-6">
      <SectionTitle icon="🏆" label="TOP Da Semana" />
      <div className="grid gap-3">
        {topProducts.map((item, idx) => (
          <AnimatedCard key={item.id} index={idx}>
            <div className="bg-card rounded-xl shadow-sm border-2 border-primary/30 hover:border-primary hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden relative">
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full z-10 flex items-center gap-1">
                <Trophy className="h-3 w-3" /> TOP
              </div>
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover" />
              )}
              <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-lg text-foreground">{item.name}</h3>
                  <span className="text-xl font-extrabold text-primary">{formatPrice(item.price)}</span>
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                )}
                <Button size="sm" className="rounded-full w-full mt-3" onClick={() => handleAdd(item)}>
                  <Plus className="h-4 w-4 mr-1" /> Pedir
                </Button>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </section>
  );
};

export default TopDaSemana;
