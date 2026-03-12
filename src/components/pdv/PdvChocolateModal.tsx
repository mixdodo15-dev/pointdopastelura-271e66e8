import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const CHOCOLATES = [
  'Laka', 'Laka Oreo', 'Ao Leite', 'Sonho de Valsa', 'Ouro Branco',
  'Diamante Negro', 'Suflair', 'Galak', 'Kit Kat', 'Prestígio',
];

interface Props {
  open: boolean;
  onClose: () => void;
  itemName: string;
  price: number;
  onConfirm: (flavor: string) => void;
}

const PdvChocolateModal = ({ open, onClose, itemName, price, onConfirm }: Props) => {
  const [selected, setSelected] = useState<string>('');

  const handleConfirm = () => {
    if (selected) {
      onConfirm(selected);
      setSelected('');
    }
  };

  const handleClose = () => { setSelected(''); onClose(); };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto bg-card border-2 border-[hsl(var(--pdv-accent))]">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold text-[hsl(var(--pdv-red))]">
            🍫 {itemName} — R$ {price.toFixed(2).replace('.', ',')}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Escolha 1 sabor <span className="text-[hsl(var(--pdv-red))] font-bold">(obrigatório)</span>
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-1.5">
          {CHOCOLATES.map(name => (
            <button
              key={name}
              onClick={() => setSelected(name)}
              className={cn(
                "flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-bold border-2 transition-all text-left",
                selected === name
                  ? "border-[hsl(var(--pdv-red))] bg-[hsl(var(--pdv-red))]/10 text-[hsl(var(--pdv-red))]"
                  : "border-border hover:border-[hsl(var(--pdv-accent))] hover:bg-[hsl(var(--pdv-accent))]/10"
              )}
            >
              {selected === name && <Check className="h-4 w-4 shrink-0" />}
              <span className="truncate">{name}</span>
            </button>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} className="rounded-xl">Cancelar</Button>
          <Button
            onClick={handleConfirm}
            disabled={!selected}
            className="rounded-xl bg-[hsl(var(--pdv-red))] hover:bg-[hsl(var(--pdv-red))]/90 text-white font-extrabold"
          >
            Adicionar • {selected || '...'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PdvChocolateModal;
