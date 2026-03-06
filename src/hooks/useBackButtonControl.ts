import { useEffect, useCallback, useRef } from 'react';

type BackAction = () => void;

/**
 * Pushes a history state and calls `onBack` when the user presses the
 * browser/mobile back button.  Cleans up automatically on unmount or
 * when the callback changes.
 */
export function useBackButtonControl(
  active: boolean,
  stateKey: string,
  onBack: BackAction,
) {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  const pushed = useRef(false);

  // Push state when becoming active
  useEffect(() => {
    if (!active) {
      pushed.current = false;
      return;
    }

    // Only push once per activation
    if (!pushed.current) {
      window.history.pushState({ key: stateKey }, '');
      pushed.current = true;
    }

    const handler = (e: PopStateEvent) => {
      if (pushed.current) {
        pushed.current = false;
        onBackRef.current();
      }
    };

    window.addEventListener('popstate', handler);
    return () => {
      window.removeEventListener('popstate', handler);
    };
  }, [active, stateKey]);
}
