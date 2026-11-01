import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface Props {
  greeting: string;
  name: string;
  /** Smaller once the letter is open */
  compact: boolean;
  reduced: boolean;
}

const START = 1.4;

/**
 * The birthday title. Letters bounce in one by one and keep floating in a soft wave,
 * the name is written in shimmering gold, the heart beats
 */
export function Headline({ greeting, name, compact, reduced }: Props) {
  const nameStart = START + greeting.length * 0.04 + 0.3;

  return (
    <h1 className="relative text-center leading-[1.05]" aria-label={`${greeting} ${name}`}>
      <span
        aria-hidden
        className={`block font-serif font-medium tracking-[0.005em] text-[#3A2310] transition-[font-size] duration-1000 ${
          compact ? 'text-[clamp(1.3rem,3.2vw,2.3rem)]' : 'text-[clamp(1.9rem,5.6vw,4.4rem)]'
        }`}
      >
        {words(greeting).map(({ word, offset }, w) => (
          <span key={w} className="inline-block whitespace-nowrap">
            {[...word].map((ch, i) => (
              <Letter key={i} ch={ch} delay={START + (offset + i) * 0.04} wave={(offset + i) * 0.09} reduced={reduced} />
            ))}
            {w < words(greeting).length - 1 && <span className="inline-block w-[0.28em]" />}
          </span>
        ))}
      </span>

      <span
        aria-hidden
        className={`mt-1 inline-flex items-baseline gap-[0.18em] font-hand font-semibold transition-[font-size] duration-1000 ${
          compact ? 'text-[clamp(1.9rem,4.4vw,3.2rem)]' : 'text-[clamp(3.2rem,9vw,6.6rem)]'
        }`}
      >
        <span className="whitespace-nowrap pb-[0.08em] [filter:drop-shadow(0_2px_10px_rgba(232,163,61,0.35))]">
          {[...name].map((ch, i) => (
            <Letter key={i} ch={ch} delay={nameStart + i * 0.06} wave={i * 0.11 + 0.5} reduced={reduced} pop gold={i} />
          ))}
        </span>
        <motion.span
          className="inline-block font-sans text-[0.55em]"
          initial={{ opacity: 0, scale: 0 }}
          animate={reduced ? { opacity: 1, scale: 1 } : { opacity: 1, scale: [0, 1.3, 1, 1.15, 1] }}
          transition={{ delay: nameStart + name.length * 0.06 + 0.2, duration: 1.2 }}
        >
          <motion.span
            className="inline-block"
            animate={reduced ? undefined : { scale: [1, 1.14, 1, 1.1, 1] }}
            transition={{ delay: nameStart + 2, duration: 1.4, repeat: Infinity, repeatDelay: 0.6 }}
          >
            ❤️
          </motion.span>
        </motion.span>
      </span>

      {!compact && !reduced && <FloatingHearts />}
    </h1>
  );
}

const GOLD =
  'animate-shimmer bg-[linear-gradient(100deg,#9A5A12_0%,#D98E2B_30%,#F7D58B_45%,#FFF1C9_50%,#F7D58B_55%,#D98E2B_70%,#9A5A12_100%)] bg-[length:400%_100%] bg-clip-text text-transparent';

const words = (text: string) => {
  let offset = 0;
  return text.split(' ').map((word) => {
    const w = { word, offset };
    offset += word.length + 1;
    return w;
  });
};

interface LetterProps {
  ch: string;
  delay: number;
  wave: number;
  reduced: boolean;
  pop?: boolean;
  /** Index for a gold shimmer that ripples across the letters */
  gold?: number;
}

function Letter({ ch, delay, wave, reduced, pop, gold }: LetterProps) {
  if (ch === ' ') return <span className="inline-block w-[0.28em]" />;
  return (
    <motion.span
      className="inline-block"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: pop ? 0 : 28, scale: pop ? 0.2 : 1, rotate: pop ? -12 : 0 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: pop ? 11 : 16 }}
    >
      <motion.span
        className={`inline-block ${gold !== undefined ? `${GOLD} -mx-[0.18em] px-[0.18em] -my-[0.12em] py-[0.12em]` : ''}`}
        style={gold !== undefined ? { animationDelay: `${gold * 0.12}s` } : undefined}
        animate={reduced ? undefined : { y: [0, -5, 0] }}
        transition={{ delay: delay + 1 + wave, duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {ch}
      </motion.span>
    </motion.span>
  );
}

/** A few soft hearts and sparkles drifting up behind the title */
function FloatingHearts() {
  const items = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const r = (n: number) => {
          const x = Math.sin(i * 91.7 + n * 12.3) * 9301.17;
          return x - Math.floor(x);
        };
        return {
          left: 4 + r(1) * 92,
          size: 10 + r(2) * 16,
          delay: 1.5 + r(3) * 7,
          duration: 6 + r(4) * 5,
          heart: r(5) > 0.35,
          color: r(6) > 0.5 ? '#E25A6B' : '#E8A33D',
        };
      }),
    [],
  );
  return (
    <span aria-hidden className="pointer-events-none absolute inset-x-[-10%] -bottom-[40%] -top-[60%] -z-10 overflow-hidden">
      {items.map((it, i) => (
        <span
          key={i}
          className="animate-float-up absolute bottom-0"
          style={{ left: `${it.left}%`, animationDelay: `${it.delay}s`, animationDuration: `${it.duration}s` }}
        >
          {it.heart ? (
            <svg viewBox="0 0 24 24" width={it.size} height={it.size} fill={it.color} opacity={0.55}>
              <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.3 2.5.7-1.3 2.2-2.5 4.3-2.5 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width={it.size * 0.8} height={it.size * 0.8} fill="#F4C77A" opacity={0.8}>
              <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" />
            </svg>
          )}
        </span>
      ))}
    </span>
  );
}
