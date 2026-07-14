import { useEffect } from 'react';

// Lets desktop users press 1-9 to pick the Nth visible choice button,
// instead of having to click — same idea as useEnterKey for "Next".
export function useChoiceKeys(enabled, count, onSelect) {
  useEffect(() => {
    if (!enabled) return;
    function onKey(e) {
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > count) return;
      onSelect(n - 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, count, onSelect]);
}
