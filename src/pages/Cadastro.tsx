import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserPlus, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const Cadastro = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    street: '',
    number: '',
    neighborhood: '',
    complement: '',
    city: '',
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }
    if (form.password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Preencha nome e telefone.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;

      const user = data.user;
      if (user) {
        // Update profile with name and phone
        await supabase.from('profiles').update({
          display_name: form.name.trim(),
          phone: form.phone.trim(),
        }).eq('user_id', user.id);

        // Insert address
        if (form.street.trim() || form.city.trim()) {
          await supabase.from('addresses').insert({
            user_id: user.id,
            street: form.street.trim(),
            number: form.number.trim(),
            neighborhood: form.neighborhood.trim(),
            complement: form.complement.trim() || null,
            city: form.city.trim(),
          });
        }
      }

      toast.success('Conta criada com sucesso! Bem-vindo(a)!');
      navigate('/?checkout=true');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-primary" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Criar Conta
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Cadastre-se para fazer seus pedidos</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-lg space-y-4">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Dados pessoais</h3>

            <div className="space-y-1.5">
              <Label htmlFor="name">Nome completo *</Label>
              <Input id="name" placeholder="Seu nome" value={form.name} onChange={set('name')} required maxLength={100}
                className="h-11 rounded-xl bg-secondary border-0" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone *</Label>
              <Input id="phone" placeholder="(00) 00000-0000" value={form.phone} onChange={set('phone')} required maxLength={20} type="tel"
                className="h-11 rounded-xl bg-secondary border-0" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={form.email} onChange={set('email')} required maxLength={255}
                className="h-11 rounded-xl bg-secondary border-0" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha *</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" value={form.password}
                  onChange={set('password')} required minLength={6} className="h-11 rounded-xl bg-secondary border-0 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmar senha *</Label>
              <Input id="confirmPassword" type="password" placeholder="Repita a senha" value={form.confirmPassword}
                onChange={set('confirmPassword')} required minLength={6} className="h-11 rounded-xl bg-secondary border-0" />
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Endereço de entrega</h3>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="street">Rua</Label>
                <Input id="street" placeholder="Nome da rua" value={form.street} onChange={set('street')} maxLength={200}
                  className="h-11 rounded-xl bg-secondary border-0" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="number">Nº</Label>
                <Input id="number" placeholder="123" value={form.number} onChange={set('number')} maxLength={10}
                  className="h-11 rounded-xl bg-secondary border-0" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input id="neighborhood" placeholder="Bairro" value={form.neighborhood} onChange={set('neighborhood')} maxLength={100}
                  className="h-11 rounded-xl bg-secondary border-0" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" placeholder="Cidade" value={form.city} onChange={set('city')} maxLength={100}
                  className="h-11 rounded-xl bg-secondary border-0" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="complement">Complemento</Label>
              <Input id="complement" placeholder="Apto, bloco... (opcional)" value={form.complement} onChange={set('complement')} maxLength={100}
                className="h-11 rounded-xl bg-secondary border-0" />
            </div>
          </div>

          <Button type="submit" className="w-full rounded-xl py-5 text-sm font-bold gap-2" disabled={loading}>
            <UserPlus className="h-4 w-4" />
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <button type="button" onClick={() => navigate('/cliente-login')} className="text-primary font-semibold hover:underline">
              Entrar
            </button>
          </p>
        </form>

        <div className="text-center mt-4">
          <button onClick={() => navigate('/')} className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Voltar ao cardápio
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
