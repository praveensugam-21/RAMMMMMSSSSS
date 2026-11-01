import { useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'framer-motion';
import { clamp01 } from '../../film/keyframes';
import type { Layer, Orientation } from '../../film/types';
import { useOrientation } from '../../hooks/useOrientation';
import { useProp, useTimeReached } from '../../hooks/useSceneTime';
import { Bokeh, Haze, LightLeaks } from '../fx/Atmosphere';
import { Bloom } from '../fx/Bloom';
import { BaseTone, ColorGrade } from '../fx/ColorGrade';
import { Particles } from '../fx/Particles';
import { Camera } from './Camera';
import { HoldToTouch } from './HoldToTouch';
import { MissingAssets } from './MissingAssets';
import { HandLayerView } from './layers/HandLayer';
import { OverlayLayerView } from './layers/OverlayLayer';
import { PlateLayerView } from './layers/PlateLayer';
import { HANDOFF, SequenceLayerView, useSequence } from './layers/SequenceLayer';
import { StoryLine } from './StoryLine';
import type { SceneProps } from './types';

/**
 * The generic scene renderer, everything it draws comes from the scene's config
 * Stack, back to front:
 *   base tone → haze → camera[plate, hands, overlays] → touch sequence →
 *   grade → bokeh → light leaks → bloom → particles → story line → hold UI
 */
export function FilmScene({ scene, time }: SceneProps) {
  const reduced = !!useReducedMotion();
  const orientation = useOrientation();
  const fx = scene.fx ?? {};
  const warmth = useProp(time, fx.warmth, 0);

  const seq = scene.sequence;
  const frames = useSequence(seq);
  const seqReady = !!frames && !!seq;
  const handoff = useTransform(time, (t) => (seqReady ? 1 - clamp01((t - (seq.start - HANDOFF)) / HANDOFF) : 1));

  const particlesOn = useTimeReached(time, fx.particles?.from);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <BaseTone cool={scene.palette.cool} warm={scene.palette.warm} warmth={warmth} />
      {fx.haze && <Haze color={scene.palette.haze ?? '#2A3F5F'} />}

      <Camera move={scene.camera} time={time} reduced={reduced}>
        {scene.layers.map((layer) => (
          <LayerView key={layer.id} layer={layer} time={time} orientation={orientation} handoff={handoff} />
        ))}
      </Camera>

      {seq && <SequenceLayerView seq={seq} frames={frames} time={time} />}

      <ColorGrade warmth={warmth} />
      {fx.bokeh && <Bokeh warmth={warmth} />}
      {fx.lightLeaks && <LightLeaks warmth={warmth} />}
      {fx.bloom && <Bloom time={time} at={fx.bloom.at} />}
      {fx.particles && <Particles active={particlesOn} density={fx.particles.density} reduced={reduced} />}

      {scene.line && <StoryLine line={scene.line} time={time} end={scene.duration} reduced={reduced} />}
      {scene.hold && <HoldToTouch hold={scene.hold} time={time} />}
      <MissingAssets scene={scene} frames={frames} />
    </div>
  );
}

interface LayerViewProps {
  layer: Layer;
  time: MotionValue<number>;
  orientation: Orientation;
  handoff: MotionValue<number>;
}

function LayerView({ layer, time, orientation, handoff }: LayerViewProps) {
  const solid = useMotionValue(1);
  switch (layer.kind) {
    case 'plate':
      return <PlateLayerView layer={layer} time={time} orientation={orientation} />;
    case 'hand':
      return <HandLayerView layer={layer} time={time} orientation={orientation} handoff={layer.handoff ? handoff : solid} />;
    case 'overlay':
      return <OverlayLayerView layer={layer} time={time} orientation={orientation} />;
  }
}
