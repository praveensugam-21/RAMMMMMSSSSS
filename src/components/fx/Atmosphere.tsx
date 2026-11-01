import { motion, type MotionValue } from 'framer-motion';
import { useMemo } from 'react';

/** Slow drifting haze, gradients only (no filters), animated by CSS transform */
export function Haze({ color }: { color: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-60">
      <div
        className="animate-haze-a absolute -left-1/4 top-[10%] h-[80%] w-[90%]"
        style={{ background: `radial-gradient(closest-side, ${color}55, transparent)` }}
      />
      <div
        className="animate-haze-b absolute -right-1/4 top-[25%] h-[70%] w-[80%]"
        style={{ background: `radial-gradient(closest-side, ${color}40, transparent)` }}
      />
    </div>
  );
}

/** Warm light leaks, only ever visible after the touch (opacity follows warmth) */
export function LightLeaks({ warmth }: { warmth: MotionValue<number> }) {
  return (
    <motion.div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-screen" style={{ opacity: warmth }}>
      <div
        className="animate-leak-a absolute -left-[20%] -top-[30%] h-[90%] w-[60%] opacity-40"
        style={{ background: 'radial-gradient(closest-side, rgba(255,170,90,0.9), rgba(232,163,61,0.25) 55%, transparent)' }}
      />
      <div
        className="animate-leak-b absolute -bottom-[35%] -right-[15%] h-[80%] w-[55%] opacity-25"
        style={{ background: 'radial-gradient(closest-side, rgba(255,120,80,0.8), transparent)' }}
      />
    </motion.div>
  );
}

/** Procedural golden bokeh, soft discs drifting very slowly */
export function Bokeh({ warmth, count = 14 }: { warmth: MotionValue<number>; count?: number }) {
  const discs = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const r = (n: number) => {
          const x = Math.sin(i * 9301 + n * 49297) * 233280;
          return x - Math.floor(x);
        };
        return {
          left: r(1) * 100,
          top: 10 + r(2) * 80,
          size: 4 + r(3) * 11,
          alpha: 0.12 + r(4) * 0.28,
          delay: -r(5) * 20,
          duration: 16 + r(6) * 14,
        };
      }),
    [count],
  );
  return (
    <motion.div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-screen" style={{ opacity: warmth }}>
      {discs.map((d, i) => (
        <span
          key={i}
          className="animate-bokeh absolute rounded-full"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: `${d.size}vw`,
            height: `${d.size}vw`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
            background: `radial-gradient(closest-side, rgba(255,214,150,${d.alpha}), rgba(244,199,122,${d.alpha * 0.6}) 70%, rgba(244,199,122,${d.alpha * 0.9}) 88%, transparent)`,
          }}
        />
      ))}
    </motion.div>
  );
}
