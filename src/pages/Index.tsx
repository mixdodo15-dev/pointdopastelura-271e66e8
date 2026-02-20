import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import CategoryTabs from '@/components/CategoryTabs';
import MenuSection from '@/components/MenuSection';
import { CartProvider } from '@/contexts/CartContext';
import { useCategories } from '@/hooks/useCategories';
import AnimatedCard from '@/components/AnimatedCard';
import SectionTitle from '@/components/SectionTitle';

const Index = () => {
  const { categories, loading } = useCategories();
  const [activeCategory, setActiveCategory] = useState('');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isScrollingTo = useRef(false);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].slug);
    }
  }, [categories, activeCategory]);

  const handleCategoryChange = (slug: string) => {
    isScrollingTo.current = true;
    setActiveCategory(slug);
    const el = sectionRefs.current[slug];
    if (el) {
      const offset = 70;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      setTimeout(() => { isScrollingTo.current = false; }, 800);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingTo.current) return;
      let current = categories[0]?.slug || '';
      for (const cat of categories) {
        const el = sectionRefs.current[cat.slug];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) {
            current = cat.slug;
          }
        }
      }
      setActiveCategory(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-background pb-24">
        <Header />
        <CategoryTabs activeCategory={activeCategory} onCategoryChange={handleCategoryChange} categories={categories} />

        <main className="max-w-3xl mx-auto px-4 py-6 space-y-10">
          {categories.map((cat, idx) => (
            <AnimatedCard
              key={cat.slug}
              index={idx}
              className="scroll-mt-20"
            >
              <div
                ref={el => { sectionRefs.current[cat.slug] = el; }}
                id={`section-${cat.slug}`}
              >
                <SectionTitle icon={cat.icon} label={cat.label} />
                <MenuSection category={cat.slug} />
              </div>
            </AnimatedCard>
          ))}
        </main>
      </div>
    </CartProvider>
  );
};

export default Index;
