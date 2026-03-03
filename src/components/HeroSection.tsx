import { Search, User } from 'lucide-react';
import { ShoppingBag, Clock, Bike } from 'lucide-react';
import heroBg from '@/assets/hero-pastel.jpg';

const HeroSection = () => {
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
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(0,100%,20%,0.6)] via-[hsl(0,100%,25%,0.4)] to-[hsl(0,100%,20%,0.8)]" />

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
        <div className="w-28 h-28 rounded-full bg-white border-4 border-[hsl(0,100%,38%)] shadow-xl flex items-center justify-center">
          <div className="text-center">
            <p className="text-[hsl(0,100%,38%)] font-black text-xs leading-tight tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>
              POINT
            </p>
            <p className="text-[hsl(0,100%,38%)] font-black text-[10px] leading-tight tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>
              DO
            </p>
            <p className="text-[hsl(0,100%,38%)] font-black text-xs leading-tight tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>
              PASTEL
            </p>
          </div>
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
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[hsl(0,0%,96%)] rounded-2xl p-3 text-center space-y-1.5">
              <ShoppingBag className="h-5 w-5 mx-auto text-[hsl(0,100%,38%)]" />
              <p className="text-xs font-bold text-[hsl(0,0%,10%)]">Retirada</p>
              <div className="flex items-center justify-center gap-1 text-[hsl(0,0%,45%)]">
                <Clock className="h-3 w-3" />
                <span className="text-[11px] font-medium">30 min</span>
              </div>
            </div>
            <div className="bg-[hsl(0,0%,96%)] rounded-2xl p-3 text-center space-y-1.5">
              <Bike className="h-5 w-5 mx-auto text-[hsl(0,100%,38%)]" />
              <p className="text-xs font-bold text-[hsl(0,0%,10%)]">Delivery</p>
              <div className="flex items-center justify-center gap-1 text-[hsl(0,0%,45%)]">
                <Clock className="h-3 w-3" />
                <span className="text-[11px] font-medium">60 min</span>
              </div>
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
