import { useState, useEffect, useRef, useMemo } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import BottomNav from '@/components/BottomNav';
import CategoryTabs from '@/components/CategoryTabs';
import MenuSection from '@/components/MenuSection';
import MenuSearch from '@/components/MenuSearch';
import Footer from '@/components/Footer';
import { CartProvider } from '@/contexts/CartContext';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { filterProducts, matchingCategories } from '@/lib/menuSearch';
import AnimatedCard from '@/components/AnimatedCard';
import SectionTitle from '@/components/SectionTitle';
import TopDaSemana from '@/components/TopDaSemana';
import AuthBanner from '@/components/AuthBanner';
import { Button } from '@/components/ui/button';
import { SearchX } from 'lucide-react';
import { useMenuCompact } from '@/hooks/useMenuCompact';

const Index = () => {
  const { categories, loading } = useCategories();
  const { products } = useProducts();
  const compact = useMenuCompact();
  const [activeCategory, setActiveCategory] = useState('');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isScrollingTo = useRef(false);
  const [cartSheetOpen, setCartSheetOpen] = useState(false);

  // Busca do cardápio
  const [searchInput, setSearchInput] = useState('');
  const [activeTerm, setActiveTerm] = useState('');

  const searching = activeTerm.trim().length > 0;
  // Só entram na busca os produtos de categorias que realmente aparecem no cardápio.
  const searchable = useMemo(() => {
    const visible = new Set(categories.map(c => c.slug));
    return products.filter(p => visible.has(p.category));
  }, [products, categories]);
  const matched = useMemo(() => matchingCategories(searchable, activeTerm), [searchable, activeTerm]);
  const matchCount = useMemo(() => filterProducts(searchable, activeTerm).length, [searchable, activeTerm]);
  const visibleCategories = searching ? categories.filter(c => matched.has(c.slug)) : categories;

  // Auto-open cart after registration
  useEffect(() => {
    const shouldOpen = localStorage.getItem('open_cart_after_signup');
    if (shouldOpen === 'true') {
      localStorage.removeItem('open_cart_after_signup');
      // Small delay to ensure page and auth are ready
      const timer = setTimeout(() => {
        setCartSheetOpen(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

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
      const bar = document.querySelector('.sticky.top-0') as HTMLElement | null;
      const offset = (bar?.offsetHeight ?? 60) + 12;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      setTimeout(() => { isScrollingTo.current = false; }, 800);
    }
  };

  const handleSearch = () => {
    const term = searchInput.trim();
    setActiveTerm(term);
    if (term) {
      const el = document.getElementById('cardapio');
      if (el) {
        const bar = document.querySelector('.sticky.top-0') as HTMLElement | null;
        const offset = (bar?.offsetHeight ?? 60) + 12;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    setActiveTerm('');
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
        <HeroSection />
        <AuthBanner />
        <Header cartOpen={cartSheetOpen} setCartOpen={setCartSheetOpen} />

        <TopDaSemana />

        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          categories={visibleCategories}
        >
          <MenuSearch
            value={searchInput}
            onChange={setSearchInput}
            onSearch={handleSearch}
            onClear={clearSearch}
            activeTerm={activeTerm}
            resultCount={searching ? matchCount : null}
          />
        </CategoryTabs>

        <main id="cardapio" className="max-w-3xl mx-auto scroll-mt-20 px-4 py-6 space-y-10">
          {searching && matchCount === 0 ? (
            <div className="rounded-[14px] border-2 border-dashed border-border bg-card p-8 text-center">
              <SearchX className="mx-auto h-10 w-10 text-primary" />
              <h3 className="mt-3 text-base font-extrabold text-foreground" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Nenhum produto encontrado
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Não achamos nada para "<span className="font-bold text-primary">{activeTerm}</span>". Tente outro nome.
              </p>
              <Button className="mt-4 rounded-full bg-primary font-extrabold text-primary-foreground" onClick={clearSearch}>
                Ver cardápio completo
              </Button>
            </div>
          ) : (
            visibleCategories.map((cat, idx) => (
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
                  <MenuSection category={cat.slug} searchTerm={activeTerm} compact={compact} />
                </div>
              </AnimatedCard>
            ))
          )}
        </main>

        <Footer />
        <BottomNav onCartOpen={() => setCartSheetOpen(true)} />
      </div>
    </CartProvider>
  );
};

export default Index;
