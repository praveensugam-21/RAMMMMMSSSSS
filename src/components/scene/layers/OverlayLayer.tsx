import { motion, type MotionValue } from 'framer-motion';
import { useResolvedImage } from '../../../engine/assets/imageCache';
import type { Orientation, OverlayLayer } from '../../../film/types';
import { useProp } from '../../../hooks/useSceneTime';
import { Photo } from '../../media/Photo';

interface Props {
  layer: OverlayLayer;
  time: MotionValue<number>;
  orientation: Orientation;
}

/** Optional light, rim or bokeh plate, blended over the scene. Silent when missing */
export function OverlayLayerView({ layer, time, orientation }: Props) {
  const { src, status } = useResolvedImage(layer.asset, orientation);
  const opacity = useProp(time, layer.opacity, 1);
  if (status !== 'ready') return null;
  return (
    <motion.div className="pointer-events-none absolute inset-0" style={{ opacity, mixBlendMode: layer.blend ?? 'screen' }}>
      <Photo src={src} alt="" className="h-full w-full object-cover" />
    </motion.div>
  );
}
