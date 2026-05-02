import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useFlavors } from '@/hooks/useFlavors';
import { cn } from '@/lib/utils';
import { Check, Beef, Cookie } from 'lucide-react';

interface FlavorModalProps {
  open: boolean;
  onClose: () => void;
  maxFlavors: number;
  itemName: string;
  price: number;
  onConfirm: (flavors: string[], extras?: { name: string; price: number }[]) => void;
  customFlavors?: string[];
}

const SWEET_EXTRAS = [
  { name: 'Morango', price: 5 },
  { name: 'Banana', price: 5 },
  { name: 'Queijo', price: 5 },
];

const formatPriceBR = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const FlavorModal = ({ open, onClose, maxFlavors, itemName, price, onConfirm, customFlavors }: FlavorModalProps) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [extras, setExtras] = useState<{ name: string; price: number }[]>([]);
  const { flavors } = useFlavors();

  const toggle = (name: string) => {
    setSelected(prev => {
      if (prev.includes(name)) return prev.filter(f => f !== name);
      if (prev.length >= maxFlavors) return prev;
      return [...prev, name];
    });
  };

  const toggleExtra = (item: { name: string; price: number }) => {
    setExtras(prev =>
      prev.find(e => e.name === item.name)
        ? prev.filter(e => e.name !== item.name)
        : [...prev, item]
    );
  };

  const handleConfirm = () => {
    if (selected.length > 0) {
      onConfirm(selected, extras);
      setSelected([]);
      setExtras([]);
    }
  };

  const handleClose = () => {
    setSelected([]);
    setExtras([]);
    onClose();
  };

  const salgados = flavors.filter(f => f.type === 'salgado');
  const doces = flavors.filter(f => f.type === 'doce');
  const extrasTotal = extras.reduce((s, e) => s + e.price, 0);

  // If custom flavors provided, show simple list (Pastel Doce Especial)
  if (customFlavors) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {itemName} — R$ {price.toFixed(2).replace('.', ',')}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Selecione {maxFlavors === 1 ? '1 sabor' : `até ${maxFlavors} sabores`} ({selected.length}/{maxFlavors})
            </p>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {customFlavors.map(name => (
              <button
                key={name}
                onClick={() => toggle(name)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all text-left",
                  selected.includes(name)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                )}
              >
                {selected.includes(name) && <Check className="h-3.5 w-3.5 shrink-0" />}
                <span className="truncate">{name}</span>
              </button>
            ))}
          </div>

          <div className="mt-2">
            <h3 className="font-bold text-sm mb-2">➕ Adicionais (opcional)</h3>
            <div className="grid grid-cols-3 gap-2">
              {SWEET_EXTRAS.map(item => {
                const active = !!extras.find(e => e.name === item.name);
                return (
                  <button
                    key={item.name}
                    onClick={() => toggleExtra(item)}
                    className={cn(
                      "flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs font-bold border-2 transition-all",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="flex items-center gap-1">
                      {active && <Check className="h-3 w-3" />}
                      {item.name}
                    </span>
                    <span className="text-[10px] text-accent font-extrabold">+{formatPriceBR(item.price)}</span>
                  </button>
                );
              })}
            </div>
            {extras.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Adicionais: +{formatPriceBR(extrasTotal)}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleConfirm} disabled={selected.length === 0}>
              Adicionar • {formatPriceBR(price + extrasTotal)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {itemName} — R$ {price.toFixed(2).replace('.', ',')}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Selecione {maxFlavors === 1 ? '1 sabor' : `até ${maxFlavors} sabores`} ({selected.length}/{maxFlavors})
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="flex items-center gap-2 font-bold text-sm mb-2">
              <Beef className="h-4 w-4 text-primary" /> Salgados
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {salgados.map(f => (
                <button
                  key={f.name}
                  onClick={() => toggle(f.name)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all text-left",
                    selected.includes(f.name)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {selected.includes(f.name) && <Check className="h-3.5 w-3.5 shrink-0" />}
                  <span className="truncate">{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="flex items-center gap-2 font-bold text-sm mb-2">
              <Cookie className="h-4 w-4 text-accent" /> Doces
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {doces.map(f => (
                <button
                  key={f.name}
                  onClick={() => toggle(f.name)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all text-left",
                    selected.includes(f.name)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {selected.includes(f.name) && <Check className="h-3.5 w-3.5 shrink-0" />}
                  <span className="truncate">{f.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={selected.length === 0}>
            Adicionar ao carrinho
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FlavorModal;
