import { motion } from 'framer-motion';
import { useMemo, type CSSProperties } from 'react';

const HEARTS = ['❤️', '💖', '💕', '💗', '💓', '💞', '💘', '💝', '🤍', '💛', '🧡', '❣️', '💌'];

/** Stable pseudo-random so the drift looks the same every viewing */
const rand = (i: number, n: number) => {
  const x = Math.sin(i * 63.7 + n * 17.9) * 10241.3;
  return x - Math.floor(x);
};

/**
 * Heart emojis of every kind drifting slowly up behind the letter and the photos.
 * Pure CSS transforms, so they never cost the page its smoothness
 */
export function FloatingHearts({ count = 34 }: { count?: number }) {
  const hearts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        emoji: HEARTS[Math.floor(rand(i, 1) * HEARTS.length)],
        left: rand(i, 2) * 100,
        size: 14 + rand(i, 3) * 30,
        duration: 11 + rand(i, 4) * 12,
        delay: -rand(i, 5) * 22,
        sway: 18 + rand(i, 6) * 40,
        opacity: 0.35 + rand(i, 7) * 0.45,
        blur: rand(i, 8) > 0.75 ? 1.5 : 0,
      })),
    [count],
  );

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 2 } }}
      transition={{ duration: 2 }}
    >
      {hearts.map((h, i) => (
        <span
          key={i}
          className="animate-heart-rise absolute bottom-[-60px]"
          style={
            {
              left: `${h.left}%`,
              fontSize: h.size,
              animationDuration: `${h.duration}s`,
              animationDelay: `${h.delay}s`,
              '--sway': `${h.sway}px`,
              '--heart-opacity': h.opacity,
              filter: h.blur ? `blur(${h.blur}px)` : undefined,
            } as CSSProperties
          }
        >
          {h.emoji}
        </span>
      ))}
    </motion.div>
  );
}
