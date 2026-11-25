import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useCategories, type Category } from '@/hooks/useCategories';
import { motion } from 'framer-motion';

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
  categories?: Category[];
  /** Conteúdo extra fixado junto com a barra (ex.: busca do cardápio). */
  children?: React.ReactNode;
  /** Reduz a barra durante a rolagem; no desktop as classes sm: mantêm o tamanho original. */
  compact?: boolean;
}

const CategoryTabs = ({ activeCategory, onCategoryChange, categories: propCategories, children, compact = false }: CategoryTabsProps) => {
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
      {children}
      <div
        ref={containerRef}
        className={cn(
          "relative mx-auto flex max-w-3xl overflow-x-auto transition-all duration-300",
          compact ? "gap-1.5 px-3 py-1.5 sm:gap-2 sm:px-4 sm:py-3" : "gap-2 px-4 py-3"
        )}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
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
                "relative flex shrink-0 items-center whitespace-nowrap font-bold transition-all duration-300",
                compact
                  ? "flex-row gap-1.5 rounded-full px-3 py-1.5 text-[10px] sm:flex-col sm:gap-1 sm:rounded-2xl sm:px-3 sm:py-2 sm:text-xs"
                  : "flex-col gap-1 rounded-2xl px-3 py-2 text-xs",
                isActive
                  ? cn(
                      "bg-primary text-primary-foreground shadow-[0_4px_20px_hsl(var(--primary)/0.4)]",
                      compact ? "scale-100 sm:scale-105" : "scale-105"
                    )
                  : "bg-card text-muted-foreground shadow-sm hover:bg-secondary hover:text-foreground hover:shadow-md"
              )}
            >
              <span className={cn(
                "transition-all duration-300",
                compact ? "text-sm sm:text-lg" : "text-lg",
                isActive && !compact && "animate-bounce"
              )}>
                {cat.icon}
              </span>
              <span className={cn("leading-tight", compact ? "text-[10px] sm:text-[11px]" : "text-[11px]")}>{cat.label}</span>
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
