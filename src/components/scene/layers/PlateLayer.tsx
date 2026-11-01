import { motion, type MotionValue } from 'framer-motion';
import { useResolvedImage } from '../../../engine/assets/imageCache';
import type { Orientation, PlateLayer } from '../../../film/types';
import { useProp } from '../../../hooks/useSceneTime';
import { Photo } from '../../media/Photo';
import { Silhouette } from '../../media/Silhouette';

interface Props {
  layer: PlateLayer;
  time: MotionValue<number>;
  orientation: Orientation;
}

/** Full-bleed background photograph, with a portrait crop on phones */
export function PlateLayerView({ layer, time, orientation }: Props) {
  const { src, status } = useResolvedImage(layer.asset, orientation);
  const opacity = useProp(time, layer.opacity, 1);

  if (status === 'ready') {
    return (
      <motion.div className="absolute inset-0" style={{ opacity }}>
        <Photo
          src={src}
          alt={layer.asset.alt}
          className="h-full w-full object-cover"
          style={{ objectPosition: layer.objectPosition ?? 'center' }}
        />
      </motion.div>
    );
  }

  if (status !== 'missing') return null;

  if (layer.placeholder === 'held') {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative aspect-[2/1] w-[74vw] max-w-[1100px] tall:w-[150vw] tall:-rotate-[58deg]">
          <Silhouette variant="held" label={layer.asset.src} />
        </div>
      </div>
    );
  }

  return null;
}
