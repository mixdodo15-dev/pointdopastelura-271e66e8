import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

const PHONE = '5534984050892';

const formatPrice = (price: number) =>
  `R$ ${price.toFixed(2).replace('.', ',')}`;

const CheckoutModal = ({ open, onClose }: CheckoutModalProps) => {
  const { items, totalPrice, clearCart } = useCart();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState('');
  const [notes, setNotes] = useState('');

  const handleSend = () => {
    if (!name.trim()) { toast.error('Informe seu nome.'); return; }
    if (!address.trim()) { toast.error('Informe seu endereço.'); return; }
    if (!payment) { toast.error('Selecione o método de pagamento.'); return; }

    const sanitizedName = name.trim().slice(0, 100);
    const sanitizedAddress = address.trim().slice(0, 200);
    const sanitizedNotes = notes.trim().slice(0, 500);

    let msg = `🧾 *PEDIDO - Point Do Pastel*\n\n`;
    msg += `👤 *Cliente:* ${sanitizedName}\n`;
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
    setAddress('');
    setPayment('');
    setNotes('');
    onClose();
    toast.success('Pedido enviado para o WhatsApp!');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Finalizar Pedido</DialogTitle>
          <DialogDescription>Preencha seus dados para enviar o pedido via WhatsApp.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo *</Label>
            <Input
              id="name"
              placeholder="Seu nome"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço completo *</Label>
            <Input
              id="address"
              placeholder="Rua, número, bairro"
              value={address}
              onChange={e => setAddress(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label>Método de pagamento *</Label>
            <div className="grid grid-cols-3 gap-2">
              {['Pix', 'Dinheiro', 'Cartão'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setPayment(opt)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                    payment === opt
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Alguma observação sobre o pedido?"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4 text-lg font-extrabold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(totalPrice)}</span>
            </div>
            <Button
              className="w-full rounded-full text-base font-bold py-6 gap-2"
              onClick={handleSend}
            >
              <MessageCircle className="h-5 w-5" />
              Enviar Pedido via WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
