import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import type { MenuItem } from '@/data/menu';

const formatPrice = (price: number) =>
  `R$ ${price.toFixed(2).replace('.', ',')}`;

interface AdicionaisModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (adicionais: { name: string; price: number }[]) => void;
  adicionais: MenuItem[];
}

const AdicionaisModal = ({ open, onClose, onConfirm, adicionais }: AdicionaisModalProps) => {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConfirm = () => {
    const items = adicionais
      .filter(a => selected[a.id])
      .map(a => ({ name: a.name, price: a.price }));
    onConfirm(items);
    setSelected({});
  };

  const handleClose = () => {
    setSelected({});
    onClose();
  };

  const totalExtra = adicionais
    .filter(a => selected[a.id])
    .reduce((sum, a) => sum + a.price, 0);

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-sm max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" /> Adicionais
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-2 py-2">
          {adicionais.map(item => (
            <label
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-secondary transition-colors"
            >
              <Checkbox
                checked={!!selected[item.id]}
                onCheckedChange={() => toggle(item.id)}
              />
              <span className="flex-1 font-medium text-sm">{item.name}</span>
              <span className="text-sm font-bold text-primary">
                +{formatPrice(item.price)}
              </span>
            </label>
          ))}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {totalExtra > 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Adicionais: +{formatPrice(totalExtra)}
            </p>
          )}
          <Button className="w-full rounded-full" onClick={handleConfirm}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdicionaisModal;
