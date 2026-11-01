import { useImageStatus } from '../../engine/assets/imageCache';
import { frameUrl } from '../../film/assets';
import type { SceneSpec } from '../../film/types';
import { PlaceholderLabel } from '../media/Silhouette';
import type { SequenceFrames } from './layers/SequenceLayer';

/**
 * Placeholder mode, a quiet list of the background files this scene expected
 * Sits outside the camera so push-ins never crop it. Hands label themselves
 */
export function MissingAssets({ scene, frames }: { scene: SceneSpec; frames: SequenceFrames }) {
  const plates = scene.layers.filter((l) => l.kind === 'plate' && l.placeholder !== 'held');
  const seq = scene.sequence;
  return (
    <div className="pointer-events-none absolute left-4 top-[calc(var(--bar)+12px)] z-20 flex flex-col items-start gap-1.5">
      {plates.map((l) => (
        <MissingLabel key={l.id} src={l.asset.src} />
      ))}
      {seq && frames === null && (
        <PlaceholderLabel corner text={`${frameUrl(seq, 0)} … ${String(seq.count).padStart(seq.pad, '0')} (touch sequence)`} />
      )}
    </div>
  );
}

function MissingLabel({ src }: { src: string }) {
  return useImageStatus(src) === 'missing' ? <PlaceholderLabel corner text={src} /> : null;
}
