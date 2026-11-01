import type { ComponentType } from 'react';
import type { SceneSpec } from '../../film/types';
import { BirthdayScene } from '../birthday/BirthdayScene';
import { FilmScene } from './FilmScene';
import type { SceneProps } from './types';

/** Scene kind → renderer. Add a new kind here to introduce a new type of scene */
export const SCENE_COMPONENTS: Record<SceneSpec['kind'], ComponentType<SceneProps>> = {
  film: FilmScene,
  birthday: BirthdayScene,
};
