import { useState } from 'react';
import { MENU_ITEMS, type MenuItem } from '@/data/menu';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Plus, Star } from 'lucide-react';
import FlavorModal from './FlavorModal';
import { toast } from 'sonner';

interface MenuSectionProps {
  category: string;
}

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
              className="flex items-center justify-between bg-card rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <h3 className="font-bold text-foreground">{item.name}</h3>
                <p className="text-xs text-muted-foreground">22cm • Escolha {item.maxFlavors} {item.maxFlavors === 1 ? 'sabor' : 'sabores'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-extrabold text-primary">{formatPrice(item.price)}</span>
                <Button size="icon" className="rounded-full h-9 w-9" onClick={() => handleAdd(item)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
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

  // Especiais - premium cards
  if (category === 'especiais') {
    return (
      <div className="grid gap-4">
        {items.map(item => (
          <div
            key={item.id}
            className="bg-card rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow"
          >
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
              <div className="flex flex-col items-end gap-2">
                <span className="text-lg font-extrabold text-primary">{formatPrice(item.price)}</span>
                <Button size="sm" className="rounded-full" onClick={() => handleAdd(item)}>
                  <Plus className="h-4 w-4 mr-1" /> Adicionar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Doces
  if (category === 'doces') {
    return (
      <div className="grid gap-3">
        {items.map(item => (
          <div
            key={item.id}
            className="bg-card rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-bold text-foreground">🍫 {item.name}</h3>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-lg font-extrabold text-primary">{formatPrice(item.price)}</span>
                <Button size="sm" className="rounded-full" onClick={() => handleAdd(item)}>
                  <Plus className="h-4 w-4 mr-1" /> Adicionar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Adicionais - grid
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {items.map(item => (
        <div
          key={item.id}
          className="bg-card rounded-xl p-3 shadow-sm border text-center hover:shadow-md transition-shadow flex flex-col items-center gap-2"
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
  <div className="flex items-center justify-between bg-card rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow">
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

export default MenuSection;
