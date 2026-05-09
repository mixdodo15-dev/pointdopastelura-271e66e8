import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bike } from 'lucide-react';
import { toast } from 'sonner';

interface Entregador {
  id: string;
  nome: string;
  veiculo: string;
  placa: string | null;
  telefone: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: number | null;
  onAssigned: () => void;
}

const AtribuirEntregadorModal = ({ open, onClose, orderId, orderNumber, onAssigned }: Props) => {
  const [entregadores, setEntregadores] = useState<Entregador[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('entregadores')
        .select('id, nome, veiculo, placa, telefone')
        .eq('status', 'disponivel')
        .eq('active', true)
        .order('nome');
      setEntregadores((data as Entregador[]) || []);
      setLoading(false);
    };
    load();
  }, [open]);

  const assign = async (e: Entregador) => {
    setAssigningId(e.id);
    const { error: orderErr } = await supabase
      .from('orders')
      .update({ entregador_id: e.id, status: 'out_for_delivery' as any })
      .eq('id', orderId);
    if (orderErr) {
      setAssigningId(null);
      toast.error('Erro ao atribuir pedido');
      return;
    }
    await supabase.from('entregadores').update({ status: 'em_entrega' }).eq('id', e.id);
    setAssigningId(null);
    toast.success(`Pedido atribuído a ${e.nome}`);
    onAssigned();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Atribuir Entregador</DialogTitle>
          <DialogDescription>
            Pedido Point-{String(orderNumber || 0).padStart(4, '0')} — selecione um entregador disponível.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <p className="text-center text-muted-foreground py-6">Carregando...</p>
          ) : entregadores.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">Nenhum entregador disponível no momento.</p>
          ) : (
            entregadores.map(e => (
              <button
                key={e.id}
                onClick={() => assign(e)}
                disabled={assigningId !== null}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-secondary transition-all text-left disabled:opacity-50"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Bike className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{e.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.veiculo}{e.placa ? ` • ${e.placa}` : ''}
                  </p>
                </div>
                {assigningId === e.id && <span className="text-xs">Atribuindo...</span>}
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AtribuirEntregadorModal;
