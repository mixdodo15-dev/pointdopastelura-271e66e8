import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CategoryTabs from '@/components/CategoryTabs';
import MenuSection from '@/components/MenuSection';
import { CartProvider } from '@/contexts/CartContext';
import { useCategories } from '@/hooks/useCategories';

const Index = () => {
  const { categories, loading } = useCategories();
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].slug);
    }
  }, [categories, activeCategory]);

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeCat = categories.find(c => c.slug === activeCategory);

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

        <main className="max-w-3xl mx-auto px-4 py-6">
          {activeCat && (
            <div key={activeCat.slug} className="animate-fade-in">
              <div className="flex flex-col items-center mb-5">
                <span className="text-3xl mb-1">{activeCat.icon}</span>
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {activeCat.label}
                </h2>
                <div className="h-1 w-12 bg-primary rounded-full mt-2" />
              </div>
              <MenuSection category={activeCat.slug} />
            </div>
          )}
        </main>
      </div>
    </CartProvider>
  );
};

export default Index;
