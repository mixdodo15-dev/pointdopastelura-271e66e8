import type { MenuItem } from '@/data/menu';

/** Remove acentos, caixa alta/baixa e espaços extras para comparar texto. */
export const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Um produto casa com a busca se o termo aparecer no nome ou na descrição. */
export const matchesSearch = (item: MenuItem, term: string): boolean => {
  const needle = normalizeText(term);
  if (!needle) return true;
  const haystack = normalizeText(`${item.name} ${item.description ?? ''}`);
  return needle.split(' ').every((word) => haystack.includes(word));
};

/** Filtra a lista inteira de produtos pelo termo digitado. */
export const filterProducts = (products: MenuItem[], term: string): MenuItem[] =>
  normalizeText(term) ? products.filter((item) => matchesSearch(item, term)) : products;

/** Categorias (slugs) que têm pelo menos um produto buscando. */
export const matchingCategories = (products: MenuItem[], term: string): Set<string> =>
  new Set(filterProducts(products, term).map((item) => item.category));
