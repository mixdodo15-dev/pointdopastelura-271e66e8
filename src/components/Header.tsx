import { ShoppingCart, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
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
            <SheetContent className="w-full sm:w-96 flex flex-col bg-black text-white border-l-0 p-0">
              {/* Header do carrinho */}
              <div className="px-5 pt-5 pb-4 border-b border-white/10">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-white text-lg font-extrabold">
                    <ShoppingBag className="h-5 w-5" /> Seu Carrinho
                  </SheetTitle>
                </SheetHeader>
                {totalItems > 0 && (
                  <p className="text-white/50 text-sm mt-1">{totalItems} {totalItems === 1 ? 'item' : 'itens'}</p>
                )}
              </div>

              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
                  <ShoppingCart className="h-16 w-16 text-white/20" />
                  <p className="text-white/50 text-center text-sm">Seu carrinho está vazio.<br />Adicione itens do cardápio!</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                    {items.map(item => (
                      <div key={item.id} className="bg-white/[0.07] rounded-2xl p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm text-white truncate">{item.name}</p>
                            <p className="text-xs text-white/50 mt-0.5">Unid. {formatPrice(item.price)}</p>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="text-white/30 hover:text-red-400 transition-colors p-1">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 bg-white/10 rounded-full px-1 py-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                              <Minus className="h-3.5 w-3.5 text-white" />
                            </button>
                            <span className="text-sm font-bold w-5 text-center text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5 text-white" />
                            </button>
                          </div>
                          <span className="text-primary font-extrabold text-base">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-white/10 px-5 py-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm font-medium">Total</span>
                      <span className="text-white font-extrabold text-2xl">{formatPrice(totalPrice)}</span>
                    </div>
                    <Button
                      className="w-full rounded-xl text-base font-bold py-6 bg-primary hover:bg-primary/90 text-white shadow-lg"
                      onClick={() => { setCheckoutOpen(true); setCartOpen(false); }}
                    >
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
