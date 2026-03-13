import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Search, ChevronDown, ChevronUp, Scale, Thermometer, Wheat, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  description: string | null;
}

// Mock technical data per category (in a real app, this would come from a DB table)
const TECHNICAL_DATA: Record<string, {
  ingredients: string;
  weight: string;
  storage: string;
  shelfLife: string;
  allergens: string[];
  nutrition: { label: string; value: string }[];
}> = {
  monte: {
    ingredients: 'Farinha de trigo enriquecida com ferro e ácido fólico, água, óleo vegetal, sal, recheio variado conforme sabor escolhido.',
    weight: '180g - 220g (varia conforme recheio)',
    storage: 'Manter refrigerado entre 2°C e 8°C. Após aberto, consumir em até 24 horas.',
    shelfLife: '3 dias refrigerado / 30 dias congelado',
    allergens: ['Glúten', 'Leite', 'Ovos'],
    nutrition: [
      { label: 'Valor energético', value: '320 kcal' },
      { label: 'Carboidratos', value: '38g' },
      { label: 'Proteínas', value: '12g' },
      { label: 'Gorduras totais', value: '14g' },
      { label: 'Gorduras saturadas', value: '5g' },
      { label: 'Fibra alimentar', value: '1.5g' },
      { label: 'Sódio', value: '480mg' },
    ],
  },
  especiais: {
    ingredients: 'Farinha de trigo enriquecida, água, óleo vegetal, sal, recheio premium com ingredientes selecionados.',
    weight: '250g - 300g',
    storage: 'Manter refrigerado entre 2°C e 8°C. Consumir preferencialmente no dia.',
    shelfLife: '2 dias refrigerado / 30 dias congelado',
    allergens: ['Glúten', 'Leite', 'Ovos', 'Soja'],
    nutrition: [
      { label: 'Valor energético', value: '420 kcal' },
      { label: 'Carboidratos', value: '42g' },
      { label: 'Proteínas', value: '18g' },
      { label: 'Gorduras totais', value: '20g' },
      { label: 'Gorduras saturadas', value: '8g' },
      { label: 'Fibra alimentar', value: '2g' },
      { label: 'Sódio', value: '620mg' },
    ],
  },
  doces: {
    ingredients: 'Farinha de trigo enriquecida, água, óleo vegetal, açúcar, recheio doce (chocolate, doce de leite ou frutas).',
    weight: '150g - 200g',
    storage: 'Manter refrigerado entre 2°C e 8°C. Evitar exposição ao calor.',
    shelfLife: '2 dias refrigerado / 15 dias congelado',
    allergens: ['Glúten', 'Leite', 'Ovos', 'Amendoim'],
    nutrition: [
      { label: 'Valor energético', value: '380 kcal' },
      { label: 'Carboidratos', value: '52g' },
      { label: 'Proteínas', value: '6g' },
      { label: 'Gorduras totais', value: '16g' },
      { label: 'Gorduras saturadas', value: '7g' },
      { label: 'Açúcares', value: '24g' },
      { label: 'Sódio', value: '280mg' },
    ],
  },
  batatas: {
    ingredients: 'Batata selecionada, óleo vegetal, sal. Temperos adicionais conforme o tipo.',
    weight: '200g - 350g',
    storage: 'Consumir imediatamente após o preparo para melhor experiência.',
    shelfLife: 'Consumo imediato',
    allergens: [],
    nutrition: [
      { label: 'Valor energético', value: '290 kcal' },
      { label: 'Carboidratos', value: '36g' },
      { label: 'Proteínas', value: '4g' },
      { label: 'Gorduras totais', value: '15g' },
      { label: 'Gorduras saturadas', value: '3g' },
      { label: 'Fibra alimentar', value: '3g' },
      { label: 'Sódio', value: '520mg' },
    ],
  },
  bebidas: {
    ingredients: 'Varia conforme o produto. Consulte o rótulo individual.',
    weight: '300ml - 600ml',
    storage: 'Manter refrigerado entre 2°C e 10°C.',
    shelfLife: 'Conforme fabricante',
    allergens: [],
    nutrition: [
      { label: 'Valor energético', value: '120-180 kcal' },
      { label: 'Carboidratos', value: '28-42g' },
      { label: 'Açúcares', value: '26-40g' },
      { label: 'Sódio', value: '30-60mg' },
    ],
  },
};

const DEFAULT_DATA = TECHNICAL_DATA.monte;

const CATEGORY_LABELS: Record<string, string> = {
  monte: '🥟 Monte Seu Pastel',
  especiais: '⭐ Pastel Especial',
  doces: '🍫 Pastel Doce',
  batatas: '🍟 Batatas',
  bebidas: '🥤 Bebidas',
};

const FichaTecnica = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, price, category, image_url, description')
        .eq('active', true)
        .order('sort_order');
      if (data) setProducts(data);
    };
    load();
  }, []);

  const filtered = products.filter(p => {
    const matchCat = !activeFilter || p.category === activeFilter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const groupedByCategory = filtered.reduce<Record<string, Product[]>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-full bg-background p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">Ficha Técnica</h2>
            <p className="text-sm text-muted-foreground">Informações nutricionais, ingredientes e armazenamento</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 rounded-xl h-11"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveFilter('')}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all",
                !activeFilter
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              )}
            >
              Todos
            </button>
            {Object.keys(CATEGORY_LABELS).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(activeFilter === cat ? '' : cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all",
                  activeFilter === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50"
                )}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Products List */}
        {Object.entries(groupedByCategory).map(([category, prods]) => (
          <div key={category} className="mb-8">
            <h3 className="text-lg font-extrabold text-foreground mb-3">
              {CATEGORY_LABELS[category] || category}
            </h3>
            <div className="space-y-3">
              {prods.map(product => {
                const tech = TECHNICAL_DATA[product.category] || DEFAULT_DATA;
                const isExpanded = expandedProduct === product.id;

                return (
                  <div
                    key={product.id}
                    className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                      className="w-full text-left p-4 flex items-center gap-4"
                    >
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="h-14 w-14 rounded-xl object-cover" />
                      ) : (
                        <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-2xl">🥟</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground">{product.name}</p>
                        {product.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-semibold text-primary">R$ {product.price.toFixed(2).replace('.', ',')}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Scale className="h-3 w-3" /> {tech.weight}
                          </span>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" /> : <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />}
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                        {/* Ingredients */}
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <Wheat className="h-4 w-4 text-amber-600" />
                            <h4 className="text-sm font-bold text-foreground">Ingredientes</h4>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{tech.ingredients}</p>
                        </div>

                        {/* Storage & Shelf Life */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-secondary/50 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Thermometer className="h-4 w-4 text-blue-500" />
                              <h4 className="text-xs font-bold text-foreground">Armazenamento</h4>
                            </div>
                            <p className="text-xs text-muted-foreground">{tech.storage}</p>
                          </div>
                          <div className="bg-secondary/50 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Scale className="h-4 w-4 text-green-500" />
                              <h4 className="text-xs font-bold text-foreground">Validade</h4>
                            </div>
                            <p className="text-xs text-muted-foreground">{tech.shelfLife}</p>
                          </div>
                        </div>

                        {/* Allergens */}
                        {tech.allergens.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                              <h4 className="text-sm font-bold text-foreground">Alérgenos</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {tech.allergens.map(a => (
                                <span
                                  key={a}
                                  className="px-3 py-1 rounded-full text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20"
                                >
                                  {a}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Nutrition Table */}
                        <div>
                          <h4 className="text-sm font-bold text-foreground mb-2">Informação Nutricional <span className="text-xs font-normal text-muted-foreground">(porção)</span></h4>
                          <div className="bg-secondary/50 rounded-xl overflow-hidden">
                            {tech.nutrition.map((item, idx) => (
                              <div
                                key={item.label}
                                className={cn(
                                  "flex justify-between px-4 py-2 text-sm",
                                  idx % 2 === 0 ? 'bg-transparent' : 'bg-background/50'
                                )}
                              >
                                <span className="text-muted-foreground">{item.label}</span>
                                <span className="font-bold text-foreground">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <FileText className="h-12 w-12 opacity-30 mx-auto mb-3" />
            <p className="font-bold">Nenhum produto encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FichaTecnica;
