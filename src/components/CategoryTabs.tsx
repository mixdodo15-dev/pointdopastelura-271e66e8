import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useCategories, type Category } from '@/hooks/useCategories';
import { motion } from 'framer-motion';

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
  categories?: Category[];
}

const CategoryTabs = ({ activeCategory, onCategoryChange, categories: propCategories }: CategoryTabsProps) => {
  const { categories: dbCategories } = useCategories();
  const categories = propCategories || dbCategories;
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const activeTab = tabRefs.current[activeCategory];
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeCategory, categories]);

  return (
    <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-sm">
      <div
        ref={containerRef}
        className="relative flex overflow-x-auto gap-1.5 px-2 py-2.5 max-w-3xl mx-auto scrollbar-hide"
      >
        {categories.map((cat, idx) => {
          const isActive = activeCategory === cat.slug;
          return (
            <motion.button
              key={cat.slug}
              ref={el => { tabRefs.current[cat.slug] = el; }}
              onClick={() => onCategoryChange(cat.slug)}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-[9px] sm:text-[11px] font-bold whitespace-nowrap transition-all duration-300 shrink-0",
                isActive
                  ? "bg-primary text-primary-foreground shadow-[0_4px_16px_hsl(var(--primary)/0.35)] scale-105"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-secondary shadow-sm"
              )}
            >
              <span className={cn(
                "text-base transition-transform duration-300",
                isActive && "animate-bounce"
              )}>
                {cat.icon}
              </span>
              <span className="leading-tight truncate max-w-[64px]">{cat.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTabDot"
                  className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-primary-foreground"
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryTabs;
