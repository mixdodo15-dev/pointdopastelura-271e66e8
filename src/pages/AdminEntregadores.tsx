import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, LogOut, Plus, Bike, Pencil, Power, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import EntregadorFormModal, { Entregador } from '@/components/admin/EntregadorFormModal';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const STATUS_META: Record<Entregador['status'], { label: string; className: string }> = {
  disponivel: { label: 'Disponível', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  em_entrega: { label: 'Em Entrega', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  inativo:    { label: 'Inativo',    className: 'bg-zinc-200 text-zinc-700 border-zinc-300' },
};

const AdminEntregadores = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<Entregador[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Entregador | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      const { data: roles } = await supabase
        .from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin');
      if (!roles || roles.length === 0) {
        toast.error('Acesso negado');
        navigate('/login');
        return;
      }
      await fetchAll();
      setLoading(false);
    };
    init();
  }, [navigate]);

  const fetchAll = async () => {
    const { data, error } = await supabase
      .from('entregadores')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Erro ao carregar entregadores');
      return;
    }
    setList((data as Entregador[]) || []);
  };

  useEffect(() => {
    const channel = supabase
      .channel('entregadores-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entregadores' }, fetchAll)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const toggleActive = async (e: Entregador) => {
    const { error } = await supabase
      .from('entregadores')
      .update({ active: !e.active, status: !e.active ? 'disponivel' : 'inativo' })
      .eq('id', e.id);
    if (error) toast.error('Erro ao atualizar');
    else toast.success(!e.active ? 'Entregador ativado' : 'Entregador desativado');
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('entregadores').delete().eq('id', id);
    setDeleteId(null);
    if (error) toast.error('Erro ao excluir (talvez tenha pedidos vinculados)');
    else toast.success('Entregador excluído');
  };

  const counts = {
    disponivel: list.filter(e => e.active && e.status === 'disponivel').length,
    em_entrega: list.filter(e => e.active && e.status === 'em_entrega').length,
    inativo:    list.filter(e => !e.active || e.status === 'inativo').length,
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Carregando...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-3 px-4 shadow-lg sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="hover:opacity-80">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-extrabold">Gestão de Entregadores</h1>
              <p className="text-xs opacity-80">Point do Pastel</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20"
            onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }}>
            <LogOut className="h-4 w-4 mr-1" /> Sair
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-xs text-muted-foreground font-semibold">Disponíveis</p>
            <p className="text-2xl font-extrabold text-emerald-600">{counts.disponivel}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-xs text-muted-foreground font-semibold">Em Entrega</p>
            <p className="text-2xl font-extrabold text-amber-600">{counts.em_entrega}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-xs text-muted-foreground font-semibold">Inativos</p>
            <p className="text-2xl font-extrabold text-zinc-500">{counts.inativo}</p>
          </div>
        </div>

        <Button className="w-full rounded-full h-12 font-bold gap-2" onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus className="h-5 w-5" /> Novo Entregador
        </Button>

        {list.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Nenhum entregador cadastrado ainda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {list.map(e => {
              const meta = STATUS_META[e.active ? e.status : 'inativo'];
              return (
                <div key={e.id} className="bg-card border border-border rounded-2xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Bike className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold truncate">{e.nome}</p>
                        <Badge variant="outline" className={`${meta.className} text-[10px] font-bold`}>{meta.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{e.telefone}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {e.veiculo}{e.placa ? ` • ${e.placa}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditing(e); setModalOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => toggleActive(e)}>
                      <Power className="h-3.5 w-3.5 mr-1" /> {e.active ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteId(e.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <EntregadorFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        entregador={editing}
        onSaved={fetchAll}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir entregador</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Pedidos vinculados ficarão sem entregador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && remove(deleteId)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminEntregadores;
