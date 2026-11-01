import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { config } from '../../config';
import { useAudio } from '../../engine/audio/AudioProvider';
import { useTimeline } from '../../engine/timeline/TimelineProvider';
import { useFilmControls } from '../../hooks/useFilmControls';
import { useIdle } from '../../hooks/useIdle';
import { FilmGrain, Letterbox, Vignette } from '../fx/FilmLook';
import { SCENE_COMPONENTS } from '../scene/registry';
import { Captions } from '../ui/Captions';
import { Controls, PausedVeil } from '../ui/Controls';
import { Intro } from '../ui/Intro';
import { ProgressDots } from '../ui/ProgressDots';

/**
 * The screen. Scenes crossfade through AnimatePresence, each with its own clock,
 * under a fixed film look (grain, vignette, letterbox) and the player chrome
 */
export function Stage() {
  const { scenes, index, visit, times, playState, start, togglePause } = useTimeline();
  const { unlock } = useAudio();
  const stage = useRef<HTMLElement>(null);
  const onTap = useFilmControls(stage);
  const idle = useIdle();

  const scene = scenes[index];
  const Scene = SCENE_COMPONENTS[scene.kind];
  const started = playState !== 'idle';
  const light = scene.kind === 'birthday';

  // Director's preview, e.g. ?scene=4&t=6.2&still opens S4 frozen at the touch (no audio)
  // `still` freezes a frame for grading, without the pause veil
  const [still] = useState(() => new URLSearchParams(window.location.search).has('still'));
  const previewed = useRef(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (previewed.current || !params.has('scene')) return;
    previewed.current = true;
    start(Number(params.get('scene')) - 1, Number(params.get('t') ?? 0));
    if (params.has('still')) togglePause();
  }, [start, togglePause]);

  const begin = () => {
    unlock();
    start();
  };

  return (
    <main ref={stage} onClick={onTap} className="fixed inset-0 select-none overflow-hidden bg-ink text-cream">
      <h1 className="sr-only">Where Our Hands Meet, a birthday film for {config.recipientName}</h1>

      <AnimatePresence initial={false}>
        {started && (
          <motion.section
            key={`${scene.id}-${visit}`}
            aria-label={scene.title}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: scene.transition ?? 1.4, ease: [0.45, 0, 0.55, 1] }}
          >
            <Scene scene={scene} time={times[index]} />
          </motion.section>
        )}
      </AnimatePresence>

      <FilmGrain opacity={config.film.grain} />
      <Vignette light={light} />
      <Letterbox open={scene.fx?.letterbox === false} />

      {started && (
        <>
          <ProgressDots light={light} hidden={idle && !light} />
          <Controls light={light} hidden={idle} />
          <PausedVeil visible={playState === 'paused' && !still} />
          <Captions />
        </>
      )}

      <Intro visible={!started} onBegin={begin} />
    </main>
  );
}
