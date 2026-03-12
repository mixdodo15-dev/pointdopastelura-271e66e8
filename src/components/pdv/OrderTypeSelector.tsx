import { cn } from '@/lib/utils';
import { Store, UtensilsCrossed, ShoppingBag, Truck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { OrderType } from '@/store/pdvStore';

const types: { value: OrderType; label: string; icon: React.ReactNode }[] = [
  { value: 'balcao', label: 'Balcão', icon: <Store className="h-4 w-4" /> },
  { value: 'mesa', label: 'Mesa', icon: <UtensilsCrossed className="h-4 w-4" /> },
  { value: 'retirada', label: 'Retirada', icon: <ShoppingBag className="h-4 w-4" /> },
  { value: 'delivery', label: 'Delivery', icon: <Truck className="h-4 w-4" /> },
];

interface OrderTypeSelectorProps {
  current: OrderType;
  tableNumber: string;
  onTypeChange: (t: OrderType) => void;
  onTableChange: (n: string) => void;
}

const OrderTypeSelector = ({ current, tableNumber, onTypeChange, onTableChange }: OrderTypeSelectorProps) => (
  <div className="space-y-2">
    <div className="grid grid-cols-4 gap-1.5">
      {types.map(t => (
        <button
          key={t.value}
          onClick={() => onTypeChange(t.value)}
          className={cn(
            "flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-bold border transition-all duration-200",
            current === t.value
              ? "bg-primary text-primary-foreground border-primary shadow-md"
              : "bg-card text-foreground border-border hover:border-primary"
          )}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
    {current === 'mesa' && (
      <Input
        placeholder="Nº da mesa"
        value={tableNumber}
        onChange={e => onTableChange(e.target.value)}
        className="rounded-xl bg-card"
      />
    )}
  </div>
);

export default OrderTypeSelector;
