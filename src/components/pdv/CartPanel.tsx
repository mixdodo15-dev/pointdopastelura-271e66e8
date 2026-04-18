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
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
        {items.map((item, idx) => {
          const adicionaisTotal = item.adicionais?.reduce((s, a) => s + a.price, 0) || 0;
          const unitTotal = item.price + adicionaisTotal;
          const lineTotal = unitTotal * item.quantity;

          return (
            <div
              key={item.id}
              className={cn(
                "bg-card rounded-xl border border-border p-3",
                "hover:border-primary/40 transition-colors group"
              )}
            >
              {/* Header: número + nome + remover */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <span className="text-[10px] font-extrabold text-primary-foreground bg-primary rounded-md px-1.5 py-0.5 mt-0.5 shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm font-extrabold text-foreground leading-tight flex-1 break-words">
                    {item.name}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10 shrink-0"
                  onClick={() => removeItem(item.id)}
                  aria-label="Remover item"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Detalhes: sabores e adicionais em lista vertical */}
              {(item.flavors?.length || item.adicionais?.length) && (
                <div className="ml-1 mb-2 pl-2 border-l-2 border-primary/30 space-y-0.5">
                  {item.flavors && item.flavors.length > 0 && (
                    <>
                      {item.flavors.map((f, i) => (
                        <p key={`f-${i}`} className="text-xs font-semibold text-foreground/80 leading-snug">
                          • {f}
                        </p>
                      ))}
                    </>
                  )}
                  {item.adicionais && item.adicionais.length > 0 && (
                    <>
                      {item.adicionais.map((a, i) => (
                        <p key={`a-${i}`} className="text-xs font-semibold text-accent leading-snug flex justify-between gap-2">
                          <span>+ {a.name}</span>
                          <span className="text-accent/80">{formatPrice(a.price)}</span>
                        </p>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* Linha de valor + controles de quantidade */}
              <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-dashed border-border">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">Valor</span>
                  <span className="text-sm font-extrabold text-primary leading-none">
                    {formatPrice(lineTotal)}
                  </span>
                  {item.quantity > 1 && (
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      {item.quantity}x {formatPrice(unitTotal)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-0 bg-secondary rounded-lg overflow-hidden border border-border shrink-0">
                  <button
                    onClick={() => decreaseQty(item.id)}
                    className="h-8 w-8 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-all"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-sm font-extrabold w-8 text-center bg-card h-8 flex items-center justify-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => increaseQty(item.id)}
                    className="h-8 w-8 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                    aria-label="Adicionar mais 1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="border-t border-border pt-3 mt-3 space-y-1.5 shrink-0">
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
