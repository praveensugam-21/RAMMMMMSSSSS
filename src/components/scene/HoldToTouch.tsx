import { AnimatePresence, motion, useTransform, type MotionValue } from 'framer-motion';
import type { PointerEvent } from 'react';
import { useTimeline } from '../../engine/timeline/TimelineProvider';
import { clamp01 } from '../../film/keyframes';
import type { HoldGate } from '../../film/types';

/** "Hold to bring them together", a long press scrubs the final approach */
export function HoldToTouch({ hold, time }: { hold: HoldGate; time: MotionValue<number> }) {
  const { gate, setHolding } = useTimeline();
  const progress = useTransform(time, (t) => clamp01((t - hold.gateAt) / (hold.until - hold.gateAt)));
  const visible = gate !== 'none';

  const press = (on: boolean) => (e: PointerEvent) => {
    e.stopPropagation();
    setHolding(on);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          data-no-advance
          className="absolute inset-0 z-30 cursor-pointer touch-none select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          onPointerDown={press(true)}
          onPointerUp={press(false)}
          onPointerCancel={press(false)}
          onPointerLeave={press(false)}
          onContextMenu={(e) => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-x-0 top-[calc(var(--bar)+4dvh)] flex flex-col items-center gap-3 text-cream/70">
            <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden>
              <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,244,224,0.15)" strokeWidth="1.5" />
              <motion.circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="#F4C77A"
                strokeWidth="1.5"
                strokeLinecap="round"
                style={{ pathLength: progress, rotate: -90, originX: '50%', originY: '50%' }}
              />
              <circle cx="24" cy="24" r={gate === 'holding' ? 5 : 3} fill="#F4C77A" opacity={0.8} />
            </svg>
            <p className="font-serif text-sm italic tracking-wide sm:text-base">
              {gate === 'holding' ? 'keep holding…' : 'hold to bring them together'}
            </p>
            <span className="sr-only">Press and hold the screen, or hold the space bar</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
