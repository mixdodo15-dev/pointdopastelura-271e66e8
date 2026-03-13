import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, User, MapPin, CreditCard, StickyNote, ShoppingBag, Phone, Loader2, Bike, Store, Ticket, Check, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import OrderSuccessAnimation from './OrderSuccessAnimation';
import { useViaCep } from '@/hooks/useViaCep';
import { useDeliverySettings, calcDistanceKm, calcDeliveryFee } from '@/hooks/useDeliverySettings';

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
  const navigate = useNavigate();
  const { fetchAddress, searchByStreet, geocodeAddress, loading: cepLoading } = useViaCep();
  const { settings: deliverySettings } = useDeliverySettings();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [streetInput, setStreetInput] = useState('');
  const [streetSuggestions, setStreetSuggestions] = useState<Array<{cep: string; logradouro: string; bairro: string; localidade: string; uf: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [complement, setComplement] = useState('');
  const [payment, setPayment] = useState('');
  const [notes, setNotes] = useState('');
  const [needsChange, setNeedsChange] = useState(false);
  const [changeFor, setChangeFor] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [outOfRange, setOutOfRange] = useState(false);
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [calculatingFee, setCalculatingFee] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStreetInputChange = (value: string) => {
    setStreetInput(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.length < 3) {
      setStreetSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      // Search in Uberlândia/MG (adjust UF/city as needed)
      const results = await searchByStreet('MG', 'Uberlandia', value);
      setStreetSuggestions(results.slice(0, 8));
      setShowSuggestions(results.length > 0);
    }, 400);
  };

  const selectStreetSuggestion = async (suggestion: typeof streetSuggestions[0]) => {
    setStreet(suggestion.logradouro);
    setStreetInput(suggestion.logradouro);
    setNeighborhood(suggestion.bairro);
    setCity(`${suggestion.localidade}/${suggestion.uf}`);
    setCep(suggestion.cep);
    setShowSuggestions(false);
    setStreetSuggestions([]);

    // Calculate delivery fee
    setCalculatingFee(true);
    const addr = `${suggestion.logradouro}, ${suggestion.bairro}, ${suggestion.localidade}, ${suggestion.uf}, Brasil`;
    const coords = await geocodeAddress(addr);
    if (coords) {
      const dist = calcDistanceKm(deliverySettings.store_lat, deliverySettings.store_lng, coords.lat, coords.lng);
      setDistanceKm(Math.round(dist * 10) / 10);
      if (dist > deliverySettings.max_radius_km) {
        setOutOfRange(true);
        setDeliveryFee(0);
        toast.error(`Fora da área de entrega (${dist.toFixed(1)} km, máx: ${deliverySettings.max_radius_km} km)`);
      } else {
        setOutOfRange(false);
        setDeliveryFee(Math.round(calcDeliveryFee(dist, deliverySettings) * 100) / 100);
      }
    } else {
      setDistanceKm(null);
      setOutOfRange(false);
      setDeliveryFee(deliverySettings.min_fee);
    }
    setCalculatingFee(false);
  };

  const handleDeliveryModeChange = (mode: 'delivery' | 'pickup') => {
    setDeliveryMode(mode);
    if (mode === 'pickup') {
      setDeliveryFee(0);
      setCep(''); setStreet(''); setNumber(''); setNeighborhood(''); setCity(''); setComplement('');
      setDistanceKm(null); setOutOfRange(false);
    }
  };

  const buildFullAddress = () =>
    `${street}${number ? ', ' + number : ''}${complement ? ' - ' + complement : ''} - ${neighborhood}, ${city}`.trim();

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    const { data, error } = await supabase
      .from('coupons').select('*')
      .eq('code', couponCode.trim().toUpperCase()).eq('active', true).maybeSingle();

    if (error || !data) { toast.error('Cupom inválido ou expirado'); setApplyingCoupon(false); return; }
    if (data.expires_at && new Date(data.expires_at) < new Date()) { toast.error('Cupom expirado'); setApplyingCoupon(false); return; }
    if (data.max_uses && data.used_count >= data.max_uses) { toast.error('Cupom esgotado'); setApplyingCoupon(false); return; }
    if (data.min_order_value && totalPrice < Number(data.min_order_value)) { toast.error(`Pedido mínimo: ${formatPrice(Number(data.min_order_value))}`); setApplyingCoupon(false); return; }

    const discount = data.discount_type === 'percentage'
      ? totalPrice * (Number(data.discount_value) / 100) : Number(data.discount_value);
    setCouponDiscount(Math.min(discount, totalPrice));
    setCouponApplied(true);
    await supabase.from('coupons').update({ used_count: data.used_count + 1 }).eq('id', data.id);
    toast.success(`Cupom aplicado! Desconto: ${formatPrice(Math.min(discount, totalPrice))}`);
    setApplyingCoupon(false);
  };

  const removeCoupon = () => { setCouponCode(''); setCouponDiscount(0); setCouponApplied(false); };

  const resetForm = () => {
    setName(''); setPhone(''); setCep(''); setStreet(''); setStreetInput(''); setNumber('');
    setNeighborhood(''); setCity(''); setComplement(''); setPayment('');
    setNotes(''); setNeedsChange(false); setChangeFor(''); setDeliveryFee(0);
    setDistanceKm(null); setOutOfRange(false); setDeliveryMode('delivery'); removeCoupon();
    setStreetSuggestions([]); setShowSuggestions(false);
  };

  const handleSend = async () => {
    if (!name.trim()) { toast.error('Informe seu nome.'); return; }
    if (!phone.trim()) { toast.error('Informe seu telefone.'); return; }
    if (deliveryMode === 'delivery' && !street.trim()) { toast.error('Informe seu endereço (busque pelo CEP).'); return; }
    if (deliveryMode === 'delivery' && outOfRange) { toast.error('Endereço fora da área de entrega.'); return; }
    if (!payment) { toast.error('Selecione o método de pagamento.'); return; }

    setSending(true);
    const sanitizedName = name.trim().slice(0, 100);
    const sanitizedPhone = phone.trim().slice(0, 20);
    const sanitizedAddress = buildFullAddress().slice(0, 200);
    const sanitizedNotes = notes.trim().slice(0, 500);
    const grandTotal = totalPrice - couponDiscount + deliveryFee;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: order, error: orderError } = await supabase.from('orders').insert({
        user_id: user?.id || null,
        customer_name: sanitizedName,
        customer_phone: sanitizedPhone,
        delivery_address: deliveryMode === 'pickup' ? 'RETIRADA NO LOCAL' : sanitizedAddress,
        payment_method: payment,
        notes: sanitizedNotes || null,
        total_price: grandTotal,
        delivery_fee: deliveryFee,
        status: 'received' as const,
      }).select('id, order_number').single();

      if (orderError) throw orderError;

      const { error: itemsError } = await supabase.from('order_items').insert(
        items.map(item => ({ order_id: order.id, product_name: item.name, quantity: item.quantity, unit_price: item.price }))
      );
      if (itemsError) throw itemsError;

      const orderLabel = `Point-${String(order.order_number || 0).padStart(4, '0')}`;
      let msg = `🧾 *PEDIDO ${orderLabel} - Point Do Pastel*\n\n`;
      msg += `👤 *Cliente:* ${sanitizedName}\n📞 *Telefone:* ${sanitizedPhone}\n`;
      msg += deliveryMode === 'pickup' ? `🏪 *Retirada no local*\n` : `📍 *Endereço:* ${sanitizedAddress}\n`;
      msg += `💳 *Pagamento:* ${payment}\n`;
      if (payment === 'Dinheiro' && needsChange && changeFor.trim()) msg += `💰 *Troco para:* ${changeFor.trim()}\n`;
      else if (payment === 'Dinheiro' && !needsChange) msg += `💰 *Troco:* Não precisa\n`;
      if (sanitizedNotes) msg += `📝 *Obs:* ${sanitizedNotes}\n`;
      msg += `\n━━━━━━━━━━━━━━━━━━\n📋 *Itens do pedido:*\n\n`;
      items.forEach(item => { msg += `• ${item.quantity}x ${item.name} — ${formatPrice(item.price * item.quantity)}\n`; });
      msg += `\n━━━━━━━━━━━━━━━━━━\n`;
      if (couponDiscount > 0) msg += `🎫 *Cupom (${couponCode.toUpperCase()}):* -${formatPrice(couponDiscount)}\n`;
      if (deliveryMode === 'delivery') {
        msg += `🛵 *Taxa de entrega:* ${formatPrice(deliveryFee)}`;
        if (distanceKm) msg += ` (${distanceKm} km)`;
        msg += `\n`;
      }
      msg += `💰 *TOTAL: ${formatPrice(grandTotal)}*`;

      clearCart(); resetForm(); onClose(); setShowSuccess(true);
      window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`, '_blank');

      if (!user) {
        const guestOrders = JSON.parse(localStorage.getItem('guest-orders') || '[]');
        guestOrders.push(order.id);
        localStorage.setItem('guest-orders', JSON.stringify(guestOrders));
      }
      if (user) navigate(`/meus-pedidos`);
    } catch (err: any) {
      console.error('Error saving order:', err);
      // Fallback: still send via WhatsApp
      let msg = `🧾 *PEDIDO - Point Do Pastel*\n\n👤 ${sanitizedName}\n📞 ${sanitizedPhone}\n`;
      msg += deliveryMode === 'pickup' ? `🏪 Retirada\n` : `📍 ${sanitizedAddress}\n`;
      msg += `💳 ${payment}\n━━━━━━━━━━━━━━━━━━\n`;
      items.forEach(item => { msg += `• ${item.quantity}x ${item.name} — ${formatPrice(item.price * item.quantity)}\n`; });
      msg += `━━━━━━━━━━━━━━━━━━\n💰 *TOTAL: ${formatPrice(grandTotal)}*`;
      clearCart(); onClose(); setShowSuccess(true);
      window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
    } finally {
      setSending(false);
    }
  };

  const grandTotal = totalPrice - couponDiscount + deliveryFee;

  return (
    <>
    <OrderSuccessAnimation show={showSuccess} onComplete={() => setShowSuccess(false)} />
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-0 shadow-2xl">
        {/* Header */}
        <div className="bg-primary px-6 pt-6 pb-5 rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary-foreground text-xl font-extrabold flex items-center gap-2">
              <ShoppingBag className="h-6 w-6" /> Finalizar Pedido
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80 text-sm mt-1">
              Preencha seus dados para enviar via WhatsApp
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 bg-primary-foreground/15 rounded-xl px-4 py-3 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-primary-foreground/80 text-sm">{items.length} {items.length === 1 ? 'item' : 'itens'}</span>
              <span className="text-primary-foreground/80 text-sm">{formatPrice(totalPrice)}</span>
            </div>
            {deliveryMode === 'delivery' && deliveryFee > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-primary-foreground/80 text-sm">
                  Taxa de entrega {distanceKm ? `(${distanceKm} km)` : ''}
                </span>
                <span className="text-primary-foreground/80 text-sm">{formatPrice(deliveryFee)}</span>
              </div>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-primary-foreground/80 text-sm">🎫 Cupom ({couponCode.toUpperCase()})</span>
                <span className="text-primary-foreground/80 text-sm">-{formatPrice(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center border-t border-primary-foreground/20 pt-1.5">
              <span className="text-primary-foreground font-bold text-sm">Total</span>
              <span className="text-primary-foreground font-extrabold text-lg">{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Delivery Mode */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2 text-foreground">Tipo de pedido</Label>
            <div className="grid grid-cols-2 gap-3">
              {(['delivery', 'pickup'] as const).map(mode => (
                <button key={mode} onClick={() => handleDeliveryModeChange(mode)}
                  className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    deliveryMode === mode ? 'bg-primary text-primary-foreground shadow-lg scale-[1.03]' : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}>
                  {mode === 'delivery' ? <Bike className="h-5 w-5" /> : <Store className="h-5 w-5" />}
                  <span>{mode === 'delivery' ? 'Entrega' : 'Retirada'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <User className="h-4 w-4 text-primary" /> Nome completo
            </Label>
            <Input placeholder="Digite seu nome" value={name} onChange={e => setName(e.target.value)} maxLength={100}
              className="h-12 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary" />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Phone className="h-4 w-4 text-primary" /> Telefone
            </Label>
            <Input placeholder="(00) 00000-0000" value={phone} onChange={e => setPhone(e.target.value)} maxLength={20} type="tel"
              className="h-12 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary" />
          </div>

          {/* Address fields (delivery only) */}
          {deliveryMode === 'delivery' && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <MapPin className="h-4 w-4 text-primary" /> Endereço de entrega
              </Label>

              {/* Street search */}
              <div className="relative">
                <Input placeholder="Digite o nome da rua..."
                  value={streetInput}
                  onChange={e => handleStreetInputChange(e.target.value)}
                  onFocus={() => streetSuggestions.length > 0 && setShowSuggestions(true)}
                  className="h-12 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                />
                {cepLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                {showSuggestions && streetSuggestions.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {streetSuggestions.map((s, i) => (
                      <button key={`${s.cep}-${i}`}
                        onClick={() => selectStreetSuggestion(s)}
                        className="w-full text-left px-4 py-2.5 hover:bg-secondary transition-colors text-sm border-b last:border-0">
                        <p className="font-semibold text-foreground">{s.logradouro}</p>
                        <p className="text-xs text-muted-foreground">{s.bairro} — {s.localidade}/{s.uf} — CEP {s.cep}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Auto-filled fields */}
              {street && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="Número *" value={number} onChange={e => setNumber(e.target.value)} maxLength={10}
                      className="h-11 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary text-sm" />
                    <Input placeholder="Complemento" value={complement} onChange={e => setComplement(e.target.value)} maxLength={50}
                      className="h-11 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary text-sm col-span-2" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="CEP" value={cep} readOnly
                      className="h-11 rounded-xl bg-muted border-0 text-foreground text-sm font-mono" />
                    <Input placeholder="Bairro" value={neighborhood} readOnly
                      className="h-11 rounded-xl bg-muted border-0 text-foreground text-sm" />
                    <Input placeholder="Cidade" value={city} readOnly
                      className="h-11 rounded-xl bg-muted border-0 text-foreground text-sm" />
                  </div>
                </>
              )}

              {/* Delivery info */}
              {calculatingFee && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Calculando taxa de entrega...
                </div>
              )}
              {outOfRange && (
                <div className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm font-semibold">
                  ⚠️ Endereço fora da área de entrega ({distanceKm} km). Raio máximo: {deliverySettings.max_radius_km} km.
                </div>
              )}
              {!outOfRange && distanceKm !== null && deliveryFee > 0 && (
                <div className="bg-primary/10 rounded-xl px-4 py-2 text-sm font-semibold text-primary flex justify-between">
                  <span>🛵 {distanceKm} km</span>
                  <span>Taxa: {formatPrice(deliveryFee)}</span>
                </div>
              )}
            </div>
          )}

          {/* Payment */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <CreditCard className="h-4 w-4 text-primary" /> Forma de pagamento
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {paymentOptions.map(opt => (
                <button key={opt.label} onClick={() => setPayment(opt.label)}
                  className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    payment === opt.label ? 'bg-primary text-primary-foreground shadow-lg scale-[1.03]' : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}>
                  <span className="text-xl">{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Change */}
          {payment === 'Dinheiro' && (
            <div className="space-y-2 bg-secondary/50 rounded-xl p-4">
              <Label className="text-sm font-semibold flex items-center gap-2 text-foreground">💰 Precisa de troco?</Label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setNeedsChange(false); setChangeFor(''); }}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${!needsChange ? 'bg-primary text-primary-foreground shadow-lg scale-[1.03]' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}>
                  Não preciso
                </button>
                <button onClick={() => setNeedsChange(true)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${needsChange ? 'bg-primary text-primary-foreground shadow-lg scale-[1.03]' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}>
                  Sim, preciso
                </button>
              </div>
              {needsChange && (
                <Input placeholder="Troco para quanto? Ex: R$ 50,00" value={changeFor} onChange={e => setChangeFor(e.target.value)}
                  className="h-12 rounded-xl bg-background border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary mt-2" />
              )}
            </div>
          )}

          {/* Coupon */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Ticket className="h-4 w-4 text-primary" /> Cupom de desconto
            </Label>
            {couponApplied ? (
              <div className="flex items-center gap-2 bg-primary/10 rounded-xl px-4 py-3">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-primary flex-1">{couponCode.toUpperCase()} — -{formatPrice(couponDiscount)}</span>
                <button onClick={removeCoupon} className="text-xs text-destructive font-bold">Remover</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input placeholder="Digite o código" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  className="h-12 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary font-mono font-bold flex-1" />
                <Button onClick={applyCoupon} disabled={applyingCoupon || !couponCode.trim()} className="h-12 rounded-xl px-5 font-bold">
                  {applyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aplicar'}
                </Button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
              <StickyNote className="h-4 w-4" /> Observações (opcional)
            </Label>
            <Textarea placeholder="Alguma observação sobre o pedido?" value={notes} onChange={e => setNotes(e.target.value)}
              maxLength={500} rows={2} className="rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary resize-none" />
          </div>
        </div>

        <div className="px-6 pb-6">
          <Button className="w-full rounded-xl text-base font-bold py-6 gap-2 shadow-lg" onClick={handleSend}
            disabled={sending || (deliveryMode === 'delivery' && outOfRange)}>
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
