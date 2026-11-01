import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { StoryLineSpec } from '../../film/types';

interface Props {
  line: StoryLineSpec;
  time: MotionValue<number>;
  /** Scene end, the line exhales out just before it */
  end: number | null;
  reduced: boolean;
}

/** The story line, word by word, from blur to sharp */
export function StoryLine({ line, time, end, reduced }: Props) {
  const words = line.text.split(/\s+/);
  const stagger = line.stagger ?? 0.2;
  const out = useTransform(time, end ? [end - 1.6, end - 0.4] : [0, 1], end ? [1, 0] : [1, 1]);
  const placement = line.placement === 'top' ? 'top-[calc(var(--bar)+5dvh)]' : 'bottom-[calc(var(--bar)+5dvh)]';

  return (
    <motion.p
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 z-20 mx-auto max-w-[min(46ch,88vw)] px-6 text-center font-serif text-[clamp(1.15rem,2.15vw,2.1rem)] font-normal italic leading-[1.45] tracking-[0.01em] text-cream/90 ${placement}`}
      style={{ opacity: out, textShadow: '0 2px 28px rgba(0,0,0,0.65)' }}
    >
      {words.map((word, i) => (
        <Word key={i} word={word} time={time} start={line.at + i * stagger} reduced={reduced} />
      ))}
    </motion.p>
  );
}

function Word({ word, time, start, reduced }: { word: string; time: MotionValue<number>; start: number; reduced: boolean }) {
  const opacity = useTransform(time, [start, start + 1.1], [0, 1]);
  const blur = useTransform(time, [start, start + 1.4], [reduced ? 0 : 10, 0]);
  const filter = useTransform(blur, (b) => (b > 0.05 ? `blur(${b}px)` : 'none'));
  const y = useTransform(time, [start, start + 1.4], [reduced ? 0 : 6, 0]);
  return (
    <motion.span className="mr-[0.28em] inline-block" style={{ opacity, filter, y }}>
      {word}
    </motion.span>
  );
}
