import { useEffect, useRef, type MouseEvent, type RefObject } from 'react';
import { useAudio } from '../engine/audio/AudioProvider';
import { useTimeline } from '../engine/timeline/TimelineProvider';

const isInteractive = (el: EventTarget | null) =>
  el instanceof HTMLElement && !!el.closest('button, a, input, textarea, [data-no-advance]');

/**
 * Keyboard, wheel and swipe controls
 *   Space / → / Enter  next scene   (Space = hold at the touch gate)
 *   ←                  previous scene
 *   P or K             pause / play
 *   M                  mute
 */
export function useFilmControls(stage: RefObject<HTMLElement>) {
  const { next, prev, togglePause, setHolding, gate, playState } = useTimeline();
  const { toggleMute } = useAudio();
  const gateRef = useRef(gate);
  gateRef.current = gate;
  const active = playState !== 'idle';

  useEffect(() => {
    if (!active) return;
    const onDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === ' ' && isInteractive(e.target)) return;
      if (key === ' ' && gateRef.current !== 'none') {
        e.preventDefault();
        if (!e.repeat) setHolding(true);
        return;
      }
      if (key === ' ' || key === 'arrowright' || key === 'enter') {
        if (key === 'enter' && isInteractive(e.target)) return;
        e.preventDefault();
        next();
      } else if (key === 'arrowleft') prev();
      else if (key === 'p' || key === 'k') togglePause();
      else if (key === 'm') toggleMute();
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === ' ') setHolding(false);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [active, next, prev, togglePause, toggleMute, setHolding]);

  useEffect(() => {
    const el = stage.current;
    if (!el || !active) return;
    let cooldown = 0;
    let touchY: number | null = null;
    const advance = () => {
      const now = performance.now();
      if (now < cooldown || gateRef.current !== 'none') return;
      cooldown = now + 1400;
      next();
    };
    const onWheel = (e: WheelEvent) => {
      // Let the letter scroll on its own
      if (e.target instanceof HTMLElement && e.target.closest('[data-scrollable]')) return;
      if (e.deltaY > 24) advance();
    };
    const onTouchStart = (e: TouchEvent) => (touchY = e.touches[0]?.clientY ?? null);
    const onTouchEnd = (e: TouchEvent) => {
      const endY = e.changedTouches[0]?.clientY;
      if (touchY !== null && endY !== undefined && touchY - endY > 70) advance();
      touchY = null;
    };
    el.addEventListener('wheel', onWheel, { passive: true });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [stage, active, next]);

  /** Tap anywhere on the picture to advance */
  return (e: MouseEvent) => {
    if (!active || isInteractive(e.target) || gateRef.current !== 'none') return;
    next();
  };
}
