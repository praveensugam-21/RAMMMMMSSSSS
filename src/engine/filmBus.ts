import type { Cue, SceneSpec } from '../film/types';

/**
 * A tiny typed event bus, the timeline publishes, audio and captions listen
 * Keeps the timeline unaware of who reacts to it
 */
export type FilmEvent =
  | { type: 'enter'; index: number; scene: SceneSpec }
  | { type: 'cue'; index: number; cue: Cue }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'replay' }
  /** The photos begin, their own song takes over */
  | { type: 'memories' };

type Listener = (event: FilmEvent) => void;

const listeners = new Set<Listener>();

export const filmBus = {
  emit(event: FilmEvent) {
    listeners.forEach((fn) => fn(event));
  },
  on(fn: Listener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};
