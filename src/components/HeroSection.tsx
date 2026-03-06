import { Search, User } from 'lucide-react';
import { ShoppingBag, Clock, Bike } from 'lucide-react';
import heroBg from '@/assets/hero-pastel.jpg';
import logoImg from '@/assets/logo-point.jpg';
import { useRestaurantStatus } from '@/hooks/useRestaurantStatus';

const HeroSection = () => {
  const { isOpen, label, subtitle } = useRestaurantStatus();

  return (
    <section className="relative w-full">
      {/* Banner with overlay */}
      <div className="relative w-full h-56 sm:h-64 md:h-72 overflow-hidden">
        <img
          src={heroBg}
          alt="Pastel artesanal"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(0,0%,0%,0.4)] via-[hsl(0,0%,0%,0.2)] to-[hsl(0,0%,0%,0.7)]" />

        {/* Top icons */}
        <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
          <button className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
            <Search className="h-5 w-5 text-white" />
          </button>
          <button className="p-2 rounded-full bg-[hsl(0,100%,38%)] hover:bg-[hsl(0,100%,30%)] transition-colors shadow-lg">
            <User className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Logo circular */}
      <div className="relative z-10 flex justify-center -mt-14">
        <div className="w-28 h-28 rounded-full bg-white border-4 border-[hsl(0,100%,38%)] shadow-xl overflow-hidden">
          <img src={logoImg} alt="Point do Pastel" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Info Card */}
      <div className="relative z-10 max-w-md mx-auto px-4 -mt-4">
        <div className="bg-white rounded-[20px] shadow-lg p-5 space-y-4">
          <div className="text-center">
            <h2
              className="text-xl font-black text-[hsl(0,0%,10%)] tracking-tight"
              style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900 }}
            >
              POINT DO PASTEL
            </h2>
            <p className="text-sm font-semibold text-[hsl(0,100%,38%)] mt-1 flex items-center justify-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
              Aberto até às 23:00
            </p>
          </div>

          {/* Delivery options */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-2 bg-[hsl(0,0%,96%)] rounded-xl px-4 py-2">
              <ShoppingBag className="h-4 w-4 text-[hsl(0,100%,38%)]" />
              <span className="text-xs font-bold text-[hsl(0,0%,10%)]">Retirada</span>
              <Clock className="h-3 w-3 text-[hsl(0,0%,45%)]" />
              <span className="text-[11px] font-medium text-[hsl(0,0%,45%)]">30 min</span>
            </div>
            <div className="flex items-center gap-2 bg-[hsl(0,0%,96%)] rounded-xl px-4 py-2">
              <Bike className="h-4 w-4 text-[hsl(0,100%,38%)]" />
              <span className="text-xs font-bold text-[hsl(0,0%,10%)]">Delivery</span>
              <Clock className="h-3 w-3 text-[hsl(0,0%,45%)]" />
              <span className="text-[11px] font-medium text-[hsl(0,0%,45%)]">60 min</span>
            </div>
          </div>

          {/* Minimum order */}
          <p className="text-center text-xs font-bold text-[hsl(0,100%,38%)]">
            Pedido mínimo: R$ 10,00
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
