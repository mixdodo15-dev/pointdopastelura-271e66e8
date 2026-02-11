import { useState } from 'react';
import { MENU_ITEMS, SWEET_SPECIAL_FLAVORS, type MenuItem } from '@/data/menu';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Plus, Star } from 'lucide-react';
import FlavorModal from './FlavorModal';
import AdicionaisModal from './AdicionaisModal';
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
  const items = MENU_ITEMS.filter(i => i.category === category);
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

  // Group by subcategory for bebidas
  if (category === 'bebidas') {
    const grouped: Record<string, MenuItem[]> = {};
    items.forEach(item => {
      const sub = item.subcategory || 'Outros';
      if (!grouped[sub]) grouped[sub] = [];
      grouped[sub].push(item);
    });

    return (
      <div className="space-y-6">
        {Object.entries(grouped).map(([sub, subItems]) => (
          <div key={sub}>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">{sub}</h3>
            <div className="grid gap-3">
              {subItems.map(item => (
                <ItemCard key={item.id} item={item} onAdd={handleAdd} />
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
        <div className="grid gap-3">
          {items.map(item => (
            <div
              key={item.id}
              className="bg-card rounded-xl p-6 shadow-sm border-2 border-gray-200 hover:border-primary hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg text-foreground">{item.name}</h3>
                <span className="text-xl font-extrabold text-primary">{formatPrice(item.price)}</span>
              </div>
              <p className="text-sm font-semibold text-primary mb-3">Escolha {item.maxFlavors} {item.maxFlavors === 1 ? 'sabor' : 'sabores'}</p>
              <Button className="rounded-full w-full" onClick={() => handleAdd(item)}>
                <Plus className="h-4 w-4 mr-1" /> Selecionar Sabores
              </Button>
            </div>
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

  // Especiais - premium cards with cheese & extras
  if (category === 'especiais') {
    return (
      <>
        <div className="grid gap-4">
          {items.map(item => (
            <EspecialCard key={item.id} item={item} onAdd={handleAdd} addItem={addItem} />
          ))}
        </div>
      </>
    );
  }

  // Doces
  if (category === 'doces') {
    return (
      <>
        <div className="grid gap-3">
          {items.map(item => (
            <DoceCard key={item.id} item={item} onAdd={handleAdd} addItem={addItem} />
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
            customFlavors={flavorModal.id === 'doce-7' ? SWEET_SPECIAL_FLAVORS : undefined}
          />
        )}
      </>
    );
  }

  // Adicionais - grid
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {items.map(item => (
        <div
          key={item.id}
          className={CARD_CLASS + " text-center flex flex-col items-center gap-2"}
        >
          <span className="font-bold text-sm text-foreground">{item.name}</span>
          <span className="text-primary font-extrabold">{formatPrice(item.price)}</span>
          <Button size="sm" className="rounded-full w-full" onClick={() => handleAdd(item)}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>
      ))}
    </div>
  );
};

const ItemCard = ({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) => (
  <div className={CARD_CLASS + " flex items-center justify-between"}>
    <div className="flex-1">
      <h3 className="font-bold text-foreground">{item.name}</h3>
      {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
    </div>
    <div className="flex items-center gap-3">
      <span className="text-lg font-extrabold text-primary">R$ {item.price.toFixed(2).replace('.', ',')}</span>
      <Button size="icon" className="rounded-full h-9 w-9" onClick={() => onAdd(item)}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

// IDs that need cheese selection
const CHEESE_IDS = ['esp-2', 'esp-3', 'esp-4', 'esp-5'];
// IDs that allow extras (all except Pastel de Vento)
const EXTRAS_IDS = ['esp-1', 'esp-2', 'esp-3', 'esp-4', 'esp-5', 'esp-6'];

const EspecialCard = ({
  item,
  addItem,
}: {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  addItem: (item: Omit<import('@/contexts/CartContext').CartItem, 'quantity'>) => void;
}) => {
  const [cheese, setCheese] = useState<string>('');
  const [adicionaisOpen, setAdicionaisOpen] = useState(false);
  const needsCheese = CHEESE_IDS.includes(item.id);
  const allowExtras = EXTRAS_IDS.includes(item.id);

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

  return (
    <>
      <div className="bg-card rounded-xl p-5 shadow-sm border-2 border-gray-200 hover:border-primary hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-accent fill-accent" />
              <h3 className="font-bold text-foreground">{item.name}</h3>
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
            )}
          </div>
          <span className="text-lg font-extrabold text-primary">{formatPrice(item.price)}</span>
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
  const isEspecial = item.id === 'doce-7';

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border-2 border-gray-200 hover:border-primary hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-bold text-foreground">🍫 {item.name}</h3>
          {item.description && (
            <p className="text-xs text-primary font-semibold mt-1">{item.description}</p>
          )}
        </div>
        <span className="text-lg font-extrabold text-primary">{formatPrice(item.price)}</span>
      </div>
      <Button size="sm" className="rounded-full w-full mt-3" onClick={() => onAdd(item)}>
        <Plus className="h-4 w-4 mr-1" /> {isEspecial ? 'Escolher sabor' : 'Adicionar'}
      </Button>
    </div>
  );
};

export default MenuSection;
