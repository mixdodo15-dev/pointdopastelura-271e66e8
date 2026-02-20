import { useRef, useEffect, useState } from 'react';
import { CATEGORIES } from '@/data/menu';
import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const activeTab = tabRefs.current[activeCategory];
    const container = containerRef.current;
    if (activeTab && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      setIndicator({
        left: tabRect.left - containerRect.left + container.scrollLeft,
        width: tabRect.width,
      });
      // Scroll active tab into view
      activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeCategory]);

  return (
    <div className="sticky top-0 z-30 bg-background border-b shadow-sm">
      <div
        ref={containerRef}
        className="relative flex overflow-x-auto gap-1 p-2 max-w-3xl mx-auto scrollbar-hide"
      >
        {/* Animated indicator */}
        <div
          className="absolute bottom-1 h-1 rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ left: indicator.left, width: indicator.width }}
        />
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            ref={el => { tabRefs.current[cat.id] = el; }}
            onClick={() => onCategoryChange(cat.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border-2",
              activeCategory === cat.id
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
