import { useEffect, useState } from 'react';

/**
 * Regra do modo compacto do cardápio:
 * - liga depois de rolar ACTIVATE_AFTER px para dentro do cardápio;
 * - só desliga ao voltar abaixo de DEACTIVATE_BEFORE px (histerese, evita ficar piscando).
 */
export const ACTIVATE_AFTER = 180;
export const DEACTIVATE_BEFORE = 60;

export function computeMenuCompact(wasCompact: boolean, scrolledIntoMenu: number): boolean {
  if (wasCompact) return scrolledIntoMenu > DEACTIVATE_BEFORE;
  return scrolledIntoMenu > ACTIVATE_AFTER;
}

/** true quando o usuário já rolou o suficiente para os cards ficarem menores. */
export function useMenuCompact() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const handle = () => {
      const menu = document.getElementById('cardapio');
      const menuTop = menu ? menu.getBoundingClientRect().top + window.scrollY : window.scrollY;
      const scrolledIntoMenu = window.scrollY - menuTop;
      setCompact(prev => computeMenuCompact(prev, scrolledIntoMenu));
    };

    handle();
    window.addEventListener('scroll', handle, { passive: true });
    window.addEventListener('resize', handle);
    return () => {
      window.removeEventListener('scroll', handle);
      window.removeEventListener('resize', handle);
    };
  }, []);

  return compact;
}
