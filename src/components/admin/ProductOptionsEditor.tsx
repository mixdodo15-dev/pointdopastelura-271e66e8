import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, X } from 'lucide-react';
import type { OptionGroup } from '@/lib/productOptions';

export default function ProductOptionsEditor({ groups, onChange }: { groups: OptionGroup[]; onChange: (groups: OptionGroup[]) => void }) {
  const update = (index: number, patch: Partial<OptionGroup>) => onChange(groups.map((g, i) => i === index ? { ...g, ...patch } : g));
  return <div className="space-y-3">
    <div className="flex items-center justify-between gap-2">
      <Label className="font-bold">Opcionais</Label>
      <Button variant="outline" size="sm" onClick={() => onChange([...groups, { name: '', required: true, min: 1, max: 1, choices: [] }])}><Plus className="h-4 w-4 mr-1" /> Grupo</Button>
    </div>
    {groups.map((group, gi) => <div key={gi} className="border border-border rounded-lg p-3 space-y-3">
      <div className="flex gap-2">
        <Input aria-label={`Nome do grupo ${gi + 1}`} placeholder="Nome do grupo (ex: Molho)" value={group.name} onChange={e => update(gi, { name: e.target.value })} />
        <Button variant="ghost" size="icon" aria-label="Excluir grupo" onClick={() => onChange(groups.filter((_, i) => i !== gi))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Label className="space-y-1">Mín. escolhas<Input aria-label={`Mínimo ${gi + 1}`} type="number" min={0} value={group.min} onChange={e => { const min = Number(e.target.value); update(gi, { min, required: min > 0 }); }} /></Label>
        <Label className="space-y-1">Máx. escolhas<Input aria-label={`Máximo ${gi + 1}`} type="number" min={1} value={group.max} onChange={e => update(gi, { max: Number(e.target.value) })} /></Label>
      </div>
      <div className="flex items-center justify-between"><Label htmlFor={`required-${gi}`}>Obrigatório</Label><Switch id={`required-${gi}`} checked={group.required} onCheckedChange={required => update(gi, { required, min: required ? Math.max(1, group.min) : 0 })} /></div>
      {group.choices.map((choice, ci) => <div key={ci} className="flex items-center gap-2">
        <Input className="min-w-0 flex-1" aria-label={`Opção ${gi + 1}.${ci + 1}`} placeholder="Opção (ex: Vermelho)" value={choice.name} onChange={e => update(gi, { choices: group.choices.map((c, i) => i === ci ? { ...c, name: e.target.value } : c) })} />
        <Input className="w-20 text-primary font-bold" aria-label={`Preço ${gi + 1}.${ci + 1} (0 = grátis)`} type="number" min={0} step="0.01" value={choice.price} onChange={e => update(gi, { choices: group.choices.map((c, i) => i === ci ? { ...c, price: Number(e.target.value) } : c) })} />
        <Button variant="ghost" size="icon" aria-label="Excluir opção" onClick={() => update(gi, { choices: group.choices.filter((_, i) => i !== ci) })}><X className="h-4 w-4 text-destructive" /></Button>
      </div>)}
      <Button variant="outline" size="sm" className="w-full" onClick={() => update(gi, { choices: [...group.choices, { name: '', price: 0 }] })}><Plus className="h-4 w-4 mr-1" /> Adicionar opção</Button>
      <p className="text-xs text-muted-foreground">Valor em R$ · 0 = grátis</p>
    </div>)}
  </div>;
}