import { motionValue, type MotionValue } from 'framer-motion';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { SceneSpec } from '../../film/types';
import { preloadScene } from '../assets/imageCache';
import { filmBus } from '../filmBus';

export type PlayState = 'idle' | 'playing' | 'paused';
/** `waiting` = the film is holding at the touch gate, `holding` = the viewer is pressing */
export type GateState = 'none' | 'waiting' | 'holding';

interface TimelineApi {
  scenes: SceneSpec[];
  index: number;
  /** Increments on every scene entry, used as a remount key */
  visit: number;
  /** One clock per scene, so an exiting scene freezes on its last frame while crossfading */
  times: MotionValue<number>[];
  playState: PlayState;
  gate: GateState;
  /** Begin playback, optionally from a scene and time (used by the ?scene= preview mode) */
  start: (index?: number, at?: number) => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  togglePause: () => void;
  setHolding: (holding: boolean) => void;
  replay: () => void;
}

const TimelineContext = createContext<TimelineApi | null>(null);

export function useTimeline() {
  const ctx = useContext(TimelineContext);
  if (!ctx) throw new Error('useTimeline must be used inside <TimelineProvider>');
  return ctx;
}

/** Drift speed back toward the gate while the viewer lets go, a small echo of her hesitation */
const RELEASE_DRIFT = 0.45;

/**
 * The central timeline controller
 * A single rAF clock advances the active scene's MotionValue, fires cues,
 * runs the hold-to-touch gate and moves to the next scene when one ends
 * Components read time from MotionValues, so playback never re-renders React
 */
export function TimelineProvider({ scenes, children }: { scenes: SceneSpec[]; children: ReactNode }) {
  const times = useMemo(() => scenes.map(() => motionValue(0)), [scenes]);
  const [index, setIndex] = useState(0);
  const [visit, setVisit] = useState(0);
  const [playState, setPlayState] = useState<PlayState>('idle');
  const [gate, setGateState] = useState<GateState>('none');

  const live = useRef({
    index: 0,
    playState: 'idle' as PlayState,
    gate: 'none' as GateState,
    holding: false,
    gateOpen: false,
    idle: 0,
    fired: new Set<number>(),
  });

  const setGate = useCallback((g: GateState) => {
    if (live.current.gate === g) return;
    live.current.gate = g;
    setGateState(g);
  }, []);

  const enter = useCallback(
    (i: number, at = 0) => {
      const target = Math.max(0, Math.min(scenes.length - 1, i));
      const s = live.current;
      s.index = target;
      s.gateOpen = false;
      s.holding = false;
      s.idle = 0;
      // Cues before the entry point count as already played
      s.fired = new Set((scenes[target].cues ?? []).flatMap((c, n) => (c.at < at ? [n] : [])));
      times[target].set(at);
      setGate('none');
      setIndex(target);
      setVisit((v) => v + 1);
      filmBus.emit({ type: 'enter', index: target, scene: scenes[target] });
      preloadScene(scenes[target + 1]);
    },
    [scenes, times, setGate],
  );

  const tick = useCallback(
    (dt: number) => {
      const s = live.current;
      if (s.playState !== 'playing') return;
      const scene = scenes[s.index];
      const clock = times[s.index];
      let t = clock.get();

      const hold = scene.hold;
      if (hold && !s.gateOpen && t >= hold.gateAt) {
        if (s.holding) {
          s.idle = 0;
          t += dt;
        } else {
          s.idle += dt;
          t = Math.max(hold.gateAt, t - dt * RELEASE_DRIFT);
          if (s.idle >= hold.autoAfter) s.gateOpen = true;
        }
        if (t >= hold.until) s.gateOpen = true;
        setGate(s.gateOpen ? 'none' : s.holding ? 'holding' : 'waiting');
      } else {
        t += dt;
      }
      clock.set(t);

      scene.cues?.forEach((cue, i) => {
        if (t >= cue.at && !s.fired.has(i)) {
          s.fired.add(i);
          filmBus.emit({ type: 'cue', index: s.index, cue });
        }
      });

      if (scene.duration !== null && t >= scene.duration && s.index < scenes.length - 1) enter(s.index + 1);
    },
    [scenes, times, enter, setGate],
  );

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      // Cap dt so a backgrounded tab doesn't jump the story forward, while
      // slow devices (down to 10fps) still keep real time in sync with the music
      tick(Math.min(0.1, (now - last) / 1000));
      last = now;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [tick]);

  const setPlay = useCallback((p: PlayState) => {
    live.current.playState = p;
    setPlayState(p);
  }, []);

  const api = useMemo<TimelineApi>(
    () => ({
      scenes,
      index,
      visit,
      times,
      playState,
      gate,
      start: (i = 0, at = 0) => {
        if (live.current.playState !== 'idle') return;
        setPlay('playing');
        enter(i, at);
      },
      next: () => {
        if (live.current.index < scenes.length - 1) enter(live.current.index + 1);
      },
      prev: () => {
        if (live.current.index > 0) enter(live.current.index - 1);
      },
      goTo: (i) => enter(i),
      togglePause: () => {
        const s = live.current;
        if (s.playState === 'idle') return;
        const paused = s.playState === 'playing';
        setPlay(paused ? 'paused' : 'playing');
        filmBus.emit({ type: paused ? 'pause' : 'resume' });
      },
      setHolding: (holding) => {
        live.current.holding = holding;
        if (holding) live.current.idle = 0;
      },
      replay: () => {
        times.forEach((t) => t.set(0));
        filmBus.emit({ type: 'replay' });
        setPlay('playing');
        enter(0);
      },
    }),
    [scenes, index, visit, times, playState, gate, enter, setPlay],
  );

  return <TimelineContext.Provider value={api}>{children}</TimelineContext.Provider>;
}
