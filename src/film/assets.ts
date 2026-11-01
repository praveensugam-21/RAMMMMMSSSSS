import type { FrameSequence, ImageAsset } from './types';

/** Resolve a /public-relative path against the deploy base */
export const url = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

const img = (path: string, alt: string, portrait = true): ImageAsset => ({
  src: url(`assets/${path}.webp`),
  portrait: portrait ? url(`assets/${path}-portrait.webp`) : undefined,
  alt,
});

/**
 * One pair of hands for the whole film, so skin, proportions and the bracelet never change
 * A scene can still use its own pose, e.g. boy: img('s3/boy', '...', false)
 */
const HANDS = {
  boy: img('hands/boy', 'His hand, open and waiting', false),
  girl: img('hands/girl', 'Her hand with a thin gold chain bracelet, reaching', false),
};

/**
 * Asset manifest, every file the film looks for
 * Missing files are replaced by glowing placeholders, so the film always plays
 * Full shot list in ASSETS.md
 */
export const ASSETS = {
  s1: {
    plate: img('s1/plate', 'Dark midnight blue haze'),
    boy: HANDS.boy,
    girl: HANDS.girl,
  },
  s2: {
    plate: img('s2/plate', 'Midnight blue with a cool rim light'),
    boy: HANDS.boy,
    girl: HANDS.girl,
    rim: img('s2/rim', 'Cool rim light overlay', false),
  },
  s3: {
    plate: img('s3/plate', 'Midnight blue, focus on the right'),
    boy: HANDS.boy,
    girl: HANDS.girl,
  },
  s4: {
    plate: img('s4/plate', 'Macro background for the fingertips'),
    boy: HANDS.boy,
    girl: HANDS.girl,
  },
  s5: {
    held: img('s5/held', 'Their hands holding each other, sunset backlight, her gold bracelet visible'),
    bokeh: img('s5/bokeh', 'Golden bokeh overlay', false),
  },
} as const;

export const TOUCH_SEQUENCE = {
  base: 'assets/s4/touch/frame_',
  ext: 'webp',
  count: 36,
  pad: 4,
} as const;

export const frameUrl = (seq: Pick<FrameSequence, 'base' | 'ext' | 'pad'>, index: number) =>
  url(`${seq.base}${String(index + 1).padStart(seq.pad, '0')}.${seq.ext}`);
