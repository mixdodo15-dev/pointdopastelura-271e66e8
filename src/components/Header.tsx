import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import CheckoutModal from './CheckoutModal';

const formatPrice = (price: number) =>
  `R$ ${price.toFixed(2).replace('.', ',')}`;

const Header = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <>
      <header className="bg-primary text-primary-foreground py-4 px-4 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex-1 text-center">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ fontFamily: "'Fredoka One', cursive" }}>
              POINT DO PASTEL
            </h1>
            <p className="text-sm font-medium opacity-90 tracking-widest">— Cardápio Digital —</p>
          </div>
          <Sheet open={cartOpen} onOpenChange={setCartOpen}>
            <SheetTrigger asChild>
              <button className="relative bg-primary text-primary-foreground rounded-full p-3 hover:scale-105 transition-transform shadow-lg ring-2 ring-card">
                <ShoppingCart className="h-7 w-7" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-foreground text-background text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent className="w-80 sm:w-80 flex flex-col bg-black text-white border-l-0">
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
                      <div key={item.id} className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate text-white">{item.name}</p>
                          <p className="text-sm text-red-400 font-bold">{formatPrice(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(item.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/20 pt-4 space-y-3">
                    <div className="flex justify-between items-center text-lg font-extrabold">
                      <span>Total</span>
                      <span className="text-red-400">{formatPrice(totalPrice)}</span>
                    </div>
                    <Button className="w-full rounded-full text-base font-bold py-6 bg-primary hover:bg-primary/90 text-white" onClick={() => { setCheckoutOpen(true); setCartOpen(false); }}>
                      Finalizar Pedido
                    </Button>
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  );
};

export default Header;
