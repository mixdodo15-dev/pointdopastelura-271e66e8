import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePdvStore } from '@/store/pdvStore';

const formatPrice = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const CartPanel = () => {
  const { items, subtotal, discount, deliveryFee, total, increaseQty, decreaseQty, removeItem } = usePdvStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
        <ShoppingCart className="h-10 w-10 mb-2 opacity-40" />
        <p className="text-sm font-bold">Carrinho vazio</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {items.map(item => {
          const adicionaisTotal = item.adicionais?.reduce((s, a) => s + a.price, 0) || 0;
          const unitTotal = item.price + adicionaisTotal;

          return (
            <div key={item.id} className="bg-secondary/50 rounded-xl p-2.5 border-2 border-border hover:border-[hsl(var(--pdv-accent))]/50 transition-all">
              <div className="flex justify-between items-start mb-1">
                <p className="text-xs font-bold text-foreground flex-1 leading-tight">{item.name}</p>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive shrink-0" onClick={() => removeItem(item.id)} aria-label="Remover">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              {item.adicionais && item.adicionais.length > 0 && (
                <p className="text-[10px] text-[hsl(var(--pdv-accent))] font-bold mb-1">
                  + {item.adicionais.map(a => a.name).join(', ')} (+{formatPrice(adicionaisTotal)})
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5 bg-card rounded-full border-2 border-border">
                  <button onClick={() => decreaseQty(item.id)} className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-[hsl(var(--pdv-red))] hover:text-white transition-all" aria-label="Diminuir">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-sm font-extrabold w-6 text-center">{item.quantity}</span>
                  <button onClick={() => increaseQty(item.id)} className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-[hsl(var(--pdv-red))] hover:text-white transition-all" aria-label="Aumentar">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-sm font-extrabold text-[hsl(var(--pdv-red))]">{formatPrice(unitTotal * item.quantity)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t-2 border-[hsl(var(--pdv-accent))]/30 pt-3 mt-3 space-y-1">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600 font-bold">
            <span>Desconto</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        {deliveryFee > 0 && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Entrega</span>
            <span>{formatPrice(deliveryFee)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-extrabold text-[hsl(var(--pdv-red))] pt-1 border-t-2 border-[hsl(var(--pdv-red))]/20">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default CartPanel;
