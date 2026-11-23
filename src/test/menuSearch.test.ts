import { describe, it, expect } from 'vitest';
import type { MenuItem } from '@/data/menu';
import { normalizeText, matchesSearch, filterProducts, matchingCategories } from '@/lib/menuSearch';

const item = (over: Partial<MenuItem>): MenuItem =>
  ({ id: '1', name: 'Pastel de Carne', price: 12, category: 'monte', ...over }) as MenuItem;

const items: MenuItem[] = [
  item({ name: 'Pastel de Carne', description: 'Recheio de carne moída' }),
  item({ id: '2', name: 'Açaí 300ml', description: 'Com granola' }),
  item({ id: '3', name: 'Suco de Laranja', description: 'Natural' }),
  item({ id: '4', name: 'Batata Frita', category: 'batatas', description: 'Com catupiry' }),
];

describe('busca do cardápio', () => {
  it('acha produto pelo nome, sem ligar para maiúsculas', () => {
    expect(filterProducts(items, 'PASTEL DE CARNE').map(i => i.name)).toEqual(['Pastel de Carne']);
  });

  it('acha produto mesmo se o cliente digitar sem acento', () => {
    expect(filterProducts(items, 'acai').map(i => i.name)).toEqual(['Açaí 300ml']);
  });

  it('acha produto pelo que está escrito na descrição', () => {
    expect(filterProducts(items, 'catupiry').map(i => i.name)).toEqual(['Batata Frita']);
  });

  it('só mostra o produto quando todas as palavras do cliente aparecem', () => {
    expect(filterProducts(items, 'laranja natural').map(i => i.name)).toEqual(['Suco de Laranja']);
    expect(filterProducts(items, 'laranja catupiry')).toEqual([]);
  });

  it('termo vazio não esconde nada', () => {
    expect(filterProducts(items, '   ')).toHaveLength(4);
    expect(matchesSearch(items[0], '')).toBe(true);
  });

  it('devolve só as categorias que têm resultado', () => {
    expect([...matchingCategories(items, 'catupiry')]).toEqual(['batatas']);
    expect(matchingCategories(items, 'pizza').size).toBe(0);
  });

  it('normaliza acentos e espaços extras', () => {
    expect(normalizeText('  Queijo   Muçarela ')).toBe('queijo mucarela');
  });
});
