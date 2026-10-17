import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, ListChecks } from 'lucide-react';
import type { OptionGroup } from '@/lib/productOptions';

interface Props {
  open: boolean;
  onClose: () => void;
  itemName: string;
  price: number;
  groups: OptionGroup[];
  onConfirm: (selected: { group: string; name: string; price: number }[]) => void;
}

const formatPrice = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const PdvOptionsModal = ({ open, onClose, itemName, price, groups, onConfirm }: Props) => {
  // selections[groupName] = array of chosen choice names
  const [selections, setSelections] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (open) setSelections({});
  }, [open, itemName]);

  const toggle = (group: OptionGroup, choiceName: string) => {
    setSelections(prev => {
      const current = prev[group.name] || [];
      if (current.includes(choiceName)) {
        return { ...prev, [group.name]: current.filter(c => c !== choiceName) };
      }
      if (current.length >= group.max) {
        // max 1: replace selection (radio behavior)
        if (group.max === 1) return { ...prev, [group.name]: [choiceName] };
        return prev;
      }
      return { ...prev, [group.name]: [...current, choiceName] };
    });
  };

  const isValid = groups.every(g => {
    const count = (selections[g.name] || []).length;
    return count >= g.min && count <= g.max;
  });

  const selectedItems = groups.flatMap(g =>
    (selections[g.name] || []).map(choiceName => {
      const choice = g.choices.find(c => c.name === choiceName);
      return { group: g.name, name: choiceName, price: choice?.price || 0 };
    })
  );

  const extrasTotal = selectedItems.reduce((s, i) => s + i.price, 0);

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(selectedItems);
    setSelections({});
  };

  const handleClose = () => { setSelections({}); onClose(); };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-card border-2 border-[hsl(var(--pdv-accent))]">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold text-[hsl(var(--pdv-red))] flex items-center gap-2">
            <ListChecks className="h-5 w-5" /> {itemName} — {formatPrice(price)}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Personalize seu pedido</p>
        </DialogHeader>

        <div className="space-y-4">
          {groups.map(group => {
            const selected = selections[group.name] || [];
            const missing = selected.length < group.min;
            return (
              <div key={group.name} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-extrabold text-sm text-foreground">{group.name}</h3>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    group.required
                      ? missing ? "bg-destructive/10 text-destructive" : "bg-green-100 text-green-700"
                      : "bg-secondary text-muted-foreground"
                  )}>
                    {group.required
                      ? `Obrigatório • ${group.min === group.max ? `escolha ${group.min}` : `${group.min}-${group.max}`}`
                      : `Opcional • até ${group.max}`}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {group.choices.map(choice => {
                    const active = selected.includes(choice.name);
                    return (
                      <button
                        key={choice.name}
                        onClick={() => toggle(group, choice.name)}
                        className={cn(
                          "flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-bold border-2 transition-all text-left",
                          active
                            ? "border-[hsl(var(--pdv-red))] bg-[hsl(var(--pdv-red))]/10 text-[hsl(var(--pdv-red))]"
                            : "border-border hover:border-[hsl(var(--pdv-accent))] hover:bg-[hsl(var(--pdv-accent))]/10"
                        )}
                      >
                        <span className="flex items-center gap-1.5 min-w-0">
                          {active && <Check className="h-4 w-4 shrink-0" />}
                          <span className="truncate">{choice.name}</span>
                        </span>
                        <span className={cn("text-xs font-extrabold shrink-0", choice.price > 0 ? "text-[hsl(var(--pdv-accent))]" : "text-muted-foreground")}>
                          {choice.price > 0 ? `+${formatPrice(choice.price)}` : 'Grátis'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} className="rounded-xl">Cancelar</Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid}
            className="rounded-xl bg-[hsl(var(--pdv-red))] hover:bg-[hsl(var(--pdv-red))]/90 text-white font-extrabold"
          >
            Adicionar • {formatPrice(price + extrasTotal)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PdvOptionsModal;
