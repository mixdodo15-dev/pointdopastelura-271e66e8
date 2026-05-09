interface OrderForWA {
  order_number: number | null;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  payment_method: string;
  total_price: number;
  notes?: string | null;
}

interface ItemForWA {
  product_name: string;
  quantity: number;
  unit_price: number;
}

const formatPrice = (v: number) => `R$ ${Number(v).toFixed(2).replace('.', ',')}`;
const sanitizePhone = (phone: string) => phone.replace(/\D/g, '');

export const buildEntregadorWhatsAppLink = (
  entregadorPhone: string,
  order: OrderForWA,
  items: ItemForWA[],
) => {
  const phone = sanitizePhone(entregadorPhone);
  const finalPhone = phone.startsWith('55') ? phone : `55${phone}`;
  const orderId = `Point-${String(order.order_number || 0).padStart(4, '0')}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_address)}`;

  const itemsText = items.length
    ? items.map(i => `• ${i.quantity}x ${i.product_name} — ${formatPrice(i.unit_price * i.quantity)}`).join('\n')
    : '(itens não carregados)';

  const message = [
    '🛵 *NOVO PEDIDO PARA ENTREGA*',
    '',
    `📋 *Pedido:* ${orderId}`,
    `👤 *Cliente:* ${order.customer_name}`,
    `📞 *Telefone:* ${order.customer_phone}`,
    '',
    `📍 *Endereço:*`,
    order.delivery_address,
    `🗺️ *Rota no Maps:* ${mapsUrl}`,
    '',
    `📦 *Itens:*`,
    itemsText,
    '',
    `💰 *Valor a cobrar:* ${formatPrice(order.total_price)}`,
    `💳 *Pagamento:* ${order.payment_method}`,
    order.notes ? `\n📝 *Obs:* ${order.notes}` : '',
    '',
    'Boa entrega! 🚀',
  ].filter(Boolean).join('\n');

  return `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
};
