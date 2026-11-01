import { useEffect, useState } from 'react';
import type { Orientation } from '../film/types';

/** Tall phone screens get the vertical reframe, everything else keeps the wide letterbox */
const QUERY = '(max-aspect-ratio: 4/5)';

export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>(() =>
    typeof window !== 'undefined' && window.matchMedia(QUERY).matches ? 'portrait' : 'landscape',
  );
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const update = () => setOrientation(mq.matches ? 'portrait' : 'landscape');
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return orientation;
}
