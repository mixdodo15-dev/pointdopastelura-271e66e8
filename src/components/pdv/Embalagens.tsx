import { useState } from 'react';
import { Package, Box, Ruler, Palette, Leaf, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PackagingItem {
  id: string;
  name: string;
  icon: string;
  category: string;
  dimensions: string;
  material: string;
  color: string;
  ecoFriendly: boolean;
  description: string;
  specs: { label: string; value: string }[];
  brandElements: string[];
}

const PACKAGING_DATA: PackagingItem[] = [
  {
    id: '1',
    name: 'Embalagem Pastel Tradicional',
    icon: '🥟',
    category: 'Pastéis',
    dimensions: '18cm x 12cm x 5cm',
    material: 'Papel kraft com revestimento antigordo',
    color: 'Vermelho Point do Pastel + Branco',
    ecoFriendly: true,
    description: 'Embalagem padrão para pastéis tradicionais e especiais. Design com janela frontal para visualização do produto.',
    specs: [
      { label: 'Gramatura', value: '300g/m²' },
      { label: 'Capacidade', value: '1-2 pastéis' },
      { label: 'Fechamento', value: 'Aba com encaixe' },
      { label: 'Impressão', value: '2 cores (vermelho + preto)' },
      { label: 'Resistência térmica', value: 'Até 80°C' },
      { label: 'Lote mínimo', value: '1.000 unidades' },
    ],
    brandElements: ['Logo Point do Pastel', 'Slogan', 'QR Code cardápio digital', 'Redes sociais'],
  },
  {
    id: '2',
    name: 'Embalagem Pastel Especial Premium',
    icon: '⭐',
    category: 'Pastéis',
    dimensions: '22cm x 14cm x 6cm',
    material: 'Cartão duplex com laminação fosca',
    color: 'Vermelho Escuro + Dourado',
    ecoFriendly: true,
    description: 'Embalagem premium para pastéis especiais. Acabamento sofisticado com detalhes em hot stamping dourado.',
    specs: [
      { label: 'Gramatura', value: '350g/m²' },
      { label: 'Capacidade', value: '1-2 pastéis grandes' },
      { label: 'Fechamento', value: 'Trava magnética' },
      { label: 'Impressão', value: '4 cores + hot stamping' },
      { label: 'Resistência térmica', value: 'Até 90°C' },
      { label: 'Lote mínimo', value: '500 unidades' },
    ],
    brandElements: ['Logo premium', 'Selo de qualidade', 'Informações nutricionais', 'Selo sustentável'],
  },
  {
    id: '3',
    name: 'Caixa Batata Frita',
    icon: '🍟',
    category: 'Acompanhamentos',
    dimensions: '12cm x 8cm x 10cm',
    material: 'Papel cartão com barreira de gordura',
    color: 'Amarelo Point do Pastel + Vermelho',
    ecoFriendly: true,
    description: 'Caixa para porções de batata frita e acompanhamentos. Formato cônico para fácil manuseio.',
    specs: [
      { label: 'Gramatura', value: '280g/m²' },
      { label: 'Capacidade', value: '200g - 350g' },
      { label: 'Fechamento', value: 'Aberto (cone)' },
      { label: 'Impressão', value: '3 cores' },
      { label: 'Resistência térmica', value: 'Até 85°C' },
      { label: 'Lote mínimo', value: '2.000 unidades' },
    ],
    brandElements: ['Logo estilizado', 'Ilustração de batatas', 'Hashtag #PointDoPastel'],
  },
  {
    id: '4',
    name: 'Sacola Delivery',
    icon: '🛍️',
    category: 'Delivery',
    dimensions: '32cm x 20cm x 28cm',
    material: 'Papel kraft reciclado 100%',
    color: 'Kraft natural + Vermelho',
    ecoFriendly: true,
    description: 'Sacola sustentável para pedidos delivery. Alças reforçadas e fundo estruturado para segurança no transporte.',
    specs: [
      { label: 'Gramatura', value: '120g/m²' },
      { label: 'Capacidade', value: 'Até 3kg' },
      { label: 'Fechamento', value: 'Adesivo de segurança' },
      { label: 'Impressão', value: '1 cor (vermelho)' },
      { label: 'Alças', value: 'Torcidas reforçadas' },
      { label: 'Lote mínimo', value: '1.500 unidades' },
    ],
    brandElements: ['Logo grande central', 'Telefone/WhatsApp', 'Instagram', 'Selo eco-friendly'],
  },
  {
    id: '5',
    name: 'Copo Bebidas 500ml',
    icon: '🥤',
    category: 'Bebidas',
    dimensions: 'Ø 9cm x 15cm',
    material: 'Papel biodegradável com revestimento PLA',
    color: 'Branco + Vermelho',
    ecoFriendly: true,
    description: 'Copo descartável para sucos e milkshakes. Tampa com abertura para canudo e vedação segura.',
    specs: [
      { label: 'Capacidade', value: '500ml' },
      { label: 'Tampa', value: 'PLA com abertura' },
      { label: 'Canudo', value: 'Papel biodegradável' },
      { label: 'Impressão', value: '2 cores' },
      { label: 'Certificação', value: 'FSC / Compostável' },
      { label: 'Lote mínimo', value: '3.000 unidades' },
    ],
    brandElements: ['Logo circular', 'Padrão visual lateral', 'Selo compostável'],
  },
  {
    id: '6',
    name: 'Guardanapo Personalizado',
    icon: '🧻',
    category: 'Acessórios',
    dimensions: '33cm x 33cm (aberto)',
    material: 'Papel folha simples, celulose virgem',
    color: 'Branco + Vermelho',
    ecoFriendly: false,
    description: 'Guardanapo de mesa personalizado com logo e dados de contato. Dobra 1/4.',
    specs: [
      { label: 'Gramatura', value: '30g/m²' },
      { label: 'Dobra', value: '1/4 (8.5cm x 8.5cm)' },
      { label: 'Impressão', value: '1 cor (vermelho)' },
      { label: 'Lote mínimo', value: '10.000 unidades' },
    ],
    brandElements: ['Logo centralizado', 'Telefone', 'Instagram'],
  },
];

const CATEGORIES = ['Todos', 'Pastéis', 'Acompanhamentos', 'Delivery', 'Bebidas', 'Acessórios'];

const Embalagens = () => {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const filtered = activeFilter === 'Todos'
    ? PACKAGING_DATA
    : PACKAGING_DATA.filter(p => p.category === activeFilter);

  return (
    <div className="min-h-full bg-background p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">Design de Embalagens</h2>
            <p className="text-sm text-muted-foreground">Catálogo de embalagens e materiais da marca</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <Box className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-extrabold text-foreground">{PACKAGING_DATA.length}</p>
            <p className="text-xs text-muted-foreground font-semibold">Tipos de Embalagem</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <Palette className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-extrabold text-foreground">3</p>
            <p className="text-xs text-muted-foreground font-semibold">Cores da Marca</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <Leaf className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-extrabold text-foreground">{PACKAGING_DATA.filter(p => p.ecoFriendly).length}</p>
            <p className="text-xs text-muted-foreground font-semibold">Eco-Friendly</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <ShieldCheck className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-extrabold text-foreground">100%</p>
            <p className="text-xs text-muted-foreground font-semibold">Padrão ANVISA</p>
          </div>
        </div>

        {/* Brand Colors Reference */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-6">
          <h3 className="text-sm font-bold text-foreground mb-3">🎨 Paleta de Cores da Marca</h3>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: '#C40000' }} />
              <div>
                <p className="text-xs font-bold text-foreground">Vermelho Point</p>
                <p className="text-[10px] text-muted-foreground">#C40000</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: '#8B0000' }} />
              <div>
                <p className="text-xs font-bold text-foreground">Vermelho Escuro</p>
                <p className="text-[10px] text-muted-foreground">#8B0000</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg border border-border" style={{ backgroundColor: '#FFFFFF' }} />
              <div>
                <p className="text-xs font-bold text-foreground">Branco</p>
                <p className="text-[10px] text-muted-foreground">#FFFFFF</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: '#FFD700' }} />
              <div>
                <p className="text-xs font-bold text-foreground">Dourado Destaque</p>
                <p className="text-[10px] text-muted-foreground">#FFD700</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all",
                activeFilter === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Packaging Cards */}
        <div className="space-y-4">
          {filtered.map(item => {
            const isExpanded = expandedItem === item.id;
            return (
              <div
                key={item.id}
                className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                  className="w-full text-left p-5 flex items-center gap-4"
                >
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-3xl">{item.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-foreground">{item.name}</p>
                      {item.ecoFriendly && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-green-100 text-green-700">♻️ Eco</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                    <div className="flex items-center gap-4 mt-1.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Ruler className="h-3 w-3" /> {item.dimensions}
                      </span>
                      <span className="text-xs font-semibold text-primary">{item.category}</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" /> : <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
                    {/* Visual Mockup Area */}
                    <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center">
                      <span className="text-6xl block mb-3">{item.icon}</span>
                      <p className="text-sm font-bold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">Cor: {item.color}</p>
                      <p className="text-xs text-muted-foreground">Material: {item.material}</p>
                    </div>

                    {/* Specs Grid */}
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-2">📐 Especificações Técnicas</h4>
                      <div className="bg-secondary/50 rounded-xl overflow-hidden">
                        {item.specs.map((spec, idx) => (
                          <div
                            key={spec.label}
                            className={cn(
                              "flex justify-between px-4 py-2.5 text-sm",
                              idx % 2 === 0 ? 'bg-transparent' : 'bg-background/50'
                            )}
                          >
                            <span className="text-muted-foreground">{spec.label}</span>
                            <span className="font-bold text-foreground">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Brand Elements */}
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-2">🏷️ Elementos da Marca</h4>
                      <div className="flex flex-wrap gap-2">
                        {item.brandElements.map(el => (
                          <span
                            key={el}
                            className="px-3 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20"
                          >
                            {el}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Package className="h-12 w-12 opacity-30 mx-auto mb-3" />
            <p className="font-bold">Nenhuma embalagem encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Embalagens;
