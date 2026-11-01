import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import type { PhotoMemory } from '../../config';
import { url } from '../../film/assets';
import { probe } from '../../engine/assets/imageCache';
import { useOrientation } from '../../hooks/useOrientation';

interface Props {
  photos: PhotoMemory[];
  reduced: boolean;
  onDone: () => void;
}

/** Stable pseudo-random so every viewing lays the pile out the same way */
const rand = (i: number, n: number) => {
  const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Seconds between prints, and how long each one takes to settle */
// Tuned with the Finale timings so the photos and closing words end together with the 61.7s song
const PACE = 1.35;
const DROP = 1.2;

/**
 * Spread the prints evenly over the whole table: one per cell of a grid that covers
 * the screen, cells taken in shuffled order, each print jittered inside its cell.
 * The centre is kept clear for the last, biggest photo
 */
function scatter(count: number, tall: boolean) {
  const cols = tall ? 3 : 6;
  const rows = tall ? 5 : 4;
  const spanX = tall ? 66 : 84; // vw covered by the grid
  const spanY = tall ? 74 : 72; // dvh covered by the grid
  const cells: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const x = ((c + 0.5) / cols - 0.5) * spanX;
      const y = ((r + 0.5) / rows - 0.5) * spanY;
      cells.push({ x, y });
    }
  // stable shuffle
  const order = cells.map((c, i) => ({ c, k: rand(i, 9) })).sort((a, b) => a.k - b.k).map((o) => o.c);
  return Array.from({ length: count }, (_, i) => {
    const cell = order[i % order.length];
    const lap = Math.floor(i / order.length);
    const jx = (rand(i, 1) * 2 - 1) * (spanX / cols) * 0.32;
    const jy = (rand(i, 2) * 2 - 1) * (spanY / rows) * 0.3;
    return { x: cell.x + jx + lap * 3, y: cell.y + jy - lap * 3, rotate: (rand(i, 3) * 2 - 1) * 14 };
  });
}

/**
 * Printed photos dropping one by one onto the cream table, gently scattered,
 * the last one lands in the middle, a little bigger. Tap to drop the next one sooner
 */
export function Memories({ photos, reduced, onDone }: Props) {
  const [shown, setShown] = useState(0);
  const tall = useOrientation() === 'portrait';

  // Warm the cache so each print appears decoded, never half loaded
  useEffect(() => {
    photos.forEach((p) => void probe(url(p.src)));
  }, [photos]);

  useEffect(() => {
    if (shown >= photos.length) {
      const id = window.setTimeout(onDone, 1200);
      return () => clearTimeout(id);
    }
    const id = window.setTimeout(() => setShown((n) => n + 1), (shown === 0 ? 0.5 : reduced ? 0.8 : PACE) * 1000);
    return () => clearTimeout(id);
  }, [shown, photos.length, reduced, onDone]);

  const layout = useMemo(() => {
    const spots = scatter(photos.length - 1, tall);
    return photos.map((_, i) => (i === photos.length - 1 ? { x: 0, y: 0, rotate: -2, last: true } : { ...spots[i], last: false }));
  }, [photos, tall]);

  return (
    <div
      data-no-advance
      className="absolute inset-0 cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        if (shown < photos.length) setShown((n) => n + 1);
      }}
      aria-label="Photos of you"
    >
      {photos.slice(0, shown).map((p, i) => {
        const { x, y, rotate, last } = layout[i];
        return (
          <div
            key={p.src}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `calc(50% + ${x}vw)`, top: `calc(46% + ${y}dvh)`, zIndex: i }}
          >
            <motion.figure
              className={`bg-[#FFFDF8] p-[5%] pb-[4%] shadow-[0_18px_40px_-14px_rgba(58,35,16,0.55),0_4px_10px_-4px_rgba(58,35,16,0.25)] ${
                last
                  ? 'w-[clamp(220px,30vw,360px)] tall:w-[72vw]'
                  : p.full
                    ? 'w-[clamp(200px,26vw,360px)] tall:w-[66vw]'
                    : 'w-[clamp(130px,17vw,230px)] tall:w-[44vw]'
              }`}
              initial={reduced ? { opacity: 0, rotate } : { opacity: 0, scale: 1.35, y: -60, rotate: rotate + (rand(i, 4) > 0.5 ? 12 : -12) }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate }}
              transition={{ duration: reduced ? 0.8 : DROP, ease: [0.16, 0.8, 0.3, 1] }}
            >
              <img
                src={url(p.src)}
                alt={p.caption ?? 'A memory'}
                className={p.full ? 'h-auto w-full' : 'aspect-[4/5] w-full object-cover'}
                style={p.full ? undefined : { objectPosition: p.focus ?? 'center' }}
                decoding="async"
                draggable={false}
              />
              <figcaption className="min-h-[1.6em] pt-[4%] text-center font-hand text-[clamp(1rem,1.6vw,1.45rem)] leading-tight text-[#3A2A1E]/85">
                {p.caption ?? ''}
              </figcaption>
            </motion.figure>
          </div>
        );
      })}
    </div>
  );
}
