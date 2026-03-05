import { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useCategories, type Category } from '@/hooks/useCategories';

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
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const updateIndicator = useCallback(() => {
    const activeTab = tabRefs.current[activeCategory];
    const container = containerRef.current;
    if (activeTab && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      setIndicator({
        left: tabRect.left - containerRect.left + container.scrollLeft,
        width: tabRect.width,
      });
    }
  }, [activeCategory]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      updateIndicator();
      const activeTab = tabRefs.current[activeCategory];
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [activeCategory, categories, updateIndicator]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || categories.length === 0) return;
    const onScroll = () => updateIndicator();
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [categories.length, updateIndicator]);

  useEffect(() => {
    if (categories.length === 0) return;
    const ro = new ResizeObserver(() => updateIndicator());
    const container = containerRef.current;
    if (container) ro.observe(container);
    return () => ro.disconnect();
  }, [categories.length, updateIndicator]);

  if (categories.length === 0) return null;

  return (
    <div className="sticky top-[72px] z-30 bg-background border-b shadow-sm">
      <div
        ref={containerRef}
        className="relative flex overflow-x-auto gap-1 p-2 max-w-3xl mx-auto scrollbar-hide"
      >
        <div
          className="absolute bottom-1 h-1 rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ left: indicator.left, width: indicator.width }}
        />
        {categories.map(cat => (
          <button
            key={cat.slug}
            ref={el => { tabRefs.current[cat.slug] = el; }}
            onClick={() => onCategoryChange(cat.slug)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border-2",
              activeCategory === cat.slug
                ? "bg-primary text-primary-foreground shadow-lg scale-105 border-primary"
                : "bg-white text-primary border-primary/30 hover:border-primary hover:bg-primary/5"
            )}
          >
            <span className="transition-transform duration-300">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
