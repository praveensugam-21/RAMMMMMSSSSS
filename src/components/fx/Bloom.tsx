import { motion, useTransform, type MotionValue } from 'framer-motion';

/** One soft bloom pulse from the point of contact */
export function Bloom({ time, at }: { time: MotionValue<number>; at: number }) {
  const opacity = useTransform(time, [at - 0.05, at + 0.3, at + 2.2], [0, 0.85, 0]);
  const scale = useTransform(time, [at - 0.05, at + 2.2], [0.4, 1.6]);
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 h-[120vmax] w-[120vmax] rounded-full mix-blend-screen"
      style={{
        opacity,
        scale,
        x: '-50%',
        y: '-50%',
        background: 'radial-gradient(closest-side, rgba(255,244,224,0.95), rgba(244,199,122,0.45) 30%, rgba(232,163,61,0.12) 60%, transparent)',
      }}
    />
  );
}
