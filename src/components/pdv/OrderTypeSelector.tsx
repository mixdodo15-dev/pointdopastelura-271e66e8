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
  onTypeChange: (t: OrderType) => void;
  onTableChange: (n: string) => void;
}

const OrderTypeSelector = ({ current, tableNumber, onTypeChange, onTableChange }: OrderTypeSelectorProps) => (
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
  </div>
);

export default OrderTypeSelector;
