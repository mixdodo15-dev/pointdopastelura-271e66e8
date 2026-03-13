interface PrintData {
  orderId: string;
  orderNumber?: number;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  orderType: string;
  tableNumber?: string;
  customerName?: string;
}

const ORDER_TYPE_LABELS: Record<string, string> = {
  balcao: 'Balcão',
  mesa: 'Mesa',
  retirada: 'Retirada',
  delivery: 'Delivery',
};

const PAYMENT_LABELS: Record<string, string> = {
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
  pix: 'PIX',
  misto: 'Misto',
};

export const printOrder = (data: PrintData) => {
  console.log('[Print:order]', data);

  const shortId = data.orderNumber ? `Point-${String(data.orderNumber).padStart(4, '0')}` : `Point-${data.orderId.slice(0, 4).toUpperCase()}`;
  const now = new Date().toLocaleString('pt-BR');

  let html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  @page { margin: 0; size: 80mm auto; }
  body { font-family: 'Arial Black', 'Helvetica Neue Black', 'Impact', sans-serif; font-weight: 900; font-size: 12px; width: 80mm; margin: 0 auto; padding: 4mm; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .line { border-top: 1px dashed #000; margin: 4px 0; }
  .row { display: flex; justify-content: space-between; }
  .big { font-size: 16px; font-weight: bold; }
  h1 { font-size: 18px; margin: 4px 0; }
  p { margin: 2px 0; }
</style>
</head><body>
<div class="center">
  <h1>🥟 POINT DO PASTEL</h1>
  <p>${now}</p>
  <p class="big">Pedido ${shortId}</p>
</div>
<div class="line"></div>
<p class="bold">${ORDER_TYPE_LABELS[data.orderType] || data.orderType}${data.tableNumber ? ` - Mesa ${data.tableNumber}` : ''}</p>
${data.customerName ? `<p>Cliente: ${data.customerName}</p>` : ''}
<div class="line"></div>
`;

  data.items.forEach(item => {
    html += `<div class="row"><span>${item.quantity}x ${item.name}</span><span>R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span></div>\n`;
  });

  html += `
<div class="line"></div>
<div class="row"><span>Subtotal</span><span>R$ ${data.subtotal.toFixed(2).replace('.', ',')}</span></div>`;

  if (data.discount > 0) {
    html += `\n<div class="row"><span>Desconto</span><span>-R$ ${data.discount.toFixed(2).replace('.', ',')}</span></div>`;
  }
  if (data.deliveryFee > 0) {
    html += `\n<div class="row"><span>Entrega</span><span>R$ ${data.deliveryFee.toFixed(2).replace('.', ',')}</span></div>`;
  }

  html += `
<div class="line"></div>
<div class="row big"><span>TOTAL</span><span>R$ ${data.total.toFixed(2).replace('.', ',')}</span></div>
<div class="line"></div>
<p>Pagamento: ${PAYMENT_LABELS[data.paymentMethod] || data.paymentMethod}</p>
<div class="center" style="margin-top:8px;">
  <p>Obrigado pela preferência!</p>
</div>
</body></html>`;

  const win = window.open('', '_blank', 'width=320,height=600');
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  }
};
