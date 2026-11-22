import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Bike,
  Clock,
  CreditCard,
  Info,
  Instagram,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
} from 'lucide-react';
import { useRestaurantStatus } from '@/hooks/useRestaurantStatus';

const WHATSAPP_LINK = 'https://wa.me/5534984050892';
const PHONE_DISPLAY = '(34) 98405-0892';
const PHONE_TEL = 'tel:+5534984050892';
const ADDRESS_LINE_1 = 'Rua Professora Edith França, 68';
const ADDRESS_LINE_2 = 'Parque São Geraldo, Uberaba - MG';
const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${ADDRESS_LINE_1}, ${ADDRESS_LINE_2}`,
)}`;
const INSTAGRAM_LINK = 'https://instagram.com/pointdopastel.ura';
const INSTAGRAM_HANDLE = '@pointdopastel.ura';

const PAYMENTS = ['Cartão de Crédito', 'Cartão de Débito', 'Pix', 'Dinheiro'];

const Section = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-border bg-card p-4">
    <div className="flex items-center gap-2 mb-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <h3
        className="text-sm font-extrabold uppercase tracking-wide text-foreground"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {title}
      </h3>
    </div>
    {children}
  </div>
);

const StoreInfoDialog = () => {
  const { isOpen, label, subtitle } = useRestaurantStatus();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="flex h-9 items-center gap-2 rounded-full bg-primary px-3 text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95 sm:px-4"
          aria-label="Informações do Point do Pastel"
        >
          <Info className="h-4 w-4 shrink-0" />
          <span
            className="hidden text-xs font-bold sm:inline"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Informações
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="flex max-h-[85vh] w-[calc(100vw-1.5rem)] max-w-md flex-col gap-0 overflow-hidden rounded-[20px] border-0 p-0">
        <DialogHeader className="shrink-0 space-y-1 bg-primary px-5 py-4 pr-12 text-left">
          <DialogTitle
            className="text-base font-black uppercase tracking-wider text-primary-foreground"
            style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900 }}
          >
            Point do Pastel
          </DialogTitle>
          <DialogDescription className="text-xs font-medium text-primary-foreground/80">
            Horário, contato, endereço e formas de pagamento
          </DialogDescription>
          <span
            className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white ${
              isOpen ? 'bg-[hsl(145,100%,39%)] animate-pulse' : 'bg-destructive'
            }`}
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {label}
            <span className="font-medium normal-case tracking-normal opacity-90">
              · {subtitle}
            </span>
          </span>
        </DialogHeader>

        <div className="flex-1 space-y-3 overflow-y-auto bg-background p-4">
          {/* Contato */}
          <Section icon={<Phone className="h-4 w-4" />} title="Contato">
            <div className="space-y-2">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl bg-whatsapp px-3 py-2.5 text-whatsapp-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageCircle className="h-5 w-5 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold">Chamar no WhatsApp</span>
                  <span className="block truncate text-[11px] opacity-90">{PHONE_DISPLAY}</span>
                </span>
                <Navigation className="h-4 w-4 shrink-0 opacity-80" />
              </a>
              <a
                href={PHONE_TEL}
                className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2.5 text-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Phone className="h-5 w-5 shrink-0 text-primary" />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold">Telefone</span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {PHONE_DISPLAY}
                  </span>
                </span>
              </a>
            </div>
          </Section>

          {/* Localização */}
          <Section icon={<MapPin className="h-4 w-4" />} title="Localização">
            <p className="text-sm font-bold leading-snug text-foreground break-words">
              {ADDRESS_LINE_1}
            </p>
            <p className="text-xs font-medium text-muted-foreground break-words">
              {ADDRESS_LINE_2}
            </p>
            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 rounded-full border border-primary px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <MapPin className="h-3.5 w-3.5" />
              Ver no mapa
            </a>
          </Section>

          {/* Formas de pagamento */}
          <Section icon={<CreditCard className="h-4 w-4" />} title="Formas de pagamento">
            <div className="flex flex-wrap gap-2">
              {PAYMENTS.map((payment) => (
                <span
                  key={payment}
                  className="whitespace-nowrap rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-foreground"
                >
                  {payment}
                </span>
              ))}
            </div>
          </Section>

          {/* Horário */}
          <Section icon={<Clock className="h-4 w-4" />} title="Horário de funcionamento">
            <p className="text-sm font-bold text-foreground">Todos os dias · 18:00 às 00:00</p>
            <p className="text-xs font-medium text-muted-foreground">{subtitle}</p>
          </Section>

          {/* Prazo */}
          <Section icon={<Bike className="h-4 w-4" />} title="Prazo de entregas">
            <p className="text-sm font-bold text-foreground">Retirada e Delivery</p>
            <p className="text-xs font-medium text-muted-foreground">
              Tempo médio: até 60 min
            </p>
          </Section>

          {/* Redes */}
          <Section icon={<Instagram className="h-4 w-4" />} title="Siga-nos nas redes sociais">
            <a
              href={INSTAGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2.5 text-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Instagram className="h-5 w-5 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate text-sm font-bold">
                {INSTAGRAM_HANDLE}
              </span>
              <Navigation className="h-4 w-4 shrink-0 text-primary opacity-80" />
            </a>
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoreInfoDialog;
