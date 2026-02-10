export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  subcategory?: string;
  maxFlavors?: number;
}

export interface FlavorOption {
  name: string;
  type: 'salgado' | 'doce';
}

export const FLAVORS: FlavorOption[] = [
  { name: 'Carne', type: 'salgado' },
  { name: 'Frango', type: 'salgado' },
  { name: 'Pizza', type: 'salgado' },
  { name: 'Bacon', type: 'salgado' },
  { name: 'Queijo', type: 'salgado' },
  { name: 'Calabresa', type: 'salgado' },
  { name: 'Mussarela', type: 'salgado' },
  { name: 'Catupiry', type: 'salgado' },
  { name: 'Cheddar', type: 'salgado' },
  { name: 'Azeitona', type: 'salgado' },
  { name: 'Palmito', type: 'salgado' },
  { name: 'Milho', type: 'salgado' },
  { name: 'Jiló', type: 'salgado' },
  { name: 'Brócolis', type: 'salgado' },
  { name: 'Goiabada', type: 'doce' },
  { name: 'Coco ralado', type: 'doce' },
  { name: 'Banana com canela', type: 'doce' },
  { name: 'Doce de leite', type: 'doce' },
];

export const MENU_ITEMS: MenuItem[] = [
  // Monte Seu Pastel
  { id: 'monte-1', name: 'Pastel 1 sabor', price: 12, category: 'monte', maxFlavors: 1 },
  { id: 'monte-2', name: 'Pastel 2 sabores', price: 16, category: 'monte', maxFlavors: 2 },
  { id: 'monte-3', name: 'Pastel 3 sabores', price: 20, category: 'monte', maxFlavors: 3 },
  { id: 'monte-4', name: 'Pastel 4 sabores', price: 24, category: 'monte', maxFlavors: 4 },
  { id: 'monte-5', name: 'Pastel 5 sabores', price: 28, category: 'monte', maxFlavors: 5 },

  // Pastéis Especiais
  { id: 'esp-1', name: 'Pastel Costela', price: 22, category: 'especiais', description: 'Costela desfiada com molho barbecue, sabor intenso e marcante.' },
  { id: 'esp-2', name: 'Frango Apimentado', price: 17, category: 'especiais', description: 'Frango com pimenta calabresa e queijo, catupiry ou cheddar.' },
  { id: 'esp-3', name: 'Mexicano', price: 20, category: 'especiais', description: 'Carne, Doritos, pimenta calabresa e queijo, catupiry ou cheddar.' },
  { id: 'esp-4', name: 'Doritos', price: 14, category: 'especiais', description: 'Doritos com queijo, catupiry ou cheddar.' },
  { id: 'esp-5', name: 'Costela Peperoni', price: 25, category: 'especiais', description: 'Costela, barbecue, peperoni e queijo, catupiry ou cheddar.' },
  { id: 'esp-6', name: 'Peperoni', price: 20, category: 'especiais', description: 'Peperoni com queijo derretido.' },
  { id: 'esp-7', name: 'Pastel de Vento', price: 8, category: 'especiais', description: 'Massa artesanal frita, sem recheio.' },

  // Pastéis Doces
  { id: 'doce-1', name: 'Chocolate ao leite', price: 12, category: 'doces', description: 'Pastel recheado com chocolate ao leite derretido.' },
  { id: 'doce-2', name: 'Nutella com Ninho', price: 15, category: 'doces', description: 'Nutella cremosa com leite Ninho.' },
  { id: 'doce-3', name: 'Nutella com Morango', price: 20, category: 'doces', description: 'Nutella cremosa com morangos frescos.' },
  { id: 'doce-4', name: 'Nutella com Banana', price: 20, category: 'doces', description: 'Nutella cremosa com banana.' },
  { id: 'doce-5', name: 'Ninho com Morango', price: 20, category: 'doces', description: 'Creme de leite Ninho com morangos frescos.' },
  { id: 'doce-6', name: 'Ninho com Banana', price: 20, category: 'doces', description: 'Creme de leite Ninho com banana.' },
  { id: 'doce-7', name: 'Especial', price: 20, category: 'doces', description: 'Escolha seu chocolate favorito: Laka, Oreo, Sonho de Valsa, Ouro Branco, Diamante Negro, Suflair, Galak, Kit Kat, Prestígio, Chocolate ao leite.', maxFlavors: 1 },

  // Bebidas
  { id: 'beb-1', name: 'Água', price: 3, category: 'bebidas', description: 'Com gás / Sem gás', subcategory: 'Água' },
  { id: 'beb-2', name: 'Suco Del Valle lata', price: 6, category: 'bebidas', subcategory: 'Sucos' },
  { id: 'beb-3', name: 'Suco Life 900ml', price: 20, category: 'bebidas', subcategory: 'Sucos' },
  { id: 'beb-4', name: 'Coca-Cola lata', price: 5, category: 'bebidas', subcategory: 'Refrigerante Lata' },
  { id: 'beb-5', name: 'Fanta lata', price: 5, category: 'bebidas', subcategory: 'Refrigerante Lata' },
  { id: 'beb-6', name: 'Guaraná Antarctica lata', price: 5, category: 'bebidas', subcategory: 'Refrigerante Lata' },
  { id: 'beb-7', name: 'Sprite lata', price: 5, category: 'bebidas', subcategory: 'Refrigerante Lata' },
  { id: 'beb-8', name: 'Coca-Cola 1L', price: 9, category: 'bebidas', subcategory: 'Refrigerante 1L' },
  { id: 'beb-9', name: 'Fanta 1L', price: 9, category: 'bebidas', subcategory: 'Refrigerante 1L' },
  { id: 'beb-10', name: 'Sprite 1L', price: 9, category: 'bebidas', subcategory: 'Refrigerante 1L' },
  { id: 'beb-11', name: 'Guaraná Antarctica 1L', price: 9, category: 'bebidas', subcategory: 'Refrigerante 1L' },
  { id: 'beb-12', name: 'Kuat 1L', price: 9, category: 'bebidas', subcategory: 'Refrigerante 1L' },

  // Adicionais
  { id: 'add-1', name: 'Catupiry', price: 4.99, category: 'adicionais' },
  { id: 'add-2', name: 'Cheddar', price: 4.99, category: 'adicionais' },
  { id: 'add-3', name: 'Doritos', price: 3.99, category: 'adicionais' },
  { id: 'add-4', name: 'Bacon', price: 4.99, category: 'adicionais' },
  { id: 'add-5', name: 'Mussarela', price: 3.99, category: 'adicionais' },
  { id: 'add-6', name: 'Calabresa', price: 3.99, category: 'adicionais' },
  { id: 'add-7', name: 'Costela', price: 7.00, category: 'adicionais' },
  { id: 'add-8', name: 'Azeitona', price: 2.99, category: 'adicionais' },
  { id: 'add-9', name: 'Peperoni', price: 3.99, category: 'adicionais' },
  { id: 'add-10', name: 'Frango', price: 3.99, category: 'adicionais' },
  { id: 'add-11', name: 'Queijo', price: 3.99, category: 'adicionais' },
  { id: 'add-12', name: 'Palmito', price: 2.99, category: 'adicionais' },
];

export const SWEET_SPECIAL_FLAVORS = [
  'Laka', 'Oreo', 'Sonho de Valsa', 'Ouro Branco',
  'Diamante Negro', 'Suflair', 'Galak', 'Kit Kat', 'Prestígio', 'Chocolate ao leite',
];

export const CATEGORIES = [
  { id: 'monte', label: 'Monte Seu Pastel', icon: '🥟' },
  { id: 'especiais', label: 'Pastel Especial', icon: '⭐' },
  { id: 'doces', label: 'Pastel Doce', icon: '🍫' },
  { id: 'bebidas', label: 'Bebidas', icon: '🥤' },
];
