import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ShoppingCart, User, ClipboardList } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const tabs = [
  { id: 'cardapio', label: 'Cardápio', icon: UtensilsCrossed },
  { id: 'carrinho', label: 'Carrinho', icon: ShoppingCart },
  { id: 'pedidos', label: 'Pedidos', icon: ClipboardList },
  { id: 'conta', label: 'Conta', icon: User },
] as const;

interface BottomNavProps {
  onCartOpen: () => void;
}

const BottomNav = ({ onCartOpen }: BottomNavProps) => {
  const [active, setActive] = useState<string>('cardapio');
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleClick = (id: string) => {
    setActive(id);
    if (id === 'carrinho') {
      onCartOpen();
    }
    if (id === 'cardapio') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (id === 'pedidos') {
      navigate('/meus-pedidos');
    }
    if (id === 'conta') {
      navigate('/cliente-login');
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[hsl(0,0%,90%)] shadow-[0_-2px_10px_rgba(0,0,0,0.06)] md:hidden">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => handleClick(id)}
              className="flex flex-col items-center gap-0.5 relative transition-colors"
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                />
                {id === 'carrinho' && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-semibold transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
