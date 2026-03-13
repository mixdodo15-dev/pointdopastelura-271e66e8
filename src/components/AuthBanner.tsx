import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LogIn, UserPlus, ChevronRight, UserCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const AuthBanner = () => {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) fetchProfile(session.user.id);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) fetchProfile(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', userId)
      .maybeSingle();
    setDisplayName(data?.display_name || null);
  };

  if (loading) return null;

  // Logged in: greeting card
  if (user) {
    const firstName = displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Cliente';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="max-w-md mx-auto px-4 mt-4"
      >
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <UserCircle className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">
              {greeting}, {firstName}! 👋
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Star className="h-3 w-3 text-primary" />
              Acumule pontos a cada pedido!
            </p>
          </div>
          <Button
            onClick={() => navigate('/minha-conta')}
            size="sm"
            className="rounded-xl font-bold shrink-0"
          >
            Minha Conta
          </Button>
        </div>
      </motion.div>
    );
  }

  // Not logged in: login/signup CTA
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="max-w-md mx-auto px-4 mt-4"
    >
      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 space-y-3">
        <div className="text-center space-y-1">
          <h3 className="text-base font-bold text-foreground">
            Faça login para uma experiência completa!
          </h3>
          <p className="text-xs text-muted-foreground">
            Acompanhe seus pedidos, acumule pontos e receba ofertas exclusivas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/cliente-login')}
            className="flex-1 rounded-xl font-bold gap-2"
            size="lg"
          >
            <LogIn className="h-4 w-4" />
            Entrar
          </Button>
          <Button
            onClick={() => navigate('/cadastro')}
            variant="outline"
            className="flex-1 rounded-xl font-bold gap-2 border-primary/30 text-primary hover:bg-primary/10"
            size="lg"
          >
            <UserPlus className="h-4 w-4" />
            Cadastrar
          </Button>
        </div>

        <button
          onClick={() => navigate('/cliente-login')}
          className="flex items-center justify-center gap-1 w-full text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          Esqueceu sua senha? Recupere aqui
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  );
};

export default AuthBanner;
