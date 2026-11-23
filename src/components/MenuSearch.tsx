import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MenuSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  /** Termo já aplicado (depois de tocar em Buscar). */
  activeTerm: string;
  /** Quantidade de produtos encontrados, ou null quando não há busca ativa. */
  resultCount: number | null;
}

const MenuSearch = ({ value, onChange, onSearch, onClear, activeTerm, resultCount }: MenuSearchProps) => {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-2 pt-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
        className="flex items-center gap-2"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border-2 border-border bg-card px-3 py-1.5 shadow-sm focus-within:border-primary">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Buscar no cardápio..."
            aria-label="Buscar produto no cardápio"
            className="h-8 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
          />
          {(value || activeTerm) && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Limpar busca"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-transform hover:scale-110 active:scale-95"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button
          type="submit"
          className="h-11 shrink-0 rounded-full bg-primary px-4 text-xs font-extrabold uppercase tracking-wide text-primary-foreground shadow-md shadow-primary/30 transition-transform hover:scale-105 active:scale-95"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          <Search className="mr-1.5 h-4 w-4" />
          Buscar
        </Button>
      </form>

      {activeTerm && (
        <p className="mt-1.5 px-1 text-xs font-bold text-muted-foreground">
          {resultCount === 0 ? (
            <span className="text-primary">Nenhum produto encontrado para "{activeTerm}"</span>
          ) : (
            <span>
              {resultCount} {resultCount === 1 ? 'produto encontrado' : 'produtos encontrados'} para "{activeTerm}"
            </span>
          )}
        </p>
      )}
    </div>
  );
};

export default MenuSearch;
