import { UtensilsCrossed } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-primary text-primary-foreground py-6 px-4 text-center shadow-lg">
      <div className="flex items-center justify-center gap-3">
        <UtensilsCrossed className="h-8 w-8" />
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ fontFamily: "'Fredoka One', cursive" }}>
            Point Do Pastel
          </h1>
          <p className="text-xs md:text-sm opacity-90 font-medium">Cardápio Digital</p>
        </div>
        <UtensilsCrossed className="h-8 w-8" />
      </div>
    </header>
  );
};

export default Header;
