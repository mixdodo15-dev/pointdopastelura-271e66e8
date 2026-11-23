import { describe, expect, it } from 'vitest';
import {
  ACTIVATE_AFTER,
  DEACTIVATE_BEFORE,
  computeMenuCompact,
} from '@/hooks/useMenuCompact';

describe('modo compacto do cardápio', () => {
  it('fica normal no topo do cardápio', () => {
    expect(computeMenuCompact(false, 0)).toBe(false);
    expect(computeMenuCompact(false, 100)).toBe(false);
  });

  it('encolhe depois de rolar 180px para dentro do cardápio', () => {
    expect(computeMenuCompact(false, ACTIVATE_AFTER + 1)).toBe(true);
    expect(computeMenuCompact(false, 900)).toBe(true);
  });

  it('continua encolhido ao rolar mais fundo', () => {
    expect(computeMenuCompact(true, 5000)).toBe(true);
  });

  it('só volta ao tamanho grande ao subir quase até o início', () => {
    expect(computeMenuCompact(true, DEACTIVATE_BEFORE + 1)).toBe(true);
    expect(computeMenuCompact(true, DEACTIVATE_BEFORE - 1)).toBe(false);
  });

  it('usa histerese: a faixa de desligar é menor que a de ligar', () => {
    expect(DEACTIVATE_BEFORE).toBeLessThan(ACTIVATE_AFTER);
    expect(computeMenuCompact(true, 120)).toBe(true);
    expect(computeMenuCompact(false, 120)).toBe(false);
  });
});
