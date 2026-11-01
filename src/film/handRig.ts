import type { Orientation, Who } from './types';

/**
 * The continuity rig, it describes the cutout images so both hands sit
 * in the same place, at the same scale, in every scene
 * Keep these numbers in sync with ASSETS.md
 */
export interface HandRig {
  /** Image width / height of every cutout for this hand */
  aspect: number;
  /** Fingertip point inside the image, 0–1 */
  tip: { x: number; y: number };
  /** Rendered width in vw */
  width: Record<Orientation, number>;
  /** Where the fingertip travels, reach 0 → reach 1, in [vw, vh] */
  path: Record<Orientation, { from: [number, number]; to: [number, number]; rotate: number }>;
  /** Bracelet box inside the image, 0–1, for the light glint */
  bracelet?: { x: number; y: number; w: number; h: number };
}

export const HAND_RIG: Record<Who, HandRig> = {
  boy: {
    aspect: 2,
    tip: { x: 0.96, y: 0.42 },
    width: { landscape: 40, portrait: 104 },
    path: {
      landscape: { from: [10, 51], to: [49.85, 50], rotate: 0 },
      // His hand enters from the bottom left on phones
      portrait: { from: [16, 76], to: [49.85, 50.1], rotate: -58 },
    },
  },
  girl: {
    aspect: 2,
    tip: { x: 0.04, y: 0.42 },
    width: { landscape: 38, portrait: 98 },
    path: {
      landscape: { from: [88, 49], to: [50.15, 50], rotate: 0 },
      // Hers enters from the top right on phones
      portrait: { from: [84, 24], to: [50.15, 49.9], rotate: -58 },
    },
    bracelet: { x: 0.71, y: 0.364, w: 0.04, h: 0.2 },
  },
};
