import { useRef } from 'react';

const SWIPE_THRESHOLD = 50; // px

// Returns touch handlers to spread onto an element so a horizontal finger
// swipe triggers onSwipeLeft/onSwipeRight — e.g. swipe through characters
// or rows on mobile instead of only tapping Prev/Next.
export function useSwipe(onSwipeLeft, onSwipeRight) {
  const start = useRef(null);

  function onTouchStart(e) {
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e) {
    if (!start.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.current.x;
    const dy = t.clientY - start.current.y;
    start.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) onSwipeLeft?.();
    else onSwipeRight?.();
  }

  return { onTouchStart, onTouchEnd };
}
