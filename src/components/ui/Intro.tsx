import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import { config } from '../../config';

interface Props {
  visible: boolean;
  onBegin: () => void;
}

/**
 * The title card. A beating heart is the only thing to touch,
 * and that touch also unlocks audio (browsers require a gesture)
 */
export function Intro({ visible, onBegin }: Props) {
  const button = useRef<HTMLButtonElement>(null);
  const { dedication, title, cta, soundHint } = config.intro;

  useEffect(() => {
    if (visible) button.current?.focus({ preventScroll: true });
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden bg-ink px-6 text-center"
          exit={{ opacity: 0, transition: { duration: 2, delay: 0.5, ease: [0.65, 0, 0.35, 1] } }}
        >
          {/* A warm glow breathing behind everything */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[58%] h-[110vmin] w-[110vmin] rounded-full"
            style={{ x: '-50%', y: '-50%', background: 'radial-gradient(closest-side, rgba(232,163,61,0.16), rgba(226,90,107,0.06) 45%, transparent 72%)' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 1, 0.75, 1], scale: [0.8, 1, 1.04, 1] }}
            transition={{ delay: 0.6, duration: 6, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />
          <Embers />

          <motion.p
            className="relative font-hand text-[clamp(1.8rem,5vw,2.8rem)] text-honey [text-shadow:0_0_24px_rgba(232,163,61,0.35)]"
            initial={{ opacity: 0, clipPath: 'inset(-30% 100% -30% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(-30% 0% -30% 0)' }}
            transition={{ delay: 0.5, duration: 2, ease: 'easeInOut' }}
          >
            {dedication}
          </motion.p>

          <motion.h1
            className="relative mt-3 font-serif text-[clamp(2.6rem,7.5vw,5.6rem)] font-light italic leading-[1.05] text-cream [text-shadow:0_0_40px_rgba(255,244,224,0.18)]"
            initial={{ opacity: 0, filter: 'blur(14px)', y: 10 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ delay: 1.6, duration: 2.6, ease: [0.22, 0.61, 0.25, 1] }}
          >
            {title}
          </motion.h1>

          <motion.div
            className="relative mt-[clamp(2.5rem,9vh,5rem)] flex flex-col items-center"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.4, duration: 1.6 }}
          >
            <motion.button
              ref={button}
              type="button"
              onClick={onBegin}
              aria-label={`${cta}, ${soundHint}`}
              className="relative grid h-[clamp(92px,22vmin,124px)] w-[clamp(92px,22vmin,124px)] place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-honey/60"
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.92 }}
              exit={{ scale: 3.2, opacity: 0, transition: { duration: 1.3, ease: [0.2, 0.7, 0.2, 1] } }}
            >
              {/* Ripples, like a pulse spreading outward */}
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  aria-hidden
                  className="animate-ripple absolute inset-0 rounded-full border border-[#E8A33D]/50"
                  style={{ animationDelay: `${i * 0.9}s` }}
                />
              ))}
              <span aria-hidden className="absolute inset-[18%] rounded-full bg-[radial-gradient(closest-side,rgba(226,90,107,0.45),transparent)] blur-md" />
              <motion.svg
                viewBox="0 0 24 24"
                aria-hidden
                className="relative h-[64%] w-[64%] drop-shadow-[0_0_18px_rgba(226,90,107,0.65)]"
                animate={{ scale: [1, 1.16, 1, 1.11, 1] }}
                transition={{ duration: 1.3, times: [0, 0.14, 0.3, 0.44, 0.62], repeat: Infinity, repeatDelay: 0.5, ease: 'easeOut' }}
              >
                <defs>
                  <linearGradient id="intro-heart" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#FF8A8F" />
                    <stop offset="0.55" stopColor="#E25A6B" />
                    <stop offset="1" stopColor="#B8323F" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#intro-heart)"
                  d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.3 2.5.7-1.3 2.2-2.5 4.3-2.5 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"
                />
                <path fill="rgba(255,255,255,0.35)" d="M7 6.6c-1.6.2-2.7 1.6-2.6 3.2.1.5.6.6.8.2.4-1.2 1.2-2 2.3-2.4.5-.2.4-1.1-.5-1z" />
              </motion.svg>
            </motion.button>

            <motion.p
              className="mt-5 font-hand text-[clamp(1.4rem,3.6vw,1.9rem)] text-cream/85"
              animate={{ opacity: [0.65, 1, 0.65] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              {cta}
            </motion.p>
            <p className="mt-2 font-serif text-xs italic tracking-[0.2em] text-cream/35">{soundHint}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** A few slow golden embers rising through the dark */
function Embers() {
  const items = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const r = (n: number) => {
          const x = Math.sin(i * 47.3 + n * 19.1) * 7919.7;
          return x - Math.floor(x);
        };
        return { left: r(1) * 100, size: 2 + r(2) * 4, delay: r(3) * 9, duration: 9 + r(4) * 8 };
      }),
    [],
  );
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {items.map((e, i) => (
        <span
          key={i}
          className="animate-ember absolute bottom-[-10px] rounded-full bg-[#F4C77A]"
          style={{
            left: `${e.left}%`,
            width: e.size,
            height: e.size,
            boxShadow: `0 0 ${e.size * 3}px ${e.size}px rgba(244,199,122,0.35)`,
            animationDelay: `${e.delay}s`,
            animationDuration: `${e.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
