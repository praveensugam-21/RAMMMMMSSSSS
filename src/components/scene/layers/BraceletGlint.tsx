import { motion, useTransform, type MotionValue } from 'framer-motion';

interface Props {
  box: { x: number; y: number; w: number; h: number };
  time: MotionValue<number>;
  at: number;
  duration: number;
}

/** A single specular glint travelling along the gold bracelet */
export function BraceletGlint({ box, time, at, duration }: Props) {
  const end = at + duration;
  const y = useTransform(time, [at, end], ['-120%', '220%']);
  const opacity = useTransform(time, [at - 0.1, at + 0.2, end - 0.3, end], [0, 1, 1, 0]);
  const sparkle = useTransform(time, [at + duration * 0.35, at + duration * 0.5, at + duration * 0.7], [0, 1, 0]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute overflow-hidden rounded-[50%] mix-blend-screen"
      style={{
        left: `${(box.x - box.w / 2) * 100}%`,
        top: `${(box.y - box.h / 2) * 100}%`,
        width: `${box.w * 100}%`,
        height: `${box.h * 100}%`,
        opacity,
      }}
    >
      <motion.div
        className="absolute inset-x-[-40%] h-[38%]"
        style={{
          y,
          background: 'linear-gradient(180deg, transparent, rgba(255,236,190,0.95), transparent)',
        }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[14%] w-[260%] -translate-x-1/2 -translate-y-1/2"
        style={{
          opacity: sparkle,
          background: 'radial-gradient(closest-side, rgba(255,248,225,0.95), rgba(244,199,122,0.35) 45%, transparent)',
        }}
      />
    </motion.div>
  );
}
