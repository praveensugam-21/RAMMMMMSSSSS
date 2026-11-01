import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

interface Word {
  text: string;
  at: number;
  dur: number;
}

interface Line {
  blank: boolean;
  at: number;
  words: Word[];
}

/** Turns the letter into a writing schedule, slower on long words, a breath at each line end */
function schedule(text: string, reduced: boolean) {
  const lines: Line[] = [];
  let cursor = 0.6;
  for (const raw of text.split('\n')) {
    const trimmed = raw.trim();
    if (!trimmed) {
      lines.push({ blank: true, at: cursor, words: [] });
      cursor += reduced ? 0.2 : 0.55;
      continue;
    }
    const at = cursor;
    const words = trimmed.split(/\s+/).map((w) => {
      const dur = reduced ? 0.4 : Math.min(0.6, Math.max(0.16, w.length * 0.055));
      const word = { text: w, at: cursor, dur };
      cursor += reduced ? 0.04 : dur + 0.05;
      return word;
    });
    lines.push({ blank: false, at, words });
    cursor += reduced ? 0.25 : 0.4;
  }
  return { lines, total: cursor };
}

interface Props {
  text: string;
  signoff: string;
  sender: string;
  reduced: boolean;
  onDone: () => void;
}

/** The handwritten letter, it writes itself word by word. Tap to finish writing */
export function Letter({ text, signoff, sender, reduced, onDone }: Props) {
  const { lines, total } = useMemo(() => schedule(text, reduced), [text, reduced]);
  const [skipped, setSkipped] = useState(false);
  const lineRefs = useRef<(HTMLElement | null)[]>([]);
  const signRef = useRef<HTMLDivElement>(null);
  const end = skipped ? 0.3 : total;

  // Keep the line being written in view on small screens
  useEffect(() => {
    if (skipped) return;
    const timers = lines.map((line, i) =>
      window.setTimeout(() => lineRefs.current[i]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), line.at * 1000),
    );
    timers.push(window.setTimeout(() => signRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), total * 1000));
    return () => timers.forEach(clearTimeout);
  }, [lines, total, skipped]);

  useEffect(() => {
    const id = window.setTimeout(onDone, (end + 1.6) * 1000);
    return () => clearTimeout(id);
  }, [end, onDone]);

  return (
    <motion.article
      data-scrollable
      data-no-advance
      aria-label="A letter"
      onClick={() => setSkipped(true)}
      className="relative max-h-[58dvh] w-[min(92vw,640px)] overflow-y-auto rounded-[3px] bg-paper px-7 py-8 shadow-[0_40px_80px_-30px_rgba(58,35,16,0.5),0_10px_24px_-12px_rgba(58,35,16,0.3)] sm:px-12 sm:py-11"
      style={{
        backgroundImage:
          'radial-gradient(120% 80% at 20% 0%, rgba(255,255,255,0.7), transparent 60%), radial-gradient(100% 100% at 100% 100%, rgba(232,193,132,0.18), transparent 60%)',
      }}
      initial={{ opacity: 0, y: 60, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: reduced ? 0.4 : 1.2, ease: [0.22, 0.61, 0.25, 1] }}
    >
      <div key={skipped ? 'written' : 'writing'} className="font-hand text-[clamp(1.35rem,2.5vw,1.85rem)] leading-[1.5] text-[#3A2A1E]">
        <span className="sr-only">{text}</span>
        {lines.map((line, i) =>
          line.blank ? (
            <div key={i} aria-hidden className="h-[0.8em]" ref={(el) => (lineRefs.current[i] = el)} />
          ) : (
            <p key={i} aria-hidden ref={(el) => (lineRefs.current[i] = el)}>
              {line.words.map((w, j) => (
                <span key={j}>
                  <motion.span
                    className="inline-block pr-[0.08em]"
                    initial={skipped ? false : reduced ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(-20% 100% -20% 0)' }}
                    animate={reduced ? { opacity: 1 } : { opacity: 1, clipPath: 'inset(-20% 0% -20% 0)' }}
                    transition={{ delay: w.at, duration: w.dur, ease: 'linear' }}
                  >
                    {w.text}
                  </motion.span>{' '}
                </span>
              ))}
            </p>
          ),
        )}

        <motion.div
          ref={signRef}
          className="mt-6 text-right"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: end + 0.2, duration: 1.2 }}
        >
          <p>{signoff}</p>
          <p className="mt-1 inline-block -rotate-3 text-[1.45em] text-[#7A3B1E]">{sender}</p>
        </motion.div>
      </div>
    </motion.article>
  );
}
