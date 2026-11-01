import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { loadSequence } from '../../../engine/assets/imageCache';
import { clamp01 } from '../../../film/keyframes';
import type { FrameSequence } from '../../../film/types';
import { useOrientation } from '../../../hooks/useOrientation';

/** Seconds the cutouts and the first sequence frame crossfade, short so the two never ghost */
export const HANDOFF = 0.3;

/** undefined = loading, null = missing, array = ready */
export type SequenceFrames = HTMLImageElement[] | null | undefined;

export function useSequence(seq?: FrameSequence): SequenceFrames {
  const [frames, setFrames] = useState<SequenceFrames>(seq ? undefined : null);
  useEffect(() => {
    if (!seq) return;
    let alive = true;
    void loadSequence(seq).then((f) => alive && setFrames(f));
    return () => {
      alive = false;
    };
  }, [seq]);
  return frames;
}

/**
 * Maps scene time to a frame
 *   start → contactAt         approach, frames 0 → contactFrame
 *   contactAt → +freeze       held on the contact frame, the frozen breath
 *   → end                     the intertwine plays to the last frame
 */
export function frameAt(seq: FrameSequence, t: number) {
  const { start, contactAt, freeze, end, contactFrame, count } = seq;
  if (t <= start) return 0;
  if (t < contactAt) return Math.round(contactFrame * clamp01((t - start) / (contactAt - start)));
  const landed = contactAt + freeze;
  if (t < landed) return contactFrame;
  return Math.round(contactFrame + (count - 1 - contactFrame) * clamp01((t - landed) / (end - landed)));
}

interface Props {
  seq: FrameSequence;
  frames: SequenceFrames;
  time: MotionValue<number>;
}

/** Plays the pre-rendered touch on a canvas, scrubbable by time (hold-to-touch drives it) */
export function SequenceLayerView({ seq, frames, time }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const current = useRef(-1);
  const opacity = useTransform(time, [seq.start - HANDOFF, seq.start], [0, 1]);
  // Landscape: fit to width, the frames are composed in vw like the cutouts, so they line up exactly
  // Portrait: cover, the touch stays centred
  const fitWidth = useOrientation() === 'landscape';

  const draw = useCallback(
    (index: number, force = false) => {
      const el = canvas.current;
      const img = frames?.[index];
      if (!el || !img || (!force && index === current.current) || !img.naturalWidth) return;
      current.current = index;
      const ctx = el.getContext('2d');
      if (!ctx) return;
      const s = fitWidth
        ? el.width / img.naturalWidth
        : Math.max(el.width / img.naturalWidth, el.height / img.naturalHeight);
      ctx.fillStyle = '#0A0A0C';
      ctx.fillRect(0, 0, el.width, el.height);
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;
      ctx.drawImage(img, (el.width - w) / 2, (el.height - h) / 2, w, h);
    },
    [frames, fitWidth],
  );

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.round(el.clientWidth * dpr);
      el.height = Math.round(el.clientHeight * dpr);
      draw(frameAt(seq, time.get()), true);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    return () => ro.disconnect();
  }, [draw, seq, time]);

  useMotionValueEvent(time, 'change', (t) => draw(frameAt(seq, t)));

  if (!frames) return null;
  return <motion.canvas ref={canvas} aria-hidden className="absolute inset-0 h-full w-full" style={{ opacity }} />;
}
