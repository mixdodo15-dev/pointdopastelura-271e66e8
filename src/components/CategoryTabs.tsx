import { CATEGORIES } from '@/data/menu';
import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <div className="sticky top-0 z-30 bg-background border-b shadow-sm">
      <div className="flex overflow-x-auto gap-1 p-2 max-w-3xl mx-auto scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2",
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground shadow-lg scale-105 border-primary"
                : "bg-white text-primary border-primary/30 hover:border-primary hover:bg-primary/5"
            )}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
