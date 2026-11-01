import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Props {
  wishes: string[];
  tamil: string[];
  reduced: boolean;
  /** Called once everything has faded to black */
  onDone: () => void;
}

type Stage = 'veil' | 'wish' | 'tamil' | 'dark';

/** Seconds from the start of the finale */
// The song fades out as the screen fades to black (photos ~39s + 22.5s ≈ the 61.7s song)
const T = { wish: 1.2, tamil: 10.5, dark: 22.5, done: 26.5 };

/**
 * The closing moments after the last photo: the pile dims, wishes rise in word by word,
 * the Tamil lines follow in gold, then everything fades slowly to black, leaving one heart
 */
export function Finale({ wishes, tamil, reduced, onDone }: Props) {
  const [stage, setStage] = useState<Stage>('veil');

  useEffect(() => {
    const k = reduced ? 0.6 : 1;
    const timers = [
      window.setTimeout(() => setStage('wish'), T.wish * 1000 * k),
      window.setTimeout(() => setStage('tamil'), T.tamil * 1000 * k),
      window.setTimeout(() => setStage('dark'), T.dark * 1000 * k),
      window.setTimeout(onDone, T.done * 1000 * k),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reduced, onDone]);

  const dark = stage === 'dark';

  return (
    <div className="pointer-events-none absolute inset-0 z-[150]">
      {/* A warm veil softens the photos so the words can breathe */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(90% 80% at 50% 50%, rgba(255,246,228,0.94), rgba(247,226,188,0.9) 70%, rgba(235,198,140,0.88))' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.2, ease: 'easeInOut' }}
      />

      {/* The slow fade to black, like the end of a film */}
      <motion.div
        className="absolute inset-0 bg-ink"
        initial={{ opacity: 0 }}
        animate={{ opacity: dark ? 1 : 0 }}
        transition={{ duration: 4, ease: [0.45, 0, 0.55, 1] }}
      />

      <div className="absolute inset-0 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {stage === 'wish' && (
            <motion.div
              key="wish"
              className="max-w-[min(34ch,90vw)] text-center font-serif text-[clamp(1.6rem,3.6vw,2.9rem)] italic leading-[1.45] text-[#3A2310]"
              exit={{ opacity: 0, filter: 'blur(8px)', transition: { duration: 1.4 } }}
            >
              {wishes.map((line, i) => (
                <Line key={i} text={line} start={0.3 + i * 2.6} reduced={reduced} />
              ))}
            </motion.div>
          )}

          {stage === 'tamil' && (
            <motion.div
              key="tamil"
              className="max-w-[min(30ch,92vw)] text-center font-tamil text-[clamp(1.25rem,2.9vw,2.3rem)] font-medium leading-[1.9] text-[#7A3B10] [text-shadow:0_1px_18px_rgba(232,163,61,0.35)]"
              exit={{ opacity: 0, transition: { duration: 3 } }}
            >
              {tamil.map((line, i) => (
                <Line key={i} text={line} start={0.4 + i * 3.2} stagger={0.3} reduced={reduced} />
              ))}
            </motion.div>
          )}

          {dark && (
            <motion.div
              key="heart"
              className="text-[clamp(2rem,5vw,3rem)]"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: [0, 1, 0.85], scale: [0.6, 1.08, 1] }}
              transition={{ delay: 2.6, duration: 2.4 }}
            >
              <motion.span
                className="inline-block drop-shadow-[0_0_22px_rgba(226,90,107,0.6)]"
                animate={reduced ? undefined : { scale: [1, 1.12, 1, 1.08, 1] }}
                transition={{ delay: 5, duration: 1.4, repeat: Infinity, repeatDelay: 0.8 }}
              >
                ❤️
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** One line, its words rising from a soft blur one after another */
function Line({ text, start, stagger = 0.16, reduced }: { text: string; start: number; stagger?: number; reduced: boolean }) {
  return (
    <p className="mb-[0.35em]">
      <span className="sr-only">{text}</span>
      {text.split(/\s+/).map((word, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="mr-[0.28em] inline-block"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: start + i * stagger, duration: 1.3, ease: [0.22, 0.61, 0.25, 1] }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}
