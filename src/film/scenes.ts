import { config } from '../config';
import { ASSETS, TOUCH_SEQUENCE } from './assets';
import { keys } from './keyframes';
import type { SceneSpec } from './types';

/**
 * ─────────────────────────────────────────────────────────────
 *  THE SCRIPT, one entry per scene, read top to bottom like a shot list
 *  All times are seconds from the start of that scene
 * ─────────────────────────────────────────────────────────────
 */

const MIDNIGHT = { cool: '#0B1426', warm: '#2B1A0C', haze: '#2A3F5F' };
const SUNSET = { cool: '#0B1426', warm: '#3A2310', haze: '#E8A33D' };

/** The touch beat, the emotional centre of the film */
const CONTACT = 6.0;
const FREEZE = 1.2;
const LANDED = CONTACT + FREEZE;

const [L1, L2, L3, L4, L5] = config.storyLines;

export const SCENES: SceneSpec[] = [
  // ── S1 The Distance ─────────────────────────────────────────
  {
    id: 'distance',
    title: 'The Distance',
    kind: 'film',
    duration: 10,
    line: { text: L1, at: 1.4 },
    palette: MIDNIGHT,
    camera: { scale: keys([0, 10], [1, 1.06], 'linear') },
    layers: [
      { kind: 'plate', id: 'plate', asset: ASSETS.s1.plate },
      {
        kind: 'hand',
        id: 'boy',
        who: 'boy',
        asset: ASSETS.s1.boy,
        pose: { reach: keys([0, 10], [0.02, 0.1]), rotate: keys([0, 10], [-2, -1]) },
      },
      {
        kind: 'hand',
        id: 'girl',
        who: 'girl',
        asset: ASSETS.s1.girl,
        // Slightly withdrawn, behind her own starting mark
        pose: { reach: keys([0, 10], [-0.06, -0.03]), rotate: 3, dy: keys([0, 5, 10], [0, -0.4, 0], 'breath') },
      },
    ],
    audio: { level: 0.6, warmth: 0, ramp: 4 },
    fx: { warmth: 0, haze: true },
    transition: 1.6,
  },

  // ── S2 The Waiting ──────────────────────────────────────────
  {
    id: 'waiting',
    title: 'The Waiting',
    kind: 'film',
    duration: 12,
    line: { text: L2, at: 1.2, stagger: 0.16 },
    palette: MIDNIGHT,
    // A slow dolly toward his hand
    camera: { scale: keys([0, 12], [1.04, 1.12], 'linear'), origin: [32, 52] },
    layers: [
      { kind: 'plate', id: 'plate', asset: ASSETS.s2.plate },
      {
        kind: 'hand',
        id: 'boy',
        who: 'boy',
        asset: ASSETS.s2.boy,
        pose: {
          reach: keys([0, 1.5, 11, 12], [0.1, 0.1, 0.48, 0.5], ['linear', 'patient', 'settle']),
          rotate: keys([0, 12], [-1, 0]),
        },
      },
      {
        kind: 'hand',
        id: 'girl',
        who: 'girl',
        asset: ASSETS.s2.girl,
        pose: { reach: -0.03, rotate: 3, focus: 0.55, dy: keys([0, 6, 12], [0, -0.5, 0], 'breath') },
      },
      { kind: 'overlay', id: 'rim', asset: ASSETS.s2.rim, blend: 'screen', opacity: 0.8 },
    ],
    audio: { level: 0.7, warmth: 0.1, ramp: 3 },
    fx: { warmth: 0, haze: true },
  },

  // ── S3 The Hesitation ───────────────────────────────────────
  {
    id: 'hesitation',
    title: 'The Hesitation',
    kind: 'film',
    duration: 14,
    line: { text: L3, at: 1.6, stagger: 0.17 },
    palette: MIDNIGHT,
    camera: { scale: keys([0, 14], [1.06, 1.1], 'linear'), origin: [64, 50] },
    layers: [
      { kind: 'plate', id: 'plate', asset: ASSETS.s3.plate },
      {
        kind: 'hand',
        id: 'boy',
        who: 'boy',
        asset: ASSETS.s3.boy,
        // Rack focus away from him
        pose: { reach: 0.5, focus: keys([0, 2.2], [0, 0.75]), dy: keys([0, 7, 14], [0, 0.4, 0], 'breath') },
      },
      {
        kind: 'hand',
        id: 'girl',
        who: 'girl',
        asset: ASSETS.s3.girl,
        pose: {
          // forward → pause → pull back ~30% → hold a breath → try again
          reach: keys(
            [0, 0.6, 4.4, 5.6, 7.0, 8.6, 13.2, 14],
            [-0.03, -0.03, 0.42, 0.42, 0.285, 0.285, 0.6, 0.6],
            ['linear', 'hesitant', 'linear', 'gentle', 'linear', 'patient', 'linear'],
          ),
          rotate: keys([0, 4.4, 7, 13.2], [3, 1, 2, 0]),
          focus: keys([0, 2.2], [0.55, 0]),
        },
        glint: { at: 11.0, duration: 1.6 },
      },
    ],
    audio: { level: 0.5, warmth: 0.15, ramp: 3 },
    fx: { warmth: 0, haze: true },
  },

  // ── S4 The First Touch ──────────────────────────────────────
  {
    id: 'touch',
    title: 'The First Touch',
    kind: 'film',
    duration: 16,
    line: { text: L4, at: 0.8, stagger: 0.15 },
    palette: MIDNIGHT,
    // Push into a macro on the fingertips
    camera: { scale: keys([0, CONTACT, 16], [1.05, 1.65, 1.72], ['settle', 'linear']), origin: [50, 50] },
    layers: [
      { kind: 'plate', id: 'plate', asset: ASSETS.s4.plate },
      {
        kind: 'hand',
        id: 'boy',
        who: 'boy',
        asset: ASSETS.s4.boy,
        handoff: true,
        pose: { reach: keys([0, 0.4, CONTACT, LANDED, 10], [0.5, 0.5, 1, 1, 1.03], ['linear', 'settle', 'linear', 'gentle']) },
      },
      {
        kind: 'hand',
        id: 'girl',
        who: 'girl',
        asset: ASSETS.s4.girl,
        handoff: true,
        pose: { reach: keys([0, 0.4, CONTACT, LANDED, 10], [0.6, 0.6, 1, 1, 1.03], ['linear', 'settle', 'linear', 'gentle']) },
      },
    ],
    sequence: {
      ...TOUCH_SEQUENCE,
      // Frame 1 is the cutouts' own contact composition, so the hand-off is seamless
      start: CONTACT,
      contactFrame: 0,
      contactAt: CONTACT,
      freeze: FREEZE,
      end: 11.8,
    },
    hold: config.film.holdToTouch ? { gateAt: 3.4, until: CONTACT, autoAfter: config.film.holdAutoAfter } : undefined,
    audio: { level: 0.45, warmth: 0.15, ramp: 2 },
    cues: [
      // Music thins to near silence just before contact
      { at: 4.3, type: 'music', level: 0.03, ramp: 1.6 },
      // The heartbeat lands exactly on contact, inside the frozen silence
      { at: CONTACT, type: 'heartbeat' },
      // Then the music swells back, warmer
      { at: LANDED, type: 'music', level: 0.9, ramp: 3.5 },
      { at: LANDED, type: 'warmth', value: 1, ramp: 4 },
    ],
    fx: {
      warmth: keys([0, CONTACT, CONTACT + 1.5], [0, 0, 1], ['linear', 'gentle']),
      haze: true,
      lightLeaks: true,
      bloom: { at: CONTACT },
      particles: { from: CONTACT, density: 1 },
    },
  },

  // ── S5 The Birth of Happiness ───────────────────────────────
  {
    id: 'happiness',
    title: 'The Birth of Happiness',
    kind: 'film',
    duration: 14,
    line: { text: L5, at: 1.2, stagger: 0.16 },
    palette: SUNSET,
    camera: { sway: { amp: 0.35, speed: 0.22 }, breathe: { from: 1, to: 1.02, period: 5.5 } },
    layers: [
      { kind: 'plate', id: 'held', asset: ASSETS.s5.held, placeholder: 'held' },
      { kind: 'overlay', id: 'bokeh', asset: ASSETS.s5.bokeh, blend: 'screen', opacity: 0.9 },
    ],
    audio: { level: 0.9, warmth: 1, ramp: 2 },
    fx: { warmth: 1, bokeh: true, lightLeaks: true, particles: { from: 0, density: 0.35 } },
    transition: 2,
  },

  // ── S6 The Birthday Surprise, viewer paced ──────────────────
  {
    id: 'birthday',
    title: 'Happy Birthday',
    kind: 'birthday',
    duration: null,
    palette: { cool: '#FFF4E0', warm: '#FFF4E0' },
    layers: [],
    audio: { level: 0.7, warmth: 1, ramp: 3 },
    fx: { warmth: 1, letterbox: false },
    transition: 2.4,
  },
];
