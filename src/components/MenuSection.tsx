import { useState } from 'react';
import { type MenuItem, SWEET_SPECIAL_FLAVORS } from '@/data/menu';
import { useProducts } from '@/hooks/useProducts';
import { useHappyHour } from '@/hooks/useHappyHour';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Plus, Star, ShoppingCart, Clock } from 'lucide-react';
import FlavorModal from './FlavorModal';
import AdicionaisModal from './AdicionaisModal';
import AnimatedCard from './AnimatedCard';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface MenuSectionProps {
  category: string;
}

const CARD_CLASS = "bg-card rounded-xl p-5 shadow-sm border-2 border-transparent hover:border-primary hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer";

const formatPrice = (price: number) =>
  `R$ ${price.toFixed(2).replace('.', ',')}`;

const MenuSection = ({ category }: MenuSectionProps) => {
  const { products, loading } = useProducts();
  const items = products.filter(i => i.category === category);
  const { addItem } = useCart();
  const [flavorModal, setFlavorModal] = useState<MenuItem | null>(null);

  const handleAdd = (item: MenuItem) => {
    if (item.maxFlavors) {
      setFlavorModal(item);
    } else {
      addItem({ id: item.id, name: item.name, price: item.price });
      toast.success(`${item.name} adicionado!`);
    }
  };

  const handleFlavorConfirm = (flavors: string[]) => {
    if (!flavorModal) return;
    const flavorText = flavors.join(', ');
    addItem({
      id: flavorModal.id,
      name: `${flavorModal.name} (${flavorText})`,
      price: flavorModal.price,
      flavors,
    });
    toast.success(`${flavorModal.name} adicionado!`);
    setFlavorModal(null);
  };

  if (loading) {
    return <p className="text-center text-muted-foreground py-8">Carregando...</p>;
  }

  // Group by subcategory for bebidas
  if (category === 'bebidas') {
    const grouped: Record<string, MenuItem[]> = {};
    items.forEach(item => {
      const sub = item.subcategory || '';
      if (!grouped[sub]) grouped[sub] = [];
      grouped[sub].push(item);
    });

    return (
      <div className="space-y-6">
        {Object.entries(grouped).map(([sub, subItems]) => (
          <div key={sub || '_none'}>
            {sub && <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">{sub}</h3>}
            <div className="grid gap-3">
              {subItems.map((item, idx) => (
                <AnimatedCard key={item.id} index={idx}>
                  <ItemCard item={item} onAdd={handleAdd} />
                </AnimatedCard>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Monte seu pastel
  if (category === 'monte') {
    return (
      <>
        <div className="grid gap-4">
          {items.map((item, idx) => (
            <AnimatedCard key={item.id} index={idx}>
              <div className="bg-card rounded-[14px] shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300 overflow-hidden border-2 border-border/50 hover:border-primary">
                <div className="flex items-center gap-3 p-3">
                  {/* Product image */}
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0"
                    />
                  )}
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-bold text-base sm:text-lg text-foreground leading-tight"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                    )}
                    <span
                      className="text-base font-extrabold text-primary mt-1 block"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      {formatPrice(item.price)}
                    </span>
                  </div>
                </div>
                {/* Button below */}
                <div className="px-3 pb-3">
                  <button
                    onClick={() => handleAdd(item)}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-[hsl(0,100%,30%)] active:scale-[0.97] text-primary-foreground text-xs font-bold py-2.5 rounded-full transition-all duration-200 shadow-sm"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    PEDIR AGORA
                  </button>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>

        {flavorModal && (
          <FlavorModal
            open={!!flavorModal}
            onClose={() => setFlavorModal(null)}
            maxFlavors={flavorModal.maxFlavors!}
            itemName={flavorModal.name}
            price={flavorModal.price}
            onConfirm={handleFlavorConfirm}
          />
        )}
      </>
    );
  }

  // Especiais
  if (category === 'especiais') {
    return (
      <div className="grid gap-4">
        {items.map((item, idx) => (
          <AnimatedCard key={item.id} index={idx}>
            <EspecialCard item={item} onAdd={handleAdd} addItem={addItem} allProducts={products} />
          </AnimatedCard>
        ))}
      </div>
    );
  }

  // Doces
  if (category === 'doces') {
    return (
      <>
        <div className="grid gap-3">
          {items.map((item, idx) => (
            <AnimatedCard key={item.id} index={idx}>
              <DoceCard item={item} onAdd={handleAdd} addItem={addItem} />
            </AnimatedCard>
          ))}
        </div>
        {flavorModal && (
          <FlavorModal
            open={!!flavorModal}
            onClose={() => setFlavorModal(null)}
            maxFlavors={flavorModal.maxFlavors!}
            itemName={flavorModal.name}
            price={flavorModal.price}
            onConfirm={handleFlavorConfirm}
            customFlavors={flavorModal.maxFlavors ? SWEET_SPECIAL_FLAVORS : undefined}
          />
        )}
      </>
    );
  }

  // Batatas
  if (category === 'batatas') {
    return (
      <div className="grid gap-4">
        {items.map((item, idx) => (
          <AnimatedCard key={item.id} index={idx}>
            <BatataCard item={item} addItem={addItem} />
          </AnimatedCard>
        ))}
      </div>
    );
  }

  // Adicionais - grid
  if (category === 'adicionais') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((item, idx) => (
          <AnimatedCard key={item.id} index={idx}>
            <div
              className={CARD_CLASS + " text-center flex flex-col items-center gap-2"}
            >
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
              )}
              <span className="font-bold text-sm text-foreground">{item.name}</span>
              <span className="text-primary font-extrabold">{formatPrice(item.price)}</span>
              <Button size="sm" className="rounded-full w-full" onClick={() => handleAdd(item)}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </div>
          </AnimatedCard>
        ))}
      </div>
    );
  }

  // Default - layout padrão com imagem, descrição e preço
  return (
    <div className="grid gap-3">
      {items.map((item, idx) => (
        <AnimatedCard key={item.id} index={idx}>
          <div className="bg-card rounded-[14px] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-border/50">
            <div className="flex items-center gap-3 p-3">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-foreground leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {item.name}
                </h3>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                )}
                <span className="text-base font-extrabold text-primary mt-1 block" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {formatPrice(item.price)}
                </span>
              </div>
            </div>
            <div className="px-3 pb-3">
              <button
                onClick={() => handleAdd(item)}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-[hsl(0,100%,30%)] active:scale-[0.97] text-primary-foreground text-xs font-bold py-2.5 rounded-full transition-all duration-200 shadow-sm"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                PEDIR AGORA
              </button>
            </div>
          </div>
        </AnimatedCard>
      ))}
    </div>
  );
};

const ProductImage = ({ src, alt, small }: { src?: string; alt: string; small?: boolean }) => {
  if (!src) return null;
  return (
    <img src={src} alt={alt} className={small ? "h-16 w-16 rounded-lg object-cover shrink-0" : "h-32 w-32 rounded-lg object-cover shrink-0"} />
  );
};

const ItemCard = ({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) => (
  <div className={CARD_CLASS + " flex items-center justify-between py-2 px-3"}>
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <ProductImage src={item.imageUrl} alt={item.name} small />
      <div className="min-w-0">
        <h3 className="font-bold text-xs text-foreground">{item.name}</h3>
        {item.description && <p className="text-[10px] text-muted-foreground">{item.description}</p>}
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-xs font-extrabold text-primary">R$ {item.price.toFixed(2).replace('.', ',')}</span>
      <Button size="icon" className="rounded-full h-7 w-7" onClick={() => onAdd(item)}>
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  </div>
);

// Cheese selection for specific especiais - match by name pattern
const CHEESE_NAMES = ['Frango Apimentado', 'Mexicano', 'Doritos', 'Costela Peperoni'];
const NO_EXTRAS_NAMES = ['Pastel de Vento'];

const EspecialCard = ({
  item,
  addItem,
  allProducts,
}: {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  addItem: (item: Omit<import('@/contexts/CartContext').CartItem, 'quantity'>) => void;
  allProducts: MenuItem[];
}) => {
  const [cheese, setCheese] = useState<string>('');
  const [adicionaisOpen, setAdicionaisOpen] = useState(false);
  const needsCheese = CHEESE_NAMES.some(n => item.name.toLowerCase().includes(n.toLowerCase()));
  const allowExtras = !NO_EXTRAS_NAMES.some(n => item.name.toLowerCase().includes(n.toLowerCase()));

  const handleAddToCart = (extras: { name: string; price: number }[] = []) => {
    if (needsCheese && !cheese) {
      toast.error('Escolha um tipo de queijo!');
      return;
    }

    const parts: string[] = [];
    if (cheese) parts.push(cheese);
    if (extras.length > 0) parts.push(extras.map(e => e.name).join(', '));
    const suffix = parts.length > 0 ? ` (${parts.join(' + ')})` : '';
    const extraPrice = extras.reduce((sum, e) => sum + e.price, 0);

    addItem({
      id: `${item.id}-${cheese}-${extras.map(e => e.name).join(',')}`,
      name: `${item.name}${suffix}`,
      price: item.price + extraPrice,
    });
    toast.success(`${item.name} adicionado!`);
    setCheese('');
  };

  const adicionais = allProducts.filter(p => p.category === 'adicionais');

  return (
    <>
      <div className="bg-card rounded-xl p-5 shadow-sm border-2 border-border hover:border-primary hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer">
        <div className="flex items-start gap-3">
          <ProductImage src={item.imageUrl} alt={item.name} />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-accent fill-accent" />
                <h3 className="font-bold text-foreground">{item.name}</h3>
              </div>
              <span className="text-lg font-extrabold text-primary shrink-0">{formatPrice(item.price)}</span>
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
            )}
          </div>
        </div>

        {needsCheese && (
          <div className="mt-3 p-3 bg-secondary rounded-lg">
            <p className="text-xs font-bold text-muted-foreground mb-2">Escolha o queijo:</p>
            <RadioGroup value={cheese} onValueChange={setCheese} className="flex gap-3 flex-wrap">
              {['Catupiry', 'Cheddar', 'Queijo'].map(q => (
                <div key={q} className="flex items-center gap-1.5">
                  <RadioGroupItem value={q} id={`${item.id}-${q}`} />
                  <Label htmlFor={`${item.id}-${q}`} className="text-sm cursor-pointer">{q}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        <div className="flex items-center gap-2 mt-3">
          <Button size="sm" className="rounded-full flex-1" onClick={() => handleAddToCart()}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
          {allowExtras && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => setAdicionaisOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Adicional
            </Button>
          )}
        </div>
      </div>

      <AdicionaisModal
        open={adicionaisOpen}
        onClose={() => setAdicionaisOpen(false)}
        adicionais={adicionais}
        onConfirm={(extras) => {
          setAdicionaisOpen(false);
          handleAddToCart(extras);
        }}
      />
    </>
  );
};

const DoceCard = ({
  item,
  onAdd,
}: {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  addItem: (item: Omit<import('@/contexts/CartContext').CartItem, 'quantity'>) => void;
}) => {
  const hasMaxFlavors = !!item.maxFlavors;

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border-2 border-border hover:border-primary hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer">
      <div className="flex items-start gap-3">
        <ProductImage src={item.imageUrl} alt={item.name} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">🍫 {item.name}</h3>
            <span className="text-lg font-extrabold text-primary shrink-0">{formatPrice(item.price)}</span>
          </div>
          {item.description && (
            <p className="text-xs text-primary font-semibold mt-1">{item.description}</p>
          )}
        </div>
      </div>
      <Button size="sm" className="rounded-full w-full mt-3" onClick={() => onAdd(item)}>
        <Plus className="h-4 w-4 mr-1" /> {hasMaxFlavors ? 'Escolher sabor' : 'Adicionar'}
      </Button>
    </div>
  );
};

const BATATA_CHEESE_NAMES = ['Batata c/ Bacon e Cheddar'];

const BatataCard = ({
  item,
  addItem,
}: {
  item: MenuItem;
  addItem: (item: Omit<import('@/contexts/CartContext').CartItem, 'quantity'>) => void;
}) => {
  const [cheese, setCheese] = useState<string>('');
  const needsCheese = BATATA_CHEESE_NAMES.some(n => item.name.toLowerCase().includes(n.toLowerCase()));

  const handleAdd = () => {
    if (needsCheese && !cheese) {
      toast.error('Escolha Cheddar ou Catupiry!');
      return;
    }
    const suffix = cheese ? ` (${cheese})` : '';
    addItem({
      id: `${item.id}-${cheese}`,
      name: `${item.name}${suffix}`,
      price: item.price,
    });
    toast.success(`${item.name} adicionado!`);
    setCheese('');
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border-2 border-border hover:border-primary hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer overflow-hidden">
      {item.imageUrl && (
        <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover" />
      )}
      <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-lg text-foreground">🍟 {item.name}</h3>
          <span className="text-xl font-extrabold text-primary">{formatPrice(item.price)}</span>
        </div>
        {item.description && (
          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
        )}

        {needsCheese && (
          <div className="mt-3 p-3 bg-secondary rounded-lg">
            <p className="text-xs font-bold text-muted-foreground mb-2">Escolha a cobertura:</p>
            <RadioGroup value={cheese} onValueChange={setCheese} className="flex gap-3 flex-wrap">
              {['Cheddar', 'Catupiry'].map(q => (
                <div key={q} className="flex items-center gap-1.5">
                  <RadioGroupItem value={q} id={`${item.id}-${q}`} />
                  <Label htmlFor={`${item.id}-${q}`} className="text-sm cursor-pointer">{q}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        <Button size="sm" className="rounded-full w-full mt-3" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-1" /> Adicionar
        </Button>
      </div>
    </div>
  );
};

export default MenuSection;
