import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { ReactNode } from 'react';
import { sample } from '../../film/keyframes';
import type { CameraMove } from '../../film/types';

interface Props {
  move?: CameraMove;
  time: MotionValue<number>;
  reduced: boolean;
  children: ReactNode;
}

/** Virtual camera, push-ins, dollies, handheld sway and breathing, all transform-only */
export function Camera({ move = {}, time, reduced, children }: Props) {
  const scale = useTransform(time, (t) => {
    if (reduced) return 1;
    const base = sample(move.scale ?? 1, t);
    const b = move.breathe;
    if (!b) return base;
    const phase = (1 - Math.cos((t / b.period) * Math.PI * 2)) / 2;
    return base * (b.from + (b.to - b.from) * phase);
  });
  const x = useTransform(time, (t) => {
    if (reduced) return '0vw';
    const sway = move.sway ? Math.sin(t * move.sway.speed * Math.PI * 2) * move.sway.amp : 0;
    return `${sample(move.x ?? 0, t) + sway}vw`;
  });
  const y = useTransform(time, (t) => {
    if (reduced) return '0vh';
    const sway = move.sway ? Math.sin(t * move.sway.speed * Math.PI * 2 * 1.37 + 1.1) * move.sway.amp * 0.7 : 0;
    return `${sample(move.y ?? 0, t) + sway}vh`;
  });
  const rotate = useTransform(time, (t) =>
    reduced || !move.sway ? 0 : Math.sin(t * move.sway.speed * Math.PI * 2 * 0.7 + 0.4) * move.sway.amp * 0.25,
  );
  const [ox, oy] = move.origin ?? [50, 50];

  return (
    <motion.div className="absolute inset-0 will-change-transform" style={{ scale, x, y, rotate, originX: ox / 100, originY: oy / 100 }}>
      {children}
    </motion.div>
  );
}
