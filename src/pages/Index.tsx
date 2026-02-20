import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '@/components/Header';
import CategoryTabs from '@/components/CategoryTabs';
import MenuSection from '@/components/MenuSection';
import { CartProvider } from '@/contexts/CartContext';
import { CATEGORIES } from '@/data/menu';

const SectionReveal = ({ children, id, sectionRef, isActive }: { children: React.ReactNode; id: string; sectionRef: (el: HTMLDivElement | null) => void; isActive: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Flash animation when section becomes active
  useEffect(() => {
    if (isActive && visible) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 500);
      return () => clearTimeout(t);
    }
  }, [isActive]);

  return (
    <div
      ref={(el) => { (ref as React.MutableRefObject<HTMLDivElement | null>).current = el; sectionRef(el); }}
      id={id}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${flash ? 'animate-section-highlight' : ''}`}
    >
      {children}
    </div>
  );
};

const Index = () => {
  const [activeCategory, setActiveCategory] = useState('monte');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isScrollingTo = useRef(false);

  const handleCategoryChange = (id: string) => {
    isScrollingTo.current = true;
    setActiveCategory(id);
    const el = sectionRefs.current[id];
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
      let current = 'monte';
      for (const cat of CATEGORIES) {
        const el = sectionRefs.current[cat.id];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) {
            current = cat.id;
          }
        }
      }
      setActiveCategory(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <CartProvider>
      <div className="min-h-screen bg-background pb-24">
        <Header />
        <CategoryTabs activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />

        <main className="max-w-3xl mx-auto px-4 py-6 space-y-10">
          {CATEGORIES.map(cat => (
            <SectionReveal
              key={cat.id}
              id={`section-${cat.id}`}
              sectionRef={el => { sectionRefs.current[cat.id] = el; }}
              isActive={activeCategory === cat.id}
            >
              <div className="flex flex-col items-center mb-5">
                <span className="text-3xl mb-1">{cat.icon}</span>
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {cat.label}
                </h2>
                <div className="h-1 w-12 bg-primary rounded-full mt-2" />
              </div>
              <MenuSection category={cat.id} />
            </SectionReveal>
          ))}
        </main>
      </div>
    </CartProvider>
  );
};

export default Index;
