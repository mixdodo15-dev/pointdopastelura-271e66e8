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
  onConfirm: (flavors: string[]) => void;
  customFlavors?: string[];
}

const FlavorModal = ({ open, onClose, maxFlavors, itemName, price, onConfirm, customFlavors }: FlavorModalProps) => {
  const [selected, setSelected] = useState<string[]>([]);
  const { flavors } = useFlavors();

  const toggle = (name: string) => {
    setSelected(prev => {
      if (prev.includes(name)) return prev.filter(f => f !== name);
      if (prev.length >= maxFlavors) return prev;
      return [...prev, name];
    });
  };

  const handleConfirm = () => {
    if (selected.length > 0) {
      onConfirm(selected);
      setSelected([]);
    }
  };

  const handleClose = () => {
    setSelected([]);
    onClose();
  };

  const salgados = flavors.filter(f => f.type === 'salgado');
  const doces = flavors.filter(f => f.type === 'doce');

  // If custom flavors provided, show simple list
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
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleConfirm} disabled={selected.length === 0}>
              Adicionar ao carrinho
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
