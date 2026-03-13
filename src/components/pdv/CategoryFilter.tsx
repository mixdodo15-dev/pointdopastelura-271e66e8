import { cn } from '@/lib/utils';

interface Category {
  id: string;
  slug: string;
  label: string;
  icon: string;
}

interface CategoryFilterProps {
  categories: Category[];
  active: string;
  onSelect: (slug: string) => void;
}

const CategoryFilter = ({ categories, active, onSelect }: CategoryFilterProps) => (
  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
    <button
      onClick={() => onSelect('')}
      className={cn(
        "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all duration-200",
        active === ''
          ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/15"
          : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-secondary active:scale-95"
      )}
    >
      📋 Todos
    </button>
    {categories.map(cat => (
      <button
        key={cat.slug}
        onClick={() => onSelect(cat.slug)}
        className={cn(
          "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all duration-200",
          active === cat.slug
            ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/15"
            : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-secondary active:scale-95"
        )}
      >
        <span>{cat.icon}</span>
        <span>{cat.label}</span>
      </button>
    ))}
  </div>
);

export default CategoryFilter;
