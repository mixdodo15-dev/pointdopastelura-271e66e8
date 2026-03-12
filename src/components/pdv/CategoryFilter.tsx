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
  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
    <button
      onClick={() => onSelect('')}
      className={cn(
        "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap border transition-all duration-200",
        active === ''
          ? "bg-primary text-primary-foreground border-primary shadow-md"
          : "bg-card text-foreground border-border hover:border-primary hover:scale-105"
      )}
    >
      📋 Todos
    </button>
    {categories.map(cat => (
      <button
        key={cat.slug}
        onClick={() => onSelect(cat.slug)}
        className={cn(
          "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap border transition-all duration-200",
          active === cat.slug
            ? "bg-primary text-primary-foreground border-primary shadow-md"
            : "bg-card text-foreground border-border hover:border-primary hover:scale-105"
        )}
      >
        <span>{cat.icon}</span>
        <span>{cat.label}</span>
      </button>
    ))}
  </div>
);

export default CategoryFilter;
