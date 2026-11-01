import { useEffect, useState } from 'react';

/** True after the pointer has been still for `ms`, used to hide the controls like a video player */
export function useIdle(ms = 2600) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    let timer = window.setTimeout(() => setIdle(true), ms);
    const wake = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), ms);
    };
    const events = ['pointermove', 'pointerdown', 'keydown'] as const;
    events.forEach((ev) => window.addEventListener(ev, wake, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, wake));
    };
  }, [ms]);
  return idle;
}
