import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePdvStore } from '@/store/pdvStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DollarSign, CreditCard, Smartphone, Percent, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { printOrder } from '@/utils/printOrder';

type PaymentMethod = 'dinheiro' | 'cartao' | 'pix' | 'misto';

const payments: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: 'dinheiro', label: 'Dinheiro', icon: <DollarSign className="h-4 w-4" /> },
  { value: 'cartao', label: 'Cartão', icon: <CreditCard className="h-4 w-4" /> },
  { value: 'pix', label: 'PIX', icon: <Smartphone className="h-4 w-4" /> },
  { value: 'misto', label: 'Misto', icon: <DollarSign className="h-4 w-4" /> },
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
    if (store.items.length === 0) {
      toast.error('Carrinho vazio');
      return;
    }
    if (store.orderType === 'mesa' && !store.tableNumber.trim()) {
      toast.error('Informe o número da mesa');
      return;
    }

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

      const { data: order, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select('id')
        .single();

      if (error) throw error;

      const itemsInsert = store.items.map(i => ({
        order_id: order.id,
        product_name: i.name,
        quantity: i.quantity,
        unit_price: i.price,
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(itemsInsert);
      if (itemsErr) throw itemsErr;

      console.log('[PDV:checkout]', { orderId: order.id, items: store.items, total: store.total, payment });

      // Auto-print
      printOrder({
        orderId: order.id,
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

      toast.success('Pedido registrado!');
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
    <div className="flex flex-col h-full gap-3">
      <div>
        <label className="text-xs font-bold text-muted-foreground mb-1 block">Pagamento</label>
        <div className="grid grid-cols-2 gap-1.5">
          {payments.map(p => (
            <button
              key={p.value}
              onClick={() => setPayment(p.value)}
              className={cn(
                "flex items-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold border transition-all duration-200",
                payment === p.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary"
              )}
            >
              {p.icon}
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-muted-foreground mb-1 block">Desconto (R$)</label>
        <div className="flex gap-1.5">
          <Input
            placeholder="0,00"
            value={discountInput}
            onChange={e => setDiscountInput(e.target.value)}
            className="rounded-xl bg-card text-sm"
          />
          <Button size="icon" variant="outline" className="rounded-xl shrink-0" onClick={handleDiscount} aria-label="Aplicar desconto">
            <Percent className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-muted-foreground mb-1 block">Cliente</label>
        <Input
          placeholder="Nome (opcional)"
          value={store.customerName}
          onChange={e => store.setCustomerName(e.target.value)}
          className="rounded-xl bg-card text-sm"
        />
      </div>

      <div className="mt-auto space-y-2">
        <Button
          className="w-full rounded-xl h-12 text-base font-extrabold"
          disabled={submitting || store.items.length === 0}
          onClick={handleCheckout}
        >
          {submitting ? 'Registrando...' : `Finalizar • R$ ${store.total.toFixed(2).replace('.', ',')}`}
        </Button>
        <Button variant="outline" className="w-full rounded-xl" onClick={() => store.clearCart()} disabled={store.items.length === 0}>
          Limpar Carrinho
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPanel;
