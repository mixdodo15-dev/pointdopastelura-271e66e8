import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import CheckoutModal from './CheckoutModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ExitIntentPopup from './ExitIntentPopup';
import { useBackButtonControl } from '@/hooks/useBackButtonControl';

const formatPrice = (price: number) =>
  `R$ ${price.toFixed(2).replace('.', ',')}`;

const CartDrawer = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [exitPopupOpen, setExitPopupOpen] = useState(false);

  const handleFinalize = () => {
    setCheckoutOpen(true);
    setCartOpen(false);
  };

  // Back button: when cart is open and has items, show exit popup
  const handleCartBack = useCallback(() => {
    if (items.length > 0) {
      setExitPopupOpen(true);
    } else {
      setCartOpen(false);
    }
  }, [items.length]);

  useBackButtonControl(cartOpen, 'cart-open', handleCartBack);

  // Back button: when checkout is open, go back to cart
  const handleCheckoutBack = useCallback(() => {
    setCheckoutOpen(false);
    setCartOpen(true);
  }, []);

  useBackButtonControl(checkoutOpen, 'checkout-open', handleCheckoutBack);

  const handleCartClose = (open: boolean) => {
    if (!open && items.length > 0) {
      setExitPopupOpen(true);
    } else {
      setCartOpen(open);
    }
  };

  const handleExitClose = () => {
    setExitPopupOpen(false);
    setCartOpen(false);
  };

  const handleExitFinalize = () => {
    setExitPopupOpen(false);
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <>
      <Sheet open={cartOpen} onOpenChange={handleCartClose}>
        <SheetTrigger asChild>
          <button className="fixed bottom-6 right-6 z-50 bg-black text-white rounded-full p-4 shadow-2xl hover:scale-105 transition-transform active:scale-95">
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-foreground text-background text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {totalItems}
              </span>
            )}
            {totalItems > 0 && (
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-bold rounded-full px-2 py-0.5 whitespace-nowrap">
                {formatPrice(totalPrice)}
              </span>
            )}
          </button>
        </SheetTrigger>

        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" /> Carrinho
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground text-center">Seu carrinho está vazio.<br />Adicione itens do cardápio!</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-3 py-4">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-secondary rounded-lg p-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-sm text-primary font-bold">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between items-center text-lg font-extrabold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(totalPrice)}</span>
                </div>
                <Button
                  className="w-full rounded-full text-base font-bold py-6"
                  onClick={handleFinalize}
                >
                  Finalizar Pedido
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ExitIntentPopup
        open={exitPopupOpen}
        onClose={handleExitClose}
        onFinalize={handleExitFinalize}
      />

      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  );
};

export default CartDrawer;
