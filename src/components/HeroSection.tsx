import { User, LogIn, UserPlus } from 'lucide-react';
import { ShoppingBag, Clock, Bike } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import heroBg from '@/assets/hero-pastel.jpg';
import logoImg from '@/assets/logo-point.jpg';
import { useRestaurantStatus } from '@/hooks/useRestaurantStatus';
import { supabase } from '@/integrations/supabase/client';
import ThemeToggle from './ThemeToggle';
import { Button } from './ui/button';

const HeroSection = () => {
  const { isOpen, label, subtitle } = useRestaurantStatus();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleUserButton = () => {
    if (user) {
      navigate('/minha-conta');
    } else {
      navigate('/cliente-login');
    }
  };

  return (
    <section className="relative w-full">
      {/* Banner with overlay */}
      <div className="relative w-full h-56 sm:h-64 md:h-72 overflow-hidden">
        <motion.img
          src={heroBg}
          alt="Pastel artesanal"
          className="w-full h-full object-cover"
          loading="eager"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(0,0%,0%,0.4)] via-[hsl(0,0%,0%,0.2)] to-[hsl(0,0%,0%,0.7)]" />

        {/* Top icons */}
        <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
          <ThemeToggle />
          <button
            onClick={handleUserButton}
            className="p-2 rounded-full bg-primary hover:bg-primary/80 transition-colors shadow-lg"
          >
            <User className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>
      </div>

      {/* Logo circular */}
      <motion.div
        className="relative z-10 flex justify-center -mt-16"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3, type: 'spring', stiffness: 200 }}
      >
        <div className="w-28 h-28 rounded-full bg-card border-4 border-primary shadow-xl overflow-hidden">
          <img src={logoImg} alt="Point do Pastel" className="w-full h-full object-cover" />
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div
        className="relative z-10 max-w-md mx-auto px-4 mt-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="bg-card rounded-[20px] shadow-lg p-5 space-y-4">
          <div className="text-center">
            <h2
              className="text-xl font-black text-foreground tracking-tight"
              style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900 }}
            >
              POINT DO PASTEL
            </h2>
            <div className="flex flex-col items-center gap-0.5 mt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-primary-foreground transition-all duration-300 ${
                  isOpen
                    ? 'bg-[hsl(145,100%,39%)] shadow-[0_0_12px_hsl(145,100%,39%,0.4)] animate-pulse'
                    : 'bg-destructive shadow-[0_0_12px_hsl(0,84%,60%,0.3)]'
                }`}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <span className={`w-2 h-2 rounded-full bg-primary-foreground ${!isOpen ? 'opacity-80' : ''}`} />
                {label}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                {subtitle}
              </span>
            </div>
          </div>

          {/* Login/Register area - only when not logged in */}
          <AnimatePresence>
            {!loading && !user && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-secondary/60 rounded-2xl p-4 space-y-3 border border-border/50">
                  <p className="text-center text-xs font-medium text-muted-foreground">
                    Faça login para acompanhar seus pedidos e ganhar benefícios! 🎉
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      className="flex-1 rounded-xl py-5 text-sm font-bold gap-2"
                      onClick={() => navigate('/cliente-login')}
                    >
                      <LogIn className="h-4 w-4" />
                      Entrar
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl py-5 text-sm font-bold gap-2 border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() => navigate('/cadastro')}
                    >
                      <UserPlus className="h-4 w-4" />
                      Cadastrar
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Welcome back - when logged in */}
          <AnimatePresence>
            {!loading && user && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => navigate('/minha-conta')}
                  className="w-full bg-primary/10 rounded-2xl p-3 flex items-center gap-3 hover:bg-primary/15 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      Olá, {user.user_metadata?.display_name || user.email?.split('@')[0] || 'Cliente'}! 👋
                    </p>
                    <p className="text-[11px] text-muted-foreground">Toque para ver sua conta</p>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delivery options */}
          <div className="flex items-center justify-center gap-3">
            <motion.div
              className="flex items-center gap-2 bg-secondary rounded-xl px-4 py-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingBag className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Retirada</span>
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] font-medium text-muted-foreground">30 min</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-2 bg-secondary rounded-xl px-4 py-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bike className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Delivery</span>
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] font-medium text-muted-foreground">60 min</span>
            </motion.div>
          </div>

          {/* Minimum order */}
          <p className="text-center text-xs font-bold text-primary">
            Pedido mínimo: R$ 10,00
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
