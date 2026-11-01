import { cubicBezier } from 'framer-motion';

/** Named easing curves, each one carries an emotional intent */
export const EASE = {
  linear: (t: number) => t,
  /** Default, soft in and out */
  gentle: cubicBezier(0.45, 0, 0.25, 1),
  /** Long, unhurried acceleration, used for his waiting reach */
  patient: cubicBezier(0.65, 0, 0.2, 1),
  /** Symmetric, like an inhale */
  breath: cubicBezier(0.37, 0, 0.63, 1),
  /** Starts boldly, stops early, used for her hesitation */
  hesitant: cubicBezier(0.3, 0.1, 0.1, 1),
  /** Lands softly, for the final approach */
  settle: cubicBezier(0.22, 0.61, 0.25, 1),
} as const;

export type EaseName = keyof typeof EASE;
