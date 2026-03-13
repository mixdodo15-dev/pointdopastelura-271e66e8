import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePdvStore } from '@/store/pdvStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DollarSign, CreditCard, Smartphone, Percent, Layers, CheckCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { printOrder } from '@/utils/printOrder';

type PaymentMethod = 'dinheiro' | 'cartao' | 'pix' | 'misto';

const payments: { value: PaymentMethod; label: string; icon: React.ReactNode; shortcut: string }[] = [
  { value: 'dinheiro', label: 'Dinheiro', icon: <DollarSign className="h-4 w-4" />, shortcut: 'F4' },
  { value: 'cartao', label: 'Cartão', icon: <CreditCard className="h-4 w-4" />, shortcut: 'F6' },
  { value: 'pix', label: 'PIX', icon: <Smartphone className="h-4 w-4" />, shortcut: 'F8' },
  { value: 'misto', label: 'Misto', icon: <Layers className="h-4 w-4" />, shortcut: '' },
];

const CheckoutPanel = () => {
  const store = usePdvStore();
  const [payment, setPayment] = useState<PaymentMethod>('dinheiro');
  const [discountInput, setDiscountInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleDiscount = () => {
    const val = parseFloat(discountInput.replace(',', '.'));
    if (!isNaN(val) && val >= 0) {
      store.applyDiscount(val);
      toast.success(`Desconto de R$ ${val.toFixed(2)} aplicado`);
    }
  };

  const handleCheckout = async () => {
    if (store.items.length === 0) { toast.error('Carrinho vazio'); return; }
    if (store.orderType === 'mesa' && !store.tableNumber.trim()) { toast.error('Informe o número da mesa'); return; }

    setSubmitting(true);
    try {
      const { data: user } = await supabase.auth.getUser();

      const orderData = {
        customer_name: store.customerName || 'PDV',
        customer_phone: '',
        delivery_address: store.orderType === 'mesa' ? `Mesa ${store.tableNumber}` : store.orderType === 'delivery' ? 'Delivery' : 'Balcão/Retirada',
        payment_method: payment,
        total_price: store.total,
        delivery_fee: store.deliveryFee,
        status: 'received' as const,
        user_id: user?.user?.id || null,
        order_source: 'pdv',
        table_number: store.orderType === 'mesa' ? store.tableNumber : null,
        notes: store.discount > 0 ? `Desconto: R$ ${store.discount.toFixed(2)}` : null,
      };

      const { data: order, error } = await supabase.from('orders').insert(orderData).select('id, order_number').single();
      if (error) throw error;

      const itemsInsert = store.items.map(i => ({
        order_id: order.id,
        product_name: i.adicionais && i.adicionais.length > 0
          ? `${i.name} [+${i.adicionais.map(a => a.name).join(', ')}]`
          : i.name,
        quantity: i.quantity,
        unit_price: i.price + (i.adicionais?.reduce((s, a) => s + a.price, 0) || 0),
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(itemsInsert);
      if (itemsErr) throw itemsErr;

      console.log('[PDV:checkout]', { orderId: order.id, items: store.items, total: store.total, payment });

      printOrder({
        orderId: order.id,
        orderNumber: order.order_number,
        items: store.items,
        subtotal: store.subtotal,
        discount: store.discount,
        deliveryFee: store.deliveryFee,
        total: store.total,
        paymentMethod: payment,
        orderType: store.orderType,
        tableNumber: store.tableNumber,
        customerName: store.customerName,
      });

      toast.success('✅ Pedido registrado com sucesso!');
      store.clearCart();
      setDiscountInput('');
    } catch (err: any) {
      console.error('[PDV:checkout:error]', err);
      toast.error(err.message || 'Erro ao registrar pedido');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Payment Methods */}
      <div>
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
          Forma de Pagamento
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {payments.map(p => (
            <button
              key={p.value}
              onClick={() => setPayment(p.value)}
              className={cn(
                "flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs font-bold border transition-all duration-200",
                payment === p.value
                  ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                  : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-secondary"
              )}
            >
              {p.icon}
              <span>{p.label}</span>
              {p.shortcut && (
                <span className={cn("text-[9px] opacity-50", payment === p.value && "opacity-70")}>{p.shortcut}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Discount */}
      <div>
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
          Desconto (R$)
        </label>
        <div className="flex gap-1.5">
          <Input
            placeholder="0,00"
            value={discountInput}
            onChange={e => setDiscountInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleDiscount()}
            className="rounded-xl bg-card text-sm border"
          />
          <Button
            size="icon"
            variant="outline"
            className="rounded-xl shrink-0 hover:bg-accent hover:text-accent-foreground border"
            onClick={handleDiscount}
            aria-label="Aplicar desconto"
          >
            <Percent className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Customer Name */}
      <div>
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
          Cliente
        </label>
        <Input
          placeholder="Nome (opcional)"
          value={store.customerName}
          onChange={e => store.setCustomerName(e.target.value)}
          className="rounded-xl bg-card text-sm border"
        />
      </div>

      {/* Actions */}
      <div className="mt-auto space-y-2">
        <Button
          className={cn(
            "w-full rounded-xl h-14 text-base font-extrabold shadow-lg transition-all duration-200",
            "bg-gradient-to-r from-primary to-[hsl(0_85%_40%)] hover:from-[hsl(0_85%_40%)] hover:to-primary text-primary-foreground",
            "disabled:opacity-50"
          )}
          disabled={submitting || store.items.length === 0}
          onClick={handleCheckout}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Registrando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Finalizar • R$ {store.total.toFixed(2).replace('.', ',')}
            </span>
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full rounded-xl font-bold text-xs h-10 border text-destructive/70 hover:text-destructive hover:border-destructive/50"
          onClick={() => store.clearCart()}
          disabled={store.items.length === 0}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          Limpar Carrinho
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPanel;
