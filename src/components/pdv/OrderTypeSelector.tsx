import { cn } from '@/lib/utils';
import { Store, UtensilsCrossed, ShoppingBag, Truck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { OrderType } from '@/store/pdvStore';

const types: { value: OrderType; label: string; icon: React.ReactNode }[] = [
  { value: 'balcao', label: 'Balcão', icon: <Store className="h-3.5 w-3.5" /> },
  { value: 'mesa', label: 'Mesa', icon: <UtensilsCrossed className="h-3.5 w-3.5" /> },
  { value: 'retirada', label: 'Retirada', icon: <ShoppingBag className="h-3.5 w-3.5" /> },
  { value: 'delivery', label: 'Delivery', icon: <Truck className="h-3.5 w-3.5" /> },
];

interface OrderTypeSelectorProps {
  current: OrderType;
  tableNumber: string;
  deliveryFee: number;
  onTypeChange: (t: OrderType) => void;
  onTableChange: (n: string) => void;
  onDeliveryFeeChange: (fee: number) => void;
}

const OrderTypeSelector = ({ current, tableNumber, deliveryFee, onTypeChange, onTableChange, onDeliveryFeeChange }: OrderTypeSelectorProps) => (
  <div className="space-y-1.5">
    <div className="flex gap-1">
      {types.map(t => (
        <button
          key={t.value}
          onClick={() => onTypeChange(t.value)}
          className={cn(
            "flex items-center gap-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all duration-200",
            current === t.value
              ? "bg-accent text-accent-foreground border-accent shadow-md shadow-accent/15"
              : "bg-card text-foreground border-border hover:border-accent/50 active:scale-95"
          )}
        >
          {t.icon}
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}
    </div>
    {current === 'mesa' && (
      <Input
        placeholder="Nº da mesa"
        value={tableNumber}
        onChange={e => onTableChange(e.target.value)}
        className="rounded-xl bg-card h-9 text-sm border"
        autoFocus
      />
    )}
    {current === 'delivery' && (
      <div className="flex items-center gap-2">
        <Truck className="h-4 w-4 text-primary shrink-0" />
        <Input
          type="number"
          step="0.50"
          min="0"
          placeholder="Taxa de entrega (R$)"
          value={deliveryFee > 0 ? deliveryFee : ''}
          onChange={e => {
            const val = parseFloat(e.target.value);
            onDeliveryFeeChange(isNaN(val) ? 0 : val);
          }}
          className="rounded-xl bg-card h-9 text-sm border"
          autoFocus
        />
      </div>
    )}
  </div>
);

export default OrderTypeSelector;
