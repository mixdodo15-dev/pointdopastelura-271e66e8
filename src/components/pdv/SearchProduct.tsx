import { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchProductProps {
  value: string;
  onChange: (v: string) => void;
}

const SearchProduct = ({ value, onChange }: SearchProductProps) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        ref={ref}
        placeholder="Buscar produto... (F2)"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="pl-10 pr-8 rounded-xl bg-card border h-10 text-sm font-medium"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/20 transition-colors"
          aria-label="Limpar busca"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

export default SearchProduct;
