import type { Prop } from './keyframes';

export type Orientation = 'landscape' | 'portrait';
export type Who = 'boy' | 'girl';

export interface ImageAsset {
  /** Landscape (2.39:1 composition) source */
  src: string;
  /** Optional vertical crop for phones, falls back to `src` */
  portrait?: string;
  alt: string;
}

/**
 * A hand pose is authored as `reach`, 0 = resting at its edge of frame,
 * 1 = fingertips touching the other hand. The rig maps reach to screen
 * position per orientation, so one animation works on desktop and mobile
 */
export interface HandPose {
  reach: Prop;
  /** Extra offsets in vw / vh, for breathing or a lifted wrist */
  dx?: Prop;
  dy?: Prop;
  /** Degrees, added to the rig's base angle */
  rotate?: Prop;
  scale?: Prop;
  opacity?: Prop;
  /** 0 = sharp, 1 = fully defocused (crossfades to a pre-blurred copy) */
  focus?: Prop;
}

export interface PlateLayer {
  kind: 'plate';
  id: string;
  asset: ImageAsset;
  opacity?: Prop;
  objectPosition?: string;
  /** What to draw if the image is missing */
  placeholder?: 'none' | 'held';
}

export interface HandLayer {
  kind: 'hand';
  id: string;
  who: Who;
  asset: ImageAsset;
  pose: HandPose;
  /** Fade this cutout out when an image sequence takes over */
  handoff?: boolean;
  /** One travelling light glint across the bracelet */
  glint?: { at: number; duration: number };
}

export interface OverlayLayer {
  kind: 'overlay';
  id: string;
  asset: ImageAsset;
  blend?: 'screen' | 'soft-light' | 'overlay' | 'normal';
  opacity?: Prop;
}

export type Layer = PlateLayer | HandLayer | OverlayLayer;

export interface CameraMove {
  scale?: Prop;
  /** Pan in vw / vh */
  x?: Prop;
  y?: Prop;
  /** Transform origin in % of frame */
  origin?: [number, number];
  /** Gentle handheld drift */
  sway?: { amp: number; speed: number };
  /** Slow breathing scale */
  breathe?: { from: number; to: number; period: number };
}

/** Pre-rendered touch / intertwine frames, e.g. s4/touch/frame_0001.webp */
export interface FrameSequence {
  base: string;
  ext: 'webp' | 'avif' | 'jpg' | 'png';
  count: number;
  pad: number;
  /** Scene time where the sequence fades in over the cutouts */
  start: number;
  /** Frame index (0-based) that shows the fingertips meeting */
  contactFrame: number;
  /** Scene time of contact and length of the frozen beat after it */
  contactAt: number;
  freeze: number;
  /** Scene time when the last frame is reached */
  end: number;
}

export interface HoldGate {
  /** The film waits here for a long press */
  gateAt: number;
  /** Once the clock reaches this, the gate opens for good */
  until: number;
  /** Seconds of no interaction before it plays on by itself */
  autoAfter: number;
}

export type Cue =
  | { at: number; type: 'music'; level: number; ramp: number }
  | { at: number; type: 'warmth'; value: number; ramp: number }
  | { at: number; type: 'heartbeat' };

export interface SceneFx {
  /** 0 = midnight blue grade, 1 = amber grade */
  warmth?: Prop;
  haze?: boolean;
  bokeh?: boolean;
  lightLeaks?: boolean;
  bloom?: { at: number };
  particles?: { from: number; density: number };
  letterbox?: boolean;
}

export interface StoryLineSpec {
  text: string;
  at: number;
  stagger?: number;
  placement?: 'bottom' | 'top';
}

export interface SceneSpec {
  id: string;
  title: string;
  kind: 'film' | 'birthday';
  /** Seconds, `null` = viewer paced */
  duration: number | null;
  line?: StoryLineSpec;
  palette: { cool: string; warm: string; haze?: string };
  camera?: CameraMove;
  layers: Layer[];
  sequence?: FrameSequence;
  hold?: HoldGate;
  /** Applied on scene entry, so skipping still lands on the right mood */
  audio: { level: number; warmth: number; ramp: number };
  cues?: Cue[];
  fx?: SceneFx;
  /** Crossfade into this scene, seconds */
  transition?: number;
}
