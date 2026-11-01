import { EASE, type EaseName } from './easing';

/** Time-based keyframes, `t` in seconds from scene start */
export interface Keys {
  t: number[];
  v: number[];
  /** One ease for all segments, or one per segment */
  ease?: EaseName | EaseName[];
}

/** A property is either a constant or a keyframe track */
export type Prop = number | Keys;

export const keys = (t: number[], v: number[], ease?: Keys['ease']): Keys => ({ t, v, ease });

export const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Evaluate a property at a given scene time */
export function sample(prop: Prop, time: number): number {
  if (typeof prop === 'number') return prop;
  const { t, v } = prop;
  const last = t.length - 1;
  if (time <= t[0]) return v[0];
  if (time >= t[last]) return v[last];
  let i = 0;
  while (i < last - 1 && time > t[i + 1]) i++;
  const span = t[i + 1] - t[i];
  const raw = span > 0 ? (time - t[i]) / span : 1;
  const name: EaseName = Array.isArray(prop.ease) ? prop.ease[i] ?? 'gentle' : prop.ease ?? 'gentle';
  return v[i] + (v[i + 1] - v[i]) * EASE[name](raw);
}
