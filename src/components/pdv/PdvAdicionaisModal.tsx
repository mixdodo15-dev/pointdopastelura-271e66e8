import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const ADICIONAIS = [
  { name: 'Catupiry', price: 4.99 },
  { name: 'Cheddar', price: 4.99 },
  { name: 'Doritos', price: 4.99 },
  { name: 'Bacon', price: 4.99 },
  { name: 'Mussarela', price: 3.99 },
  { name: 'Calabresa', price: 3.99 },
  { name: 'Costela', price: 7.00 },
  { name: 'Azeitona', price: 2.99 },
  { name: 'Pepperoni', price: 4.99 },
  { name: 'Frango', price: 4.99 },
  { name: 'Queijo', price: 3.99 },
  { name: 'Palmito', price: 3.99 },
];

interface Props {
  open: boolean;
  onClose: () => void;
  itemName: string;
  price: number;
  onConfirm: (adicionais: { name: string; price: number }[]) => void;
}

const formatPrice = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const PdvAdicionaisModal = ({ open, onClose, itemName, price, onConfirm }: Props) => {
  const [selected, setSelected] = useState<{ name: string; price: number }[]>([]);

  const toggle = (item: { name: string; price: number }) => {
    setSelected(prev => {
      if (prev.find(a => a.name === item.name)) return prev.filter(a => a.name !== item.name);
      return [...prev, item];
    });
  };

  const totalAdicionais = selected.reduce((s, a) => s + a.price, 0);

  const handleConfirm = () => {
    onConfirm(selected);
    setSelected([]);
  };

  const handleClose = () => { setSelected([]); onClose(); };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-card border-2 border-[hsl(var(--pdv-accent))]">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold text-[hsl(var(--pdv-red))]">
            ⭐ {itemName} — {formatPrice(price)}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Adicionais opcionais (0 obrigatórios)
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {ADICIONAIS.map(item => (
            <button
              key={item.name}
              onClick={() => toggle(item)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-sm font-bold border-2 transition-all",
                selected.find(a => a.name === item.name)
                  ? "border-[hsl(var(--pdv-red))] bg-[hsl(var(--pdv-red))]/10 text-[hsl(var(--pdv-red))]"
                  : "border-border hover:border-[hsl(var(--pdv-accent))] hover:bg-[hsl(var(--pdv-accent))]/10"
              )}
            >
              <div className="flex items-center gap-1">
                {selected.find(a => a.name === item.name) && <Check className="h-3.5 w-3.5 shrink-0" />}
                <span className="truncate">{item.name}</span>
              </div>
              <span className="text-xs font-extrabold text-[hsl(var(--pdv-accent))]">+{formatPrice(item.price)}</span>
            </button>
          ))}
        </div>

        {selected.length > 0 && (
          <div className="bg-secondary/50 rounded-xl p-3 text-sm">
            <p className="font-bold text-foreground">Adicionais: {selected.map(a => a.name).join(', ')}</p>
            <p className="font-extrabold text-[hsl(var(--pdv-red))]">+{formatPrice(totalAdicionais)}</p>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} className="rounded-xl">Cancelar</Button>
          <Button
            onClick={handleConfirm}
            className="rounded-xl bg-[hsl(var(--pdv-red))] hover:bg-[hsl(var(--pdv-red))]/90 text-white font-extrabold"
          >
            {selected.length > 0
              ? `Adicionar • ${formatPrice(price + totalAdicionais)}`
              : `Adicionar sem adicionais • ${formatPrice(price)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PdvAdicionaisModal;
