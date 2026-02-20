import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import CategoryTabs from '@/components/CategoryTabs';
import MenuSection from '@/components/MenuSection';
import { CartProvider } from '@/contexts/CartContext';
import { useCategories } from '@/hooks/useCategories';

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
          {categories.map(cat => (
            <div
              key={cat.slug}
              ref={el => { sectionRefs.current[cat.slug] = el; }}
              id={`section-${cat.slug}`}
              className="animate-fade-in"
            >
              <div className="flex flex-col items-center mb-5">
                <span className="text-3xl mb-1">{cat.icon}</span>
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {cat.label}
                </h2>
                <div className="h-1 w-12 bg-primary rounded-full mt-2" />
              </div>
              <MenuSection category={cat.slug} />
            </div>
          ))}
        </main>
      </div>
    </CartProvider>
  );
};

export default Index;
