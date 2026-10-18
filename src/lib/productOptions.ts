export interface OptionChoice {
  name: string;
  price: number; // 0 = sem valor (grátis)
}

export interface OptionGroup {
  name: string;
  required: boolean;
  min: number;
  max: number;
  choices: OptionChoice[];
}

export interface SelectedOption { group: string; name: string; price: number }

export const validateOptionGroups = (groups: OptionGroup[]): boolean => {
  const names = groups.map(g => g.name.trim());
  return new Set(names).size === names.length && groups.every(g =>
    g.name.trim() && g.choices.length > 0 && Number.isInteger(g.min) && Number.isInteger(g.max) &&
    g.min >= 0 && g.max >= Math.max(1, g.min) && g.max <= g.choices.length &&
    (!g.required || g.min >= 1) &&
    new Set(g.choices.map(c => c.name.trim())).size === g.choices.length &&
    g.choices.every(c => c.name.trim() && Number.isFinite(c.price) && c.price >= 0)
  );
};

export const optionsSelectionValid = (groups: OptionGroup[], selections: Record<string, string[]>): boolean =>
  groups.every(g => {
    const selected = selections[g.name] || [];
    return selected.length >= Math.max(g.min, g.required ? 1 : 0) && selected.length <= g.max &&
      new Set(selected).size === selected.length && selected.every(name => g.choices.some(c => c.name === name));
  });

export const buildOptionCartItem = (item: { id: string; name: string; price: number }, selected: SelectedOption[]) => ({
  id: `${item.id}-options-${JSON.stringify(selected.map(s => [s.group, s.name]).sort())}`,
  name: selected.length ? `${item.name} (${selected.map(s => `${s.group}: ${s.name}`).join(' + ')})` : item.name,
  price: item.price + selected.reduce((sum, s) => sum + s.price, 0),
});

export const parseOptionsConfig = (raw: unknown): OptionGroup[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((g): g is Record<string, any> => !!g && typeof g === 'object')
    .map(g => ({
      name: String(g.name ?? ''),
      required: !!g.required,
      min: typeof g.min === 'number' ? g.min : (g.required ? 1 : 0),
      max: typeof g.max === 'number' ? g.max : 1,
      choices: Array.isArray(g.choices)
        ? g.choices.map((c: any) => ({ name: String(c?.name ?? ''), price: Number(c?.price) || 0 })).filter((c: OptionChoice) => c.name)
        : [],
    }))
    .filter(g => g.name && g.choices.length > 0);
};
