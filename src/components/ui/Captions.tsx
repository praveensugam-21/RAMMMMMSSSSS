import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAudio } from '../../engine/audio/AudioProvider';
import { filmBus } from '../../engine/filmBus';
import { useTimeline } from '../../engine/timeline/TimelineProvider';

/**
 * Accessibility captions
 *  - screen readers hear each story line as its scene begins
 *  - when muted, the heartbeat is shown as a visual caption
 */
export function Captions() {
  const { scenes, index, playState } = useTimeline();
  const { muted } = useAudio();
  const [beat, setBeat] = useState(false);

  useEffect(
    () =>
      filmBus.on((e) => {
        if (e.type === 'cue' && e.cue.type === 'heartbeat') {
          setBeat(true);
          window.setTimeout(() => setBeat(false), 2200);
        }
      }),
    [],
  );

  const scene = scenes[index];
  const announcement = playState === 'idle' ? '' : scene.line?.text ?? `${scene.title}`;

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      <AnimatePresence>
        {beat && muted && (
          <motion.p
            className="pointer-events-none fixed inset-x-0 top-[calc(var(--bar)+3dvh)] z-50 text-center font-serif text-sm italic tracking-widest text-cream/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            [ a heartbeat ]
          </motion.p>
        )}
      </AnimatePresence>
    </>
  );
}
