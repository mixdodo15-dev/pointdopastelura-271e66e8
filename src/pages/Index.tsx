import { useState } from 'react';
import Header from '@/components/Header';
import CategoryTabs from '@/components/CategoryTabs';
import MenuSection from '@/components/MenuSection';
import { CartProvider } from '@/contexts/CartContext';
import { CATEGORIES } from '@/data/menu';

const Index = () => {
  const [activeCategory, setActiveCategory] = useState('monte');
  const activeCat = CATEGORIES.find(c => c.id === activeCategory);

  return (
    <CartProvider>
      <div className="min-h-screen bg-background pb-24">
        <Header />
        <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

        <main className="max-w-3xl mx-auto px-4 py-6">
          <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2">
            <span>{activeCat?.icon}</span>
            <span>{activeCat?.label}</span>
          </h2>
          <div key={activeCategory} className="animate-fade-in">
            <MenuSection category={activeCategory} />
          </div>
        </main>
      </div>
    </CartProvider>
  );
};

export default Index;
