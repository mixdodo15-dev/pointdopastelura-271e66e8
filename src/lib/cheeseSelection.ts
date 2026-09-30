type CheeseProduct = { name: string; category: string };

const SPECIAL_CHEESE_PRODUCTS = ['Frango Apimentado', 'Mexicano', 'Doritos', 'Costela Peperoni'];
const POTATO_CHEESE_PRODUCTS = ['Batata c/ Bacon e Cheddar'];

export const getRequiredCheeseOptions = ({ name, category }: CheeseProduct): string[] => {
  const normalizedName = name.toLocaleLowerCase('pt-BR');

  if (
    category === 'especiais' &&
    SPECIAL_CHEESE_PRODUCTS.some((productName) => normalizedName.includes(productName.toLocaleLowerCase('pt-BR')))
  ) {
    return ['Catupiry', 'Cheddar', 'Queijo'];
  }

  if (
    category === 'batatas' &&
    POTATO_CHEESE_PRODUCTS.some((productName) => normalizedName.includes(productName.toLocaleLowerCase('pt-BR')))
  ) {
    return ['Cheddar', 'Catupiry'];
  }

  return [];
};
