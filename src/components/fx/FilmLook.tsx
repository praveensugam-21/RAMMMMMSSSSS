import { motion } from 'framer-motion';
import { useMemo } from 'react';

/** Static noise tile generated once, then shifted with transform steps */
function useNoiseTile(size = 200) {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d')!;
    const data = g.createImageData(size, size);
    for (let i = 0; i < data.data.length; i += 4) {
      const v = Math.random() * 255;
      data.data[i] = data.data[i + 1] = data.data[i + 2] = v;
      data.data[i + 3] = 255;
    }
    g.putImageData(data, 0, 0);
    return c.toDataURL('image/png');
  }, [size]);
}

export function FilmGrain({ opacity }: { opacity: number }) {
  const tile = useNoiseTile();
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 overflow-hidden" style={{ opacity }}>
      <div className="animate-grain absolute -inset-[50%]" style={{ backgroundImage: `url(${tile})` }} />
    </div>
  );
}

export function Vignette({ light = false }: { light?: boolean }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40"
      animate={{ opacity: light ? 0.35 : 1 }}
      transition={{ duration: 2.4 }}
      style={{ background: 'radial-gradient(120% 100% at 50% 50%, transparent 52%, rgba(0,0,0,0.72) 100%)' }}
    />
  );
}

/** 2.39:1 bars. Their height is the CSS var --bar, they retract for the birthday scene */
export function Letterbox({ open }: { open: boolean }) {
  const bar = 'pointer-events-none fixed inset-x-0 z-40 h-[var(--bar)] bg-ink';
  const transition = { duration: 2.2, ease: [0.65, 0, 0.35, 1] as const };
  return (
    <>
      <motion.div aria-hidden className={`${bar} top-0 origin-top`} animate={{ scaleY: open ? 0 : 1 }} transition={transition} />
      <motion.div aria-hidden className={`${bar} bottom-0 origin-bottom`} animate={{ scaleY: open ? 0 : 1 }} transition={transition} />
    </>
  );
}
