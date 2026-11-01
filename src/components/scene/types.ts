import type { MotionValue } from 'framer-motion';
import type { SceneSpec } from '../../film/types';

export interface SceneProps {
  scene: SceneSpec;
  /** This scene's own clock in seconds, driven by the timeline */
  time: MotionValue<number>;
}
