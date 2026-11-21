import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgePercent, ClipboardList, Home, ShoppingBag, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';

const tabs = [
  { id: 'inicio', label: 'Início', icon: Home },
  { id: 'pedidos', label: 'Pedidos', icon: ClipboardList },
  { id: 'sacola', label: 'Sacola', icon: ShoppingBag },
  { id: 'promocoes', label: 'Promoções', icon: BadgePercent },
  { id: 'perfil', label: 'Perfil', icon: UserRound },
] as const;

type TabId = (typeof tabs)[number]['id'];

interface BottomNavProps {
  onCartOpen: () => void;
}

const BottomNav = ({ onCartOpen }: BottomNavProps) => {
  const [active, setActive] = useState<TabId>('inicio');
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const scrollToPromotions = () => {
    const section = document.getElementById('promocoes');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    document.getElementById('cardapio')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    toast.info('Nenhuma promoção disponível no momento. Confira nosso cardápio!');
  };

  const handleClick = (id: TabId) => {
    setActive(id);

    switch (id) {
      case 'inicio':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'pedidos':
        navigate('/meus-pedidos');
        break;
      case 'sacola':
        onCartOpen();
        break;
      case 'promocoes':
        scrollToPromotions();
        break;
      case 'perfil':
        navigate('/minha-conta');
        break;
    }
  };

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] bg-bottom-nav pb-[env(safe-area-inset-bottom)] text-bottom-nav-foreground shadow-[0_-6px_24px_hsl(var(--foreground)/0.16)]"
    >
      <div className="relative mx-auto grid h-[72px] max-w-3xl grid-cols-5 items-stretch">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;

          if (id === 'sacola') {
            return (
              <div key={id} className="relative flex items-start justify-center">
                <button
                  type="button"
                  onClick={() => handleClick(id)}
                  aria-label={`Abrir sacola${totalItems > 0 ? `, ${totalItems} ${totalItems === 1 ? 'item' : 'itens'}` : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  className="absolute -top-7 flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-full border-4 border-card bg-card text-primary shadow-[0_5px_18px_hsl(var(--foreground)/0.24)] transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95"
                >
                  <span className="relative">
                    <Icon className="h-7 w-7" strokeWidth={1.8} aria-hidden="true" />
                    {totalItems > 0 && (
                      <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-extrabold leading-none text-primary-foreground">
                        {totalItems > 99 ? '99+' : totalItems}
                      </span>
                    )}
                  </span>
                  <span className="whitespace-nowrap text-[11px] font-medium leading-none">{label}</span>
                </button>
              </div>
            );
          }

          return (
            <button
              key={id}
              type="button"
              onClick={() => handleClick(id)}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-w-0 flex-col items-center justify-center gap-1.5 px-0.5 text-bottom-nav-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-bottom-nav-foreground ${
                isActive ? 'bg-bottom-nav-active' : 'hover:bg-bottom-nav-active/70'
              } ${id === 'inicio' ? 'rounded-tl-[28px]' : ''} ${id === 'perfil' ? 'rounded-tr-[28px]' : ''}`}
            >
              <Icon className="h-6 w-6 shrink-0" strokeWidth={1.8} aria-hidden="true" />
              <span className="whitespace-nowrap text-[10px] font-semibold leading-none sm:text-xs">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
