/**
 * Fallbacks so the film still has sound before real audio files are added
 * A soft generative piano-pad and a synthesized double heartbeat
 */

const COOL_CHORDS = [
  [220.0, 261.63, 329.63, 493.88],
  [174.61, 220.0, 261.63, 392.0],
  [196.0, 246.94, 293.66, 440.0],
  [164.81, 196.0, 246.94, 392.0],
];

const WARM_CHORDS = [
  [174.61, 220.0, 261.63, 329.63, 392.0],
  [130.81, 196.0, 246.94, 329.63],
  [146.83, 220.0, 261.63, 349.23],
  [196.0, 246.94, 293.66, 392.0],
];

const CHORD_SECONDS = 7;

function makeReverb(ctx: AudioContext, seconds = 3.2) {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * seconds);
  const impulse = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.6);
  }
  const node = ctx.createConvolver();
  node.buffer = impulse;
  return node;
}

export class AmbientSynth {
  private bus: GainNode;
  private timer: number | null = null;
  private step = 0;
  private warm = false;

  constructor(private ctx: AudioContext, out: AudioNode) {
    this.bus = ctx.createGain();
    this.bus.gain.value = 0.9;
    const reverb = makeReverb(ctx);
    const wet = ctx.createGain();
    wet.gain.value = 0.45;
    this.bus.connect(out);
    this.bus.connect(reverb);
    reverb.connect(wet);
    wet.connect(out);
  }

  start() {
    if (this.timer !== null) return;
    this.play();
    this.timer = window.setInterval(() => this.play(), CHORD_SECONDS * 1000);
  }

  stop() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
  }

  restart() {
    this.stop();
    this.step = 0;
    this.warm = false;
    this.start();
  }

  setWarm(warm: boolean) {
    this.warm = warm;
  }

  private play() {
    // Skip while suspended, otherwise chords pile up and burst on resume
    if (this.ctx.state !== 'running') return;
    const chords = this.warm ? WARM_CHORDS : COOL_CHORDS;
    const chord = chords[this.step % chords.length];
    const now = this.ctx.currentTime;
    chord.forEach((f) => this.pad(f, now));
    const melody = chord[1 + Math.floor(Math.random() * (chord.length - 1))] * 2;
    this.bell(melody, now + 1.2 + Math.random() * 2.5);
    if (Math.random() > 0.4) this.bell(chord[chord.length - 1] * 2, now + 4.2 + Math.random() * 1.5);
    this.step++;
  }

  private pad(freq: number, at: number) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(0.045, at + 2.6);
    g.gain.setValueAtTime(0.045, at + CHORD_SECONDS - 0.5);
    g.gain.linearRampToValueAtTime(0, at + CHORD_SECONDS + 2.8);
    g.connect(this.bus);
    [
      { type: 'sine' as const, detune: 0 },
      { type: 'triangle' as const, detune: 5 },
    ].forEach(({ type, detune }) => {
      const osc = this.ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = detune;
      osc.connect(g);
      osc.start(at);
      osc.stop(at + CHORD_SECONDS + 3);
    });
  }

  /** A soft, piano-like note */
  private bell(freq: number, at: number) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(0.06, at + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 3.2);
    g.connect(this.bus);
    [1, 2.01].forEach((mult, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq * mult;
      const partial = this.ctx.createGain();
      partial.gain.value = i === 0 ? 1 : 0.18;
      osc.connect(partial);
      partial.connect(g);
      osc.start(at);
      osc.stop(at + 3.3);
    });
  }
}

/** Lub-dub, two low thumps with a falling pitch */
export function synthHeartbeat(ctx: AudioContext, out: AudioNode) {
  const now = ctx.currentTime + 0.01;
  [
    { at: 0, gain: 0.9 },
    { at: 0.27, gain: 0.6 },
  ].forEach(({ at, gain }) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 160;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(68, now + at);
    osc.frequency.exponentialRampToValueAtTime(38, now + at + 0.16);
    g.gain.setValueAtTime(0, now + at);
    g.gain.linearRampToValueAtTime(gain, now + at + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, now + at + 0.32);
    osc.connect(lp);
    lp.connect(g);
    g.connect(out);
    osc.start(now + at);
    osc.stop(now + at + 0.4);
  });
}
