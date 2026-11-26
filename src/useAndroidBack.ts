import { useEffect, useRef } from 'react';

// Keeps the browser history in step with the app screens so the Android Back
// button goes back one screen at a time and never needs "empty" presses.
// screenDepth: how many Back presses the current screen is from the main one;
// the history always holds exactly that many app entries above the main one.
// onBack is called when the user goes back (system Back or the in-app arrow).
// Returns the handler for the in-app back arrow.
export function useAndroidBack(screenKey: string, screenDepth: number, onBack: () => void) {
  const historyDepth = useRef(0);
  const ignoreNextPop = useRef(false);
  const onBackRef = useRef(onBack);
  useEffect(() => { onBackRef.current = onBack; });

  const handleInAppBack = () => {
    if (historyDepth.current > 0) {
      window.history.back();
    } else {
      onBack();
    }
  };

  useEffect(() => {
    window.history.replaceState({ foodDiaryApp: true, depth: 0 }, '');
    historyDepth.current = 0;

    const handlePopState = (event: PopStateEvent) => {
      const depth = typeof event.state?.depth === 'number' ? event.state.depth : 0;
      historyDepth.current = depth;
      if (ignoreNextPop.current) {
        ignoreNextPop.current = false;
        return;
      }
      onBackRef.current();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const current = historyDepth.current;
    if (screenDepth > current) {
      for (let depth = current + 1; depth <= screenDepth; depth += 1) {
        window.history.pushState({ foodDiaryApp: true, depth }, '');
      }
      historyDepth.current = screenDepth;
    } else if (screenDepth < current) {
      // The app went back by itself (saved, deleted, closed the menu):
      // drop the extra history entries without triggering another Back.
      ignoreNextPop.current = true;
      historyDepth.current = screenDepth;
      window.history.go(screenDepth - current);
    }
  }, [screenKey, screenDepth]);

  return handleInAppBack;
}
