import { useMotionValueEvent, useTransform, type MotionValue } from 'framer-motion';
import { useState } from 'react';
import { sample, type Prop } from '../film/keyframes';

/** A keyframed property as a MotionValue, evaluated every frame without re-rendering */
export function useProp(time: MotionValue<number>, prop: Prop | undefined, fallback = 0) {
  return useTransform(time, (t) => sample(prop ?? fallback, t));
}

/** Flips to true once scene time passes `at` (and stays true) */
export function useTimeReached(time: MotionValue<number>, at: number | undefined) {
  const [reached, setReached] = useState(() => at !== undefined && time.get() >= at);
  useMotionValueEvent(time, 'change', (t) => {
    if (!reached && at !== undefined && t >= at) setReached(true);
  });
  return reached;
}
