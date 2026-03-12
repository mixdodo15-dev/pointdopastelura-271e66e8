import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const SALGADOS = ['Carne', 'Frango', 'Pizza', 'Bacon', 'Queijo', 'Mussarela', 'Calabresa', 'Catupiry', 'Cheddar', 'Azeitona', 'Palmito', 'Milho', 'Jiló', 'Brócolis'];
const DOCES = ['Goiabada', 'Banana com canela', 'Doce de leite', 'Coco ralado'];

interface Props {
  open: boolean;
  onClose: () => void;
  maxFlavors: number;
  itemName: string;
  price: number;
  onConfirm: (flavors: string[]) => void;
}

const PdvFlavorModal = ({ open, onClose, maxFlavors, itemName, price, onConfirm }: Props) => {
  const [selected, setSelected] = useState<string[]>([]);

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

  const handleClose = () => { setSelected([]); onClose(); };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-card border-2 border-[hsl(var(--pdv-accent))]">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold text-[hsl(var(--pdv-red))]">
            🥟 {itemName} — R$ {price.toFixed(2).replace('.', ',')}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Selecione {maxFlavors === 1 ? '1 sabor' : `até ${maxFlavors} sabores`} ({selected.length}/{maxFlavors})
          </p>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <h3 className="font-extrabold text-sm mb-2 text-[hsl(var(--pdv-red))]">🥩 Salgados</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {SALGADOS.map(name => (
                <button
                  key={name}
                  onClick={() => toggle(name)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold border-2 transition-all text-left",
                    selected.includes(name)
                      ? "border-[hsl(var(--pdv-red))] bg-[hsl(var(--pdv-red))]/10 text-[hsl(var(--pdv-red))]"
                      : "border-border hover:border-[hsl(var(--pdv-accent))] hover:bg-[hsl(var(--pdv-accent))]/10"
                  )}
                >
                  {selected.includes(name) && <Check className="h-4 w-4 shrink-0" />}
                  <span className="truncate">{name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-extrabold text-sm mb-2 text-[hsl(var(--pdv-accent))]">🍬 Doces</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {DOCES.map(name => (
                <button
                  key={name}
                  onClick={() => toggle(name)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold border-2 transition-all text-left",
                    selected.includes(name)
                      ? "border-[hsl(var(--pdv-accent))] bg-[hsl(var(--pdv-accent))]/10 text-[hsl(var(--pdv-accent))]"
                      : "border-border hover:border-[hsl(var(--pdv-accent))] hover:bg-[hsl(var(--pdv-accent))]/10"
                  )}
                >
                  {selected.includes(name) && <Check className="h-4 w-4 shrink-0" />}
                  <span className="truncate">{name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} className="rounded-xl">Cancelar</Button>
          <Button
            onClick={handleConfirm}
            disabled={selected.length === 0}
            className="rounded-xl bg-[hsl(var(--pdv-red))] hover:bg-[hsl(var(--pdv-red))]/90 text-white font-extrabold"
          >
            Adicionar ({selected.length}/{maxFlavors})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PdvFlavorModal;
