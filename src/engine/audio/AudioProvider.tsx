import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { config } from '../../config';
import { url } from '../../film/assets';
import { filmBus } from '../filmBus';
import { AudioEngine } from './AudioEngine';

interface AudioApi {
  unlock: () => void;
  muted: boolean;
  toggleMute: () => void;
}

const AudioContextReact = createContext<AudioApi | null>(null);

export function useAudio() {
  const ctx = useContext(AudioContextReact);
  if (!ctx) throw new Error('useAudio must be used inside <AudioProvider>');
  return ctx;
}

/** Wires the audio engine to the film bus, the timeline never talks to audio directly */
export function AudioProvider({ children }: { children: ReactNode }) {
  const engine = useMemo(
    () =>
      new AudioEngine({
        music: url(config.musicTrack),
        heartbeat: url(config.heartbeatSfx),
        volume: config.film.musicVolume,
      }),
    [],
  );
  const [muted, setMuted] = useState(false);

  useEffect(
    () =>
      filmBus.on((event) => {
        switch (event.type) {
          case 'enter':
            if (event.scene.kind !== 'birthday') engine.stopSong();
            engine.setMusicLevel(event.scene.audio.level, event.scene.audio.ramp);
            engine.setWarmth(event.scene.audio.warmth, event.scene.audio.ramp);
            break;
          case 'cue':
            if (event.cue.type === 'music') engine.setMusicLevel(event.cue.level, event.cue.ramp);
            if (event.cue.type === 'warmth') engine.setWarmth(event.cue.value, event.cue.ramp);
            if (event.cue.type === 'heartbeat') engine.heartbeat();
            break;
          case 'pause':
            engine.pause();
            break;
          case 'resume':
            engine.resume();
            break;
          case 'replay':
            engine.restart();
            break;
          case 'memories':
            if (config.memoriesSong) engine.playSong(url(config.memoriesSong));
            break;
        }
      }),
    [engine],
  );

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      engine.setMuted(!m);
      return !m;
    });
  }, [engine]);

  const api = useMemo(() => ({ unlock: () => engine.unlock(), muted, toggleMute }), [engine, muted, toggleMute]);

  return <AudioContextReact.Provider value={api}>{children}</AudioContextReact.Provider>;
}
