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
