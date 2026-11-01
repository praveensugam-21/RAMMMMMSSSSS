import { AmbientSynth, synthHeartbeat } from './synth';

interface AudioOptions {
  music: string;
  heartbeat: string;
  volume: number;
}

/** Lowpass cutoff range, the music literally opens up as the film warms */
const COOL_HZ = 1300;
const WARM_HZ = 16000;

/**
 * Web Audio graph
 *   music (file or synth) → musicGain → tone (lowpass) ┐
 *   heartbeat ──────────────────────────→ sfxGain ─────┴→ master → out
 * Every level change is a ramp, so all transitions are crossfades
 */
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicGain!: GainNode;
  private tone!: BiquadFilterNode;
  private sfxGain!: GainNode;
  private el: HTMLAudioElement | null = null;
  private synth: AmbientSynth | null = null;
  private beat: AudioBuffer | null = null;
  /** A separate song (e.g. for the photos), crossfaded against the film music */
  private song: HTMLAudioElement | null = null;
  private songGain: GainNode | null = null;
  private songOn = false;
  private songEnding = false;
  /** The film music level to return to when the song stops */
  private musicLevel = 0;
  private muted = false;

  constructor(private opts: AudioOptions) {}

  /** Must run inside a user gesture, this is why the film opens with "Tap to begin" */
  unlock() {
    if (this.ctx) return;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    this.master.connect(ctx.destination);

    this.tone = ctx.createBiquadFilter();
    this.tone.type = 'lowpass';
    this.tone.frequency.value = COOL_HZ;
    this.tone.Q.value = 0.4;
    this.tone.connect(this.master);

    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = 0;
    this.musicGain.connect(this.tone);

    this.sfxGain = ctx.createGain();
    this.sfxGain.gain.value = 1;
    this.sfxGain.connect(this.master);

    void ctx.resume();
    this.startMusic();
    void this.loadHeartbeat();
  }

  private startMusic() {
    const ctx = this.ctx!;
    const el = new Audio();
    el.loop = true;
    el.preload = 'auto';
    el.src = this.opts.music;
    const fallback = () => {
      if (this.synth) return;
      this.el = null;
      this.synth = new AmbientSynth(ctx, this.musicGain);
      this.synth.start();
    };
    el.addEventListener('error', fallback, { once: true });
    try {
      ctx.createMediaElementSource(el).connect(this.musicGain);
      this.el = el;
      // Called synchronously inside the gesture so mobile Safari allows it
      el.play().catch(() => {
        if (el.error) fallback();
      });
    } catch {
      fallback();
    }
  }

  private async loadHeartbeat() {
    try {
      const res = await fetch(this.opts.heartbeat);
      if (!res.ok) return;
      this.beat = await this.ctx!.decodeAudioData(await res.arrayBuffer());
    } catch {
      this.beat = null; // missing or not audio, the synthesized heartbeat is used
    }
  }

  setMusicLevel(level: number, ramp: number) {
    this.musicLevel = level;
    // While the song plays, the film music stays silent
    if (!this.ctx || this.songOn) return;
    const g = this.musicGain.gain;
    const now = this.ctx.currentTime;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(level * this.opts.volume, now + Math.max(0.05, ramp));
  }

  /** 0 = cool and muffled, 1 = open and warm */
  setWarmth(value: number, ramp: number) {
    if (!this.ctx) return;
    const f = this.tone.frequency;
    const now = this.ctx.currentTime;
    f.cancelScheduledValues(now);
    f.setValueAtTime(f.value, now);
    f.exponentialRampToValueAtTime(COOL_HZ * Math.pow(WARM_HZ / COOL_HZ, value), now + Math.max(0.05, ramp));
    this.synth?.setWarm(value > 0.5);
  }

  heartbeat() {
    if (!this.ctx) return;
    if (this.beat) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.beat;
      src.connect(this.sfxGain);
      src.start();
    } else {
      synthHeartbeat(this.ctx, this.sfxGain);
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (!this.ctx) return;
    const g = this.master.gain;
    const now = this.ctx.currentTime;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(muted ? 0 : 1, now + 0.4);
  }

  /** Crossfade from the film music into a song, played clean (no warmth filter) */
  playSong(url: string, fade = 2.5) {
    const ctx = this.ctx;
    if (!ctx || this.songOn) return;
    this.songOn = true;
    if (!this.song) {
      const el = new Audio();
      el.src = url;
      // Plays once, start to finish
      el.loop = false;
      el.preload = 'auto';
      const g = ctx.createGain();
      // A soft 3s fade over the very end, so a cut file never stops abruptly
      el.addEventListener('timeupdate', () => {
        if (!this.songOn || !el.duration || el.duration - el.currentTime > 3 || this.songEnding) return;
        this.songEnding = true;
        const t = ctx.currentTime;
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.linearRampToValueAtTime(0, t + Math.max(0.3, el.duration - el.currentTime));
      });
      g.gain.value = 0;
      g.connect(this.master);
      try {
        ctx.createMediaElementSource(el).connect(g);
      } catch {
        return;
      }
      this.song = el;
      this.songGain = g;
    }
    this.songEnding = false;
    this.song.currentTime = 0;
    void this.song.play().catch(() => undefined);
    const now = ctx.currentTime;
    const sg = this.songGain!.gain;
    sg.cancelScheduledValues(now);
    sg.setValueAtTime(sg.value, now);
    sg.linearRampToValueAtTime(this.opts.volume, now + fade);
    // Fade the film music to silence, then stop it completely
    const mg = this.musicGain.gain;
    mg.cancelScheduledValues(now);
    mg.setValueAtTime(mg.value, now);
    mg.linearRampToValueAtTime(0, now + fade);
    window.setTimeout(() => {
      if (!this.songOn) return;
      this.el?.pause();
      this.synth?.stop();
      mg.cancelScheduledValues(ctx.currentTime);
      mg.setValueAtTime(0, ctx.currentTime);
    }, fade * 1000 + 100);
  }

  /** Fade the song out and bring the film music back */
  stopSong(fade = 1.5) {
    const ctx = this.ctx;
    if (!ctx || !this.songOn) return;
    this.songOn = false;
    const now = ctx.currentTime;
    const sg = this.songGain!.gain;
    sg.cancelScheduledValues(now);
    sg.setValueAtTime(sg.value, now);
    sg.linearRampToValueAtTime(0, now + fade);
    const song = this.song;
    window.setTimeout(() => !this.songOn && song?.pause(), fade * 1000 + 100);
    // Bring the film music back where it was
    void this.el?.play().catch(() => undefined);
    this.synth?.start();
    this.setMusicLevel(this.musicLevel, fade);
  }

  pause() {
    this.el?.pause();
    if (this.songOn) this.song?.pause();
    void this.ctx?.suspend();
  }

  resume() {
    void this.ctx?.resume();
    // A finished song stays finished, play() would start it over
    if (this.songOn) {
      if (this.song && !this.song.ended) void this.song.play().catch(() => undefined);
    }
    else void this.el?.play().catch(() => undefined);
  }

  restart() {
    this.stopSong(0.8);
    if (this.el) {
      this.el.currentTime = 0;
      void this.el.play().catch(() => undefined);
    }
    this.synth?.restart();
    this.resume();
  }
}
