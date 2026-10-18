import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { optionsSelectionValid, type OptionGroup, type SelectedOption } from '@/lib/productOptions';

export default function ProductOptionsModal({ name, price, groups, onClose, onConfirm }: { name: string; price: number; groups: OptionGroup[]; onClose: () => void; onConfirm: (selected: SelectedOption[]) => void }) {
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const valid = optionsSelectionValid(groups, selections);
  const selected = groups.flatMap(g => g.choices.filter(c => (selections[g.name] || []).includes(c.name)).map(c => ({ ...c, group: g.name })));
  const total = price + selected.reduce((sum, c) => sum + c.price, 0);
  const format = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
      <DialogHeader><DialogTitle className="break-words">{name}</DialogTitle></DialogHeader>
      {groups.map((g, gi) => {
        const current = selections[g.name] || [];
        return <div key={g.name} className="space-y-2 border-b border-border pb-4">
          <h3 className="font-bold">{g.name}</h3>
          <p className="text-xs text-muted-foreground">{g.min > 0 || g.required ? `Obrigatório · escolha ${g.min === g.max ? g.max : `${g.min} a ${g.max}`}` : `Opcional · até ${g.max}`}</p>
          {g.choices.map((c, ci) => <Label key={c.name} htmlFor={`option-${gi}-${ci}`} className="flex items-center gap-3 py-2 cursor-pointer">
            <Checkbox id={`option-${gi}-${ci}`} checked={current.includes(c.name)} disabled={!current.includes(c.name) && g.max > 1 && current.length >= g.max} onCheckedChange={() => setSelections(prev => ({ ...prev, [g.name]: current.includes(c.name) ? current.filter(n => n !== c.name) : g.max === 1 ? [c.name] : [...current, c.name] }))} />
            <span className="flex-1 min-w-0 break-words">{c.name}</span><span className="text-primary font-bold shrink-0">{c.price ? `+ ${format(c.price)}` : 'Grátis'}</span>
          </Label>)}
        </div>;
      })}
      <DialogFooter><Button variant="outline" onClick={onClose}>Cancelar</Button><Button disabled={!valid} onClick={() => { if (valid) onConfirm(selected); }}>Adicionar · {format(total)}</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}