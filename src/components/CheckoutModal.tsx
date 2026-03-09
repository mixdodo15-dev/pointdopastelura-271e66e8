import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, User, MapPin, CreditCard, StickyNote, ShoppingBag, Phone, Loader2, Bike, Store } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import OrderSuccessAnimation from './OrderSuccessAnimation';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

interface Neighborhood {
  id: string;
  name: string;
  delivery_fee: number;
}

const PHONE = '5534984050892';

const formatPrice = (price: number) =>
  `R$ ${price.toFixed(2).replace('.', ',')}`;

const paymentOptions = [
  { label: 'Pix', icon: '📱' },
  { label: 'Dinheiro', icon: '💵' },
  { label: 'Cartão', icon: '💳' },
];

const CheckoutModal = ({ open, onClose }: CheckoutModalProps) => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(7);
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('');
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');

  useEffect(() => {
    if (open) {
      loadNeighborhoods();
    }
  }, [open]);

  const loadNeighborhoods = async () => {
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id, name, delivery_fee')
      .eq('active', true)
      .order('name');
    if (!error && data) {
      setNeighborhoods(data as Neighborhood[]);
    }
  };

  const handleNeighborhoodChange = (neighborhoodId: string) => {
    setSelectedNeighborhood(neighborhoodId);
    const neighborhood = neighborhoods.find(n => n.id === neighborhoodId);
    if (neighborhood) {
      setDeliveryFee(Number(neighborhood.delivery_fee));
    }
  };

  const handleDeliveryModeChange = (mode: 'delivery' | 'pickup') => {
    setDeliveryMode(mode);
    if (mode === 'pickup') {
      setDeliveryFee(0);
      setSelectedNeighborhood('');
      setAddress('');
    } else {
      setDeliveryFee(7);
    }
  };

  const handleSend = async () => {
    if (!name.trim()) { toast.error('Informe seu nome.'); return; }
    if (!phone.trim()) { toast.error('Informe seu telefone.'); return; }
    if (!address.trim()) { toast.error('Informe seu endereço.'); return; }
    if (!selectedNeighborhood && neighborhoods.length > 0) { toast.error('Selecione seu bairro.'); return; }
    if (!payment) { toast.error('Selecione o método de pagamento.'); return; }

    setSending(true);

    const sanitizedName = name.trim().slice(0, 100);
    const sanitizedPhone = phone.trim().slice(0, 20);
    const sanitizedAddress = address.trim().slice(0, 200);
    const sanitizedNotes = notes.trim().slice(0, 500);

    try {
      // Get current user (may be null for anonymous orders)
      const { data: { user } } = await supabase.auth.getUser();

      const grandTotal = totalPrice + deliveryFee;

      // Save order to database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          customer_name: sanitizedName,
          customer_phone: sanitizedPhone,
          delivery_address: sanitizedAddress,
          payment_method: payment,
          notes: sanitizedNotes || null,
          total_price: grandTotal,
          delivery_fee: deliveryFee,
          status: 'received' as const,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Save order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Build WhatsApp message
      let msg = `🧾 *PEDIDO #${order.id.slice(0, 8).toUpperCase()} - Point Do Pastel*\n\n`;
      msg += `👤 *Cliente:* ${sanitizedName}\n`;
      msg += `📞 *Telefone:* ${sanitizedPhone}\n`;
      msg += `📍 *Endereço:* ${sanitizedAddress}\n`;
      msg += `💳 *Pagamento:* ${payment}\n`;
      if (sanitizedNotes) msg += `📝 *Obs:* ${sanitizedNotes}\n`;
      msg += `\n━━━━━━━━━━━━━━━━━━\n`;
      msg += `📋 *Itens do pedido:*\n\n`;

      items.forEach(item => {
        msg += `• ${item.quantity}x ${item.name} — ${formatPrice(item.price * item.quantity)}\n`;
      });

      msg += `\n━━━━━━━━━━━━━━━━━━\n`;
      msg += `🛵 *Taxa de entrega:* ${formatPrice(deliveryFee)}\n`;
      msg += `💰 *TOTAL: ${formatPrice(grandTotal)}*`;

      // Clear cart and reset form BEFORE opening WhatsApp
      clearCart();
      setName('');
      setPhone('');
      setAddress('');
      setPayment('');
      setNotes('');
      setDeliveryFee(7);
      setSelectedNeighborhood('');
      onClose();
      setShowSuccess(true);

      const encoded = encodeURIComponent(msg);
      window.open(`https://wa.me/${PHONE}?text=${encoded}`, '_blank');

      // Save order ID to localStorage for guest tracking if user is not logged in
      if (!user) {
        const guestOrders = JSON.parse(localStorage.getItem('guest-orders') || '[]');
        guestOrders.push(order.id);
        localStorage.setItem('guest-orders', JSON.stringify(guestOrders));
      }

      // Navigate to order tracking if user is logged in
      if (user) {
        navigate(`/meus-pedidos`);
      }
    } catch (error: any) {
      console.error('Error saving order:', error);
      // If DB save fails, still send via WhatsApp
      let msg = `🧾 *PEDIDO - Point Do Pastel*\n\n`;
      msg += `👤 *Cliente:* ${sanitizedName}\n`;
      msg += `📞 *Telefone:* ${sanitizedPhone}\n`;
      msg += `📍 *Endereço:* ${sanitizedAddress}\n`;
      msg += `💳 *Pagamento:* ${payment}\n`;
      if (sanitizedNotes) msg += `📝 *Obs:* ${sanitizedNotes}\n`;
      msg += `\n━━━━━━━━━━━━━━━━━━\n`;
      msg += `📋 *Itens do pedido:*\n\n`;
      items.forEach(item => {
        msg += `• ${item.quantity}x ${item.name} — ${formatPrice(item.price * item.quantity)}\n`;
      });
      msg += `\n━━━━━━━━━━━━━━━━━━\n`;
      msg += `🛵 *Taxa de entrega:* ${formatPrice(deliveryFee)}\n`;
      msg += `💰 *TOTAL: ${formatPrice(totalPrice + deliveryFee)}*`;
      clearCart();
      onClose();
      setShowSuccess(true);
      const encoded = encodeURIComponent(msg);
      window.open(`https://wa.me/${PHONE}?text=${encoded}`, '_blank');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
    <OrderSuccessAnimation show={showSuccess} onComplete={() => setShowSuccess(false)} />
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-0 shadow-2xl">
        <div className="bg-primary px-6 pt-6 pb-5 rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary-foreground text-xl font-extrabold flex items-center gap-2">
              <ShoppingBag className="h-6 w-6" />
              Finalizar Pedido
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80 text-sm mt-1">
              Preencha seus dados para enviar via WhatsApp
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 bg-primary-foreground/15 rounded-xl px-4 py-3 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-primary-foreground/80 text-sm">
                {items.length} {items.length === 1 ? 'item' : 'itens'}
              </span>
              <span className="text-primary-foreground/80 text-sm">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-primary-foreground/80 text-sm">Taxa de entrega</span>
              <span className="text-primary-foreground/80 text-sm">{formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between items-center border-t border-primary-foreground/20 pt-1.5">
              <span className="text-primary-foreground font-bold text-sm">Total</span>
              <span className="text-primary-foreground font-extrabold text-lg">{formatPrice(totalPrice + deliveryFee)}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <User className="h-4 w-4 text-primary" /> Nome completo
            </Label>
            <Input id="name" placeholder="Digite seu nome" value={name} onChange={e => setName(e.target.value)} maxLength={100}
              className="h-12 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Phone className="h-4 w-4 text-primary" /> Telefone
            </Label>
            <Input id="phone" placeholder="(00) 00000-0000" value={phone} onChange={e => setPhone(e.target.value)} maxLength={20} type="tel"
              className="h-12 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <MapPin className="h-4 w-4 text-primary" /> Endereço de entrega
            </Label>
            <Input id="address" placeholder="Rua, número, bairro" value={address} onChange={e => setAddress(e.target.value)} maxLength={200}
              className="h-12 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <CreditCard className="h-4 w-4 text-primary" /> Forma de pagamento
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {paymentOptions.map(opt => (
                <button key={opt.label} onClick={() => setPayment(opt.label)}
                  className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    payment === opt.label
                      ? 'bg-primary text-primary-foreground shadow-lg scale-[1.03]'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}>
                  <span className="text-xl">{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Bike className="h-4 w-4 text-primary" /> Bairro / Taxa de entrega
            </Label>
            <Select value={selectedNeighborhood} onValueChange={handleNeighborhoodChange}>
              <SelectTrigger className="h-12 rounded-xl bg-secondary border-0 text-foreground">
                <SelectValue placeholder="Selecione seu bairro" />
              </SelectTrigger>
              <SelectContent>
                {neighborhoods.map(n => (
                  <SelectItem key={n.id} value={n.id}>
                    {n.name} — R$ {Number(n.delivery_fee).toFixed(2).replace('.', ',')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {neighborhoods.length === 0 && (
              <p className="text-xs text-muted-foreground">Nenhum bairro cadastrado. Taxa padrão: R$ 7,00</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
              <StickyNote className="h-4 w-4" /> Observações (opcional)
            </Label>
            <Textarea id="notes" placeholder="Alguma observação sobre o pedido?" value={notes} onChange={e => setNotes(e.target.value)}
              maxLength={500} rows={2} className="rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary resize-none" />
          </div>
        </div>

        <div className="px-6 pb-6">
          <Button className="w-full rounded-xl text-base font-bold py-6 gap-2 shadow-lg" onClick={handleSend} disabled={sending}>
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
            {sending ? 'Enviando...' : 'Enviar Pedido via WhatsApp'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default CheckoutModal;
