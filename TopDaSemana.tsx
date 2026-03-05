import { useState, useEffect, useRef, useCallback } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Plus, Flame, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

const formatPrice = (price: number) =>
  `R$ ${price.toFixed(2).replace('.', ',')}`;

const TopDaSemana = () => {
  const { products, loading } = useProducts();
  const { addItem } = useCart();
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef(0);
  const touchDelta = useRef(0);
  const autoplayRef = useRef<ReturnType<typeof setInterval>>();

  const topProducts = products.filter(p => p.isTopWeek);

  const goTo = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(idx, topProducts.length - 1));
    setCurrent(clamped);
  }, [topProducts.length]);

  // Auto slide
  useEffect(() => {
    if (topProducts.length <= 1) return;
    autoplayRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % topProducts.length);
    }, 4000);
    return () => clearInterval(autoplayRef.current);
  }, [topProducts.length]);

  const pauseAutoplay = () => clearInterval(autoplayRef.current);

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    pauseAutoplay();
    touchStart.current = e.touches[0].clientX;
    touchDelta.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchDelta.current = e.touches[0].clientX - touchStart.current;
  };
  const onTouchEnd = () => {
    if (Math.abs(touchDelta.current) > 50) {
      goTo(current + (touchDelta.current < 0 ? 1 : -1));
    }
  };

  if (loading || topProducts.length === 0) return null;

  const handleAdd = (item: typeof topProducts[0]) => {
    addItem({ id: item.id, name: item.name, price: item.price });
    toast.success(`${item.name} adicionado!`);
  };

  return (
    <section className="w-full py-8 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(0,100%,30%) 0%, hsl(0,0%,8%) 100%)' }}>
      {/* Header */}
      <div className="text-center mb-6 px-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Flame className="h-6 w-6 text-orange-400 animate-pulse" />
          <h2
            className="text-2xl font-black text-white tracking-widest"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            TOP DA SEMANA
          </h2>
          <Flame className="h-6 w-6 text-orange-400 animate-pulse" />
        </div>
        <p className="text-white/60 text-sm font-medium">
          Os produtos mais pedidos da semana!
        </p>
      </div>

      {/* Carousel */}
      <div
        className="relative max-w-sm mx-auto px-6"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          ref={trackRef}
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {topProducts.map((item) => (
            <div
              key={item.id}
              className="w-full flex-shrink-0 px-2"
            >
              <div className="bg-white rounded-[20px] shadow-xl overflow-hidden">
                {/* Image */}
                <div className="relative w-full h-48 sm:h-56">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[hsl(0,100%,38%)] to-[hsl(0,100%,25%)] flex items-center justify-center">
                      <Flame className="h-12 w-12 text-white/30" />
                    </div>
                  )}
                  {/* TOP tag */}
                  <span className="absolute top-3 right-3 bg-[hsl(0,100%,38%)] text-white text-[11px] font-black px-3 py-1 rounded-full shadow-lg tracking-wider flex items-center gap-1">
                    🔥 TOP
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-lg text-[hsl(0,0%,10%)] leading-tight line-clamp-1">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-[hsl(0,0%,45%)] leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xl font-black text-[hsl(0,100%,38%)]">
                      {formatPrice(item.price)}
                    </span>
                    <Button
                      size="sm"
                      className="rounded-full px-5 h-9 text-xs font-bold bg-[hsl(0,100%,38%)] hover:bg-[hsl(0,100%,30%)] text-white shadow-md"
                      onClick={() => handleAdd(item)}
                    >
                      <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                      Pedir
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      {topProducts.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          {topProducts.map((_, i) => (
            <button
              key={i}
              onClick={() => { pauseAutoplay(); goTo(i); }}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 h-2.5 bg-white'
                  : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default TopDaSemana;
