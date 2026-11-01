import { motion } from 'framer-motion';
import { useAudio } from '../../engine/audio/AudioProvider';
import { useTimeline } from '../../engine/timeline/TimelineProvider';

const Icon = {
  pause: <path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" />,
  play: <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />,
  sound: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
      <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>
  ),
  muted: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
      <path d="M16 9.5l5 5M21 9.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
};

/** Pause and mute, top right, they fade away while the film is watched */
export function Controls({ light, hidden }: { light: boolean; hidden: boolean }) {
  const { playState, togglePause } = useTimeline();
  const { muted, toggleMute } = useAudio();
  const paused = playState === 'paused';
  const tone = light ? 'text-[#3A2310]/60 hover:text-[#3A2310]' : 'text-cream/55 hover:text-cream';
  const btn = `grid h-10 w-10 place-items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-honey/60 ${tone}`;

  return (
    <motion.div
      className="fixed right-[max(12px,env(safe-area-inset-right))] top-[max(10px,calc(var(--bar)/2-20px))] z-50 flex gap-1"
      animate={{ opacity: hidden && !paused ? 0 : 1 }}
      transition={{ duration: 0.8 }}
    >
      <button type="button" className={btn} onClick={(e) => (e.stopPropagation(), togglePause())} aria-label={paused ? 'Play' : 'Pause'}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          {paused ? Icon.play : Icon.pause}
        </svg>
      </button>
      <button
        type="button"
        className={btn}
        onClick={(e) => (e.stopPropagation(), toggleMute())}
        aria-label={muted ? 'Unmute' : 'Mute'}
        aria-pressed={muted}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          {muted ? Icon.muted : Icon.sound}
        </svg>
      </button>
    </motion.div>
  );
}

/** A quiet card while paused */
export function PausedVeil({ visible }: { visible: boolean }) {
  return (
    <motion.div
      aria-hidden={!visible}
      className="pointer-events-none fixed inset-0 z-[45] grid place-items-center bg-ink/40"
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.6 }}
    >
      <p className="font-serif text-lg italic tracking-wide text-cream/70">paused</p>
    </motion.div>
  );
}
