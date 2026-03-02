import { Instagram, MessageCircle, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-8 px-4 mt-10">
      <div className="max-w-3xl mx-auto space-y-5">
        <h2
          className="text-center text-xl font-extrabold tracking-tight"
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, letterSpacing: '0.05em' }}
        >
          POINT DO PASTEL
        </h2>

        <div className="flex flex-col sm:flex-row sm:justify-center gap-4 text-sm">
          <a
            href="https://instagram.com/pointdopastel.ura"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 justify-center hover:text-primary transition-colors"
          >
            <Instagram className="h-5 w-5" />
            @pointdopastel.ura
          </a>

          <a
            href="https://wa.me/5534984050892"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 justify-center hover:text-primary transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            (34) 98405-0892
          </a>

          <div className="flex items-center gap-2 justify-center text-background/70">
            <MapPin className="h-5 w-5 shrink-0" />
            <span>Rua Professora Edthi França, 72 - Parque São Geraldo</span>
          </div>
        </div>

        <p className="text-center text-xs text-background/40">
          © {new Date().getFullYear()} Point do Pastel. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
