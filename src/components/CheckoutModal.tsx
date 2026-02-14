import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { MessageCircle, User, MapPin, CreditCard, StickyNote, ShoppingBag, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
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
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState('');
  const [notes, setNotes] = useState('');

  const handleSend = () => {
    if (!name.trim()) { toast.error('Informe seu nome.'); return; }
    if (!phone.trim()) { toast.error('Informe seu telefone.'); return; }
    if (!address.trim()) { toast.error('Informe seu endereço.'); return; }
    if (!payment) { toast.error('Selecione o método de pagamento.'); return; }

    const sanitizedName = name.trim().slice(0, 100);
    const sanitizedPhone = phone.trim().slice(0, 20);
    const sanitizedAddress = address.trim().slice(0, 200);
    const sanitizedNotes = notes.trim().slice(0, 500);

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
    msg += `💰 *TOTAL: ${formatPrice(totalPrice)}*`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${PHONE}?text=${encoded}`, '_blank');

    clearCart();
    setName('');
    setPhone('');
    setAddress('');
    setPayment('');
    setNotes('');
    onClose();
    toast.success('Pedido enviado para o WhatsApp!');
  };

  return (
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
          <div className="mt-4 bg-primary-foreground/15 rounded-xl px-4 py-3">
            <div className="flex justify-between items-center">
              <span className="text-primary-foreground/90 text-sm font-medium">
                {items.length} {items.length === 1 ? 'item' : 'itens'} no pedido
              </span>
              <span className="text-primary-foreground font-extrabold text-lg">
                {formatPrice(totalPrice)}
              </span>
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
            <Label htmlFor="notes" className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
              <StickyNote className="h-4 w-4" /> Observações (opcional)
            </Label>
            <Textarea id="notes" placeholder="Alguma observação sobre o pedido?" value={notes} onChange={e => setNotes(e.target.value)}
              maxLength={500} rows={2} className="rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary resize-none" />
          </div>
        </div>

        <div className="px-6 pb-6">
          <Button className="w-full rounded-xl text-base font-bold py-6 gap-2 shadow-lg" onClick={handleSend}>
            <MessageCircle className="h-5 w-5" /> Enviar Pedido via WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
