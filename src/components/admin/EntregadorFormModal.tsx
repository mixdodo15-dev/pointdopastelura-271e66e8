import { useEffect, useState } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export interface Entregador {
  id: string;
  nome: string;
  telefone: string;
  veiculo: string;
  placa: string | null;
  status: 'disponivel' | 'em_entrega' | 'inativo';
  active: boolean;
}

const schema = z.object({
  nome: z.string().trim().min(2, 'Nome muito curto').max(80),
  telefone: z.string().trim().min(10, 'Telefone inválido').max(20),
  veiculo: z.string().trim().min(2, 'Informe o veículo').max(40),
  placa: z.string().trim().max(10).optional().or(z.literal('')),
});

interface Props {
  open: boolean;
  onClose: () => void;
  entregador?: Entregador | null;
  onSaved: () => void;
}

const EntregadorFormModal = ({ open, onClose, entregador, onSaved }: Props) => {
  const [form, setForm] = useState({ nome: '', telefone: '', veiculo: '', placa: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        nome: entregador?.nome ?? '',
        telefone: entregador?.telefone ?? '',
        veiculo: entregador?.veiculo ?? '',
        placa: entregador?.placa ?? '',
      });
    }
  }, [open, entregador]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSaving(true);
    const payload = {
      nome: parsed.data.nome,
      telefone: parsed.data.telefone,
      veiculo: parsed.data.veiculo,
      placa: parsed.data.placa || null,
    };
    const { error } = entregador
      ? await supabase.from('entregadores').update(payload).eq('id', entregador.id)
      : await supabase.from('entregadores').insert(payload);
    setSaving(false);
    if (error) {
      toast.error('Erro ao salvar entregador');
      return;
    }
    toast.success(entregador ? 'Entregador atualizado!' : 'Entregador cadastrado!');
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{entregador ? 'Editar Entregador' : 'Novo Entregador'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Nome *</Label>
            <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} maxLength={80} />
          </div>
          <div>
            <Label>Telefone (WhatsApp) *</Label>
            <Input
              value={form.telefone}
              onChange={e => setForm({ ...form, telefone: e.target.value })}
              placeholder="(34) 99999-9999"
              maxLength={20}
            />
          </div>
          <div>
            <Label>Veículo *</Label>
            <Input
              value={form.veiculo}
              onChange={e => setForm({ ...form, veiculo: e.target.value })}
              placeholder="Moto Honda CG"
              maxLength={40}
            />
          </div>
          <div>
            <Label>Placa</Label>
            <Input
              value={form.placa}
              onChange={e => setForm({ ...form, placa: e.target.value.toUpperCase() })}
              placeholder="ABC-1D23"
              maxLength={10}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EntregadorFormModal;
