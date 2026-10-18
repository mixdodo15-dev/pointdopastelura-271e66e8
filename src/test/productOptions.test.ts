import { describe, expect, it } from 'vitest';
import { buildOptionCartItem, optionsSelectionValid, validateOptionGroups, type OptionGroup } from '@/lib/productOptions';

const groups: OptionGroup[] = [
  { name: 'Molho', required: true, min: 1, max: 1, choices: [{ name: 'Vermelho', price: 0 }, { name: 'Rosé', price: 0 }] },
  { name: 'Queijo', required: false, min: 0, max: 2, choices: [{ name: 'Catupiry', price: 5 }, { name: 'Cheddar', price: 5 }] },
];
describe('opcionais do site', () => {
  it('exige exatamente um molho', () => {
    expect(optionsSelectionValid(groups, {})).toBe(false);
    expect(optionsSelectionValid(groups, { Molho: ['Vermelho', 'Rosé'] })).toBe(false);
    expect(optionsSelectionValid(groups, { Molho: ['Rosé'] })).toBe(true);
  });
  it('aceita zero a dois queijos e rejeita escolhas desconhecidas', () => {
    expect(optionsSelectionValid(groups, { Molho: ['Vermelho'], Queijo: ['Catupiry', 'Cheddar'] })).toBe(true);
    expect(optionsSelectionValid(groups, { Molho: ['Vermelho'], Queijo: ['Catupiry', 'Cheddar', 'Outro'] })).toBe(false);
  });
  it('opção grátis não altera o preço e paga soma somente seu valor', () => {
    const item = { id: 'macarrao', name: 'Macarrão', price: 20 };
    const sauce = { group: 'Molho', name: 'Rosé', price: 0 };
    expect(buildOptionCartItem(item, [sauce]).price).toBe(20);
    expect(buildOptionCartItem(item, [sauce, { group: 'Queijo', name: 'Catupiry', price: 5 }]).price).toBe(25);
  });
  it('não mistura combinações diferentes no carrinho', () => {
    const item = { id: 'macarrao', name: 'Macarrão', price: 20 };
    expect(buildOptionCartItem(item, [{ group: 'Molho', name: 'Rosé', price: 0 }]).id).not.toBe(buildOptionCartItem(item, [{ group: 'Molho', name: 'Vermelho', price: 0 }]).id);
  });
  it('rejeita grupos impossíveis, duplicados e preços negativos', () => {
    expect(validateOptionGroups(groups)).toBe(true);
    expect(validateOptionGroups([{ ...groups[0], max: 3 }])).toBe(false);
    expect(validateOptionGroups([groups[0], groups[0]])).toBe(false);
    expect(validateOptionGroups([{ ...groups[0], choices: [{ name: 'Rosé', price: -1 }] }])).toBe(false);
  });
});