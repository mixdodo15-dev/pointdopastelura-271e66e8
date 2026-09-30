import { describe, expect, it } from 'vitest';
import { getRequiredCheeseOptions } from '@/lib/cheeseSelection';

describe('getRequiredCheeseOptions', () => {
  it('requires a cheese type for special pastels that offer a cheese choice', () => {
    expect(getRequiredCheeseOptions({ name: 'Frango Apimentado', category: 'especiais' })).toEqual([
      'Catupiry',
      'Cheddar',
      'Queijo',
    ]);
    expect(getRequiredCheeseOptions({ name: 'Mexicano', category: 'especiais' })).toHaveLength(3);
    expect(getRequiredCheeseOptions({ name: 'Doritos', category: 'especiais' })).toHaveLength(3);
    expect(getRequiredCheeseOptions({ name: 'Costela Peperoni', category: 'especiais' })).toHaveLength(3);
  });

  it('requires a topping for the bacon-and-cheddar potato', () => {
    expect(getRequiredCheeseOptions({ name: 'Batata c/ Bacon e Cheddar', category: 'batatas' })).toEqual([
      'Cheddar',
      'Catupiry',
    ]);
  });

  it('does not require cheese for unrelated products', () => {
    expect(getRequiredCheeseOptions({ name: 'Pastel de Carne', category: 'especiais' })).toEqual([]);
    expect(getRequiredCheeseOptions({ name: 'Frango Apimentado', category: 'adicionais' })).toEqual([]);
  });
});
