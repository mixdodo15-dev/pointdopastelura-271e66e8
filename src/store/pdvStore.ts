import { create } from 'zustand';

export interface PdvItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  imageUrl?: string;
  flavors?: string[];
  adicionais?: { name: string; price: number }[];
}

export type OrderType = 'balcao' | 'mesa' | 'retirada' | 'delivery';

interface PdvState {
  items: PdvItem[];
  orderType: OrderType;
  tableNumber: string;
  customerName: string;
  discount: number;
  deliveryFee: number;
  
  // Computed
  subtotal: number;
  total: number;
  
  // Actions
  addItem: (item: Omit<PdvItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
  applyDiscount: (value: number) => void;
  setDeliveryFee: (fee: number) => void;
  setOrderType: (type: OrderType) => void;
  setTableNumber: (num: string) => void;
  setCustomerName: (name: string) => void;
  clearCart: () => void;
}

const calcItemTotal = (item: PdvItem) => {
  const adicionaisTotal = item.adicionais?.reduce((s, a) => s + a.price, 0) || 0;
  return (item.price + adicionaisTotal) * item.quantity;
};

const recalc = (items: PdvItem[], discount: number, deliveryFee: number) => {
  const subtotal = items.reduce((s, i) => s + calcItemTotal(i), 0);
  const total = Math.max(0, subtotal - discount + deliveryFee);
  return { subtotal, total };
};

export const usePdvStore = create<PdvState>((set) => ({
  items: [],
  orderType: 'balcao',
  tableNumber: '',
  customerName: '',
  discount: 0,
  deliveryFee: 0,
  subtotal: 0,
  total: 0,

  addItem: (item) => set((s) => {
    // Create unique ID based on flavors and adicionais
    const flavorKey = item.flavors?.sort().join(',') || '';
    const adicionaisKey = item.adicionais?.map(a => a.name).sort().join(',') || '';
    const uniqueId = `${item.id}-${flavorKey}-${adicionaisKey}`;
    
    const existing = s.items.find(i => i.id === uniqueId);
    const newItems = existing
      ? s.items.map(i => i.id === uniqueId ? { ...i, quantity: i.quantity + 1 } : i)
      : [...s.items, { ...item, id: uniqueId, quantity: 1 }];
    console.log('[PDV:addItem]', item);
    return { items: newItems, ...recalc(newItems, s.discount, s.deliveryFee) };
  }),

  removeItem: (id) => set((s) => {
    const newItems = s.items.filter(i => i.id !== id);
    return { items: newItems, ...recalc(newItems, s.discount, s.deliveryFee) };
  }),

  increaseQty: (id) => set((s) => {
    const newItems = s.items.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i);
    return { items: newItems, ...recalc(newItems, s.discount, s.deliveryFee) };
  }),

  decreaseQty: (id) => set((s) => {
    const newItems = s.items
      .map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i)
      .filter(i => i.quantity > 0);
    return { items: newItems, ...recalc(newItems, s.discount, s.deliveryFee) };
  }),

  applyDiscount: (value) => set((s) => ({
    discount: value,
    ...recalc(s.items, value, s.deliveryFee),
  })),

  setDeliveryFee: (fee) => set((s) => ({
    deliveryFee: fee,
    ...recalc(s.items, s.discount, fee),
  })),

  setOrderType: (type) => set((s) => {
    const fee = type === 'delivery' ? s.deliveryFee : 0;
    return { orderType: type, deliveryFee: fee, ...recalc(s.items, s.discount, fee) };
  }),

  setTableNumber: (num) => set({ tableNumber: num }),
  setCustomerName: (name) => set({ customerName: name }),

  clearCart: () => set({
    items: [],
    discount: 0,
    deliveryFee: 0,
    subtotal: 0,
    total: 0,
    tableNumber: '',
    customerName: '',
    orderType: 'balcao',
  }),
}));
