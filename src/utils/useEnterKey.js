import { useEffect } from 'react';

// Lets desktop users press Enter to trigger whatever "Next"-style action is
// currently active, instead of having to click — mirrors native <button>
// Enter-activation but works regardless of what currently has focus.
export function useEnterKey(enabled, handler) {
  useEffect(() => {
    if (!enabled) return;
    function onKey(e) {
      if (e.key === 'Enter') handler();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, handler]);
}
