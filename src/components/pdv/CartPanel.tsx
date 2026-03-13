import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePdvStore } from '@/store/pdvStore';
import { cn } from '@/lib/utils';

const formatPrice = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const CartPanel = () => {
  const { items, subtotal, discount, deliveryFee, total, increaseQty, decreaseQty, removeItem } = usePdvStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
        <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-3">
          <ShoppingCart className="h-8 w-8 opacity-30" />
        </div>
        <p className="text-sm font-bold">Carrinho vazio</p>
        <p className="text-xs opacity-60 mt-1">Clique em um produto para adicionar</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {items.map((item, idx) => {
          const adicionaisTotal = item.adicionais?.reduce((s, a) => s + a.price, 0) || 0;
          const unitTotal = item.price + adicionaisTotal;

          return (
            <div
              key={item.id}
              className={cn(
                "bg-card rounded-xl p-3 border border-border",
                "hover:border-primary/30 transition-all duration-200 group"
              )}
            >
              <div className="flex justify-between items-start gap-2 mb-1.5">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <span className="text-xs font-extrabold text-muted-foreground mt-0.5 shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <p className="text-xs font-bold text-foreground leading-tight flex-1">{item.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive/60 hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeItem(item.id)}
                  aria-label="Remover"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {item.adicionais && item.adicionais.length > 0 && (
                <p className="text-[10px] text-accent font-semibold mb-1.5 ml-6">
                  + {item.adicionais.map(a => a.name).join(', ')} (+{formatPrice(adicionaisTotal)})
                </p>
              )}

              <div className="flex items-center justify-between ml-6">
                <div className="flex items-center gap-0 bg-secondary rounded-lg overflow-hidden border border-border">
                  <button
                    onClick={() => decreaseQty(item.id)}
                    className="h-7 w-7 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                    aria-label="Diminuir"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-xs font-extrabold w-7 text-center bg-card">{item.quantity}</span>
                  <button
                    onClick={() => increaseQty(item.id)}
                    className="h-7 w-7 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                    aria-label="Aumentar"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-sm font-extrabold text-primary">{formatPrice(unitTotal * item.quantity)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="border-t border-border pt-3 mt-3 space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground font-medium">
          <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} itens)</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-xs text-green-600 font-bold">
            <span>Desconto</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        {deliveryFee > 0 && (
          <div className="flex justify-between text-xs text-muted-foreground font-medium">
            <span>Taxa entrega</span>
            <span>{formatPrice(deliveryFee)}</span>
          </div>
        )}
        <div className="flex justify-between items-baseline pt-2 border-t border-primary/20">
          <span className="text-sm font-extrabold text-foreground">Total</span>
          <span className="text-xl font-extrabold text-primary">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default CartPanel;
