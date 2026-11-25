import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { MenuItem } from '@/data/menu';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Props {
  products: MenuItem[];
  onPick: (name: string) => void;
}

const SUGESTOES = ['Algo bem queijudo', 'Um doce com chocolate', 'Algo barato para dividir', 'Bem salgado com bacon'];

const AiRecommender = ({ products, onPick }: Props) => {
  const [open, setOpen] = useState(false);
  const [desejo, setDesejo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recs, setRecs] = useState<{ item: MenuItem; motivo: string }[] | null>(null);

  const pedir = async () => {
    if (!desejo.trim() || loading) return;
    setLoading(true); setError(''); setRecs(null);
    const produtos = products.map(p => ({ id: p.id, name: p.name, description: p.description, price: p.price, category: p.category }));
    const { data, error: err } = await supabase.functions.invoke('recomendar-produtos', { body: { desejo, produtos } });
    setLoading(false);
    if (err || data?.error) {
      let msg = data?.error;
      try { msg = msg || (await (err as any)?.context?.json())?.error; } catch { /* ignore */ }
      setError(msg || 'Não foi possível gerar recomendações agora.');
      return;
    }
    const byId = new Map(products.map(p => [String(p.id), p]));
    setRecs((data?.recomendacoes ?? []).flatMap((r: { id: string; motivo: string }) => {
      const item = byId.get(r.id);
      return item ? [{ item, motivo: r.motivo }] : [];
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="mx-auto mt-2 flex w-full max-w-3xl items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-extrabold text-primary-foreground shadow-md shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="h-4 w-4" /> Não sabe o que pedir? Pergunte à IA
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Do que você está com vontade?</DialogTitle>
          <DialogDescription>Descreva com suas palavras e a IA indica o que combina no cardápio.</DialogDescription>
        </DialogHeader>
        <Textarea
          aria-label="Descreva o que você quer comer"
          value={desejo}
          onChange={e => setDesejo(e.target.value)}
          maxLength={500}
          placeholder="Ex: quero algo salgado, com muito queijo e não muito caro"
          rows={3}
        />
        <div className="flex flex-wrap gap-2">
          {SUGESTOES.map(s => (
            <button key={s} type="button" onClick={() => setDesejo(s)} className="rounded-full border border-border px-3 py-1 text-xs font-semibold hover:border-primary hover:text-primary">
              {s}
            </button>
          ))}
        </div>
        <Button onClick={pedir} disabled={!desejo.trim() || loading} className="h-11 rounded-full font-extrabold">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Pensando...</> : 'Recomendar para mim'}
        </Button>
        {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}
        {recs && recs.length === 0 && <p className="text-sm text-muted-foreground">Não encontrei nada parecido. Tente descrever de outro jeito.</p>}
        {recs && recs.length > 0 && (
          <ul className="space-y-2">
            {recs.map(({ item, motivo }) => (
              <li key={item.id} className="rounded-[14px] border border-border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold">{item.name}</p>
                  <p className="whitespace-nowrap font-extrabold text-primary">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                </div>
                {motivo && <p className="mt-1 text-xs text-muted-foreground">{motivo}</p>}
                <Button size="sm" className="mt-2 rounded-full font-extrabold" onClick={() => { setOpen(false); onPick(item.name); }}>
                  Ver no cardápio
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AiRecommender;
