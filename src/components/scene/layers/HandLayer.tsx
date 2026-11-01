import { motion, useTransform, type MotionValue } from 'framer-motion';
import { useImageStatus } from '../../../engine/assets/imageCache';
import { HAND_RIG } from '../../../film/handRig';
import { sample } from '../../../film/keyframes';
import type { HandLayer, Orientation } from '../../../film/types';
import { useProp } from '../../../hooks/useSceneTime';
import { Photo } from '../../media/Photo';
import { Silhouette } from '../../media/Silhouette';
import { BraceletGlint } from './BraceletGlint';

interface Props {
  layer: HandLayer;
  time: MotionValue<number>;
  orientation: Orientation;
  /** 1 = visible, fades to 0 when the touch sequence takes over */
  handoff: MotionValue<number>;
}

/**
 * One transparent hand cutout
 * The outer element sits exactly on the fingertip, so rotation and scale
 * pivot there, and the image is offset so its fingertip lands on that point
 */
export function HandLayerView({ layer, time, orientation, handoff }: Props) {
  const rig = HAND_RIG[layer.who];
  const path = rig.path[orientation];
  const width = rig.width[orientation];
  const height = width / rig.aspect;
  const { pose } = layer;

  const x = useTransform(time, (t) => {
    const r = sample(pose.reach, t);
    return `${path.from[0] + (path.to[0] - path.from[0]) * r + sample(pose.dx ?? 0, t)}vw`;
  });
  const y = useTransform(time, (t) => {
    const r = sample(pose.reach, t);
    return `${path.from[1] + (path.to[1] - path.from[1]) * r + sample(pose.dy ?? 0, t)}vh`;
  });
  const rotate = useTransform(time, (t) => path.rotate + sample(pose.rotate ?? 0, t));
  const scale = useProp(time, pose.scale, 1);
  const baseOpacity = useProp(time, pose.opacity, 1);
  const opacity = useTransform([baseOpacity, handoff], ([a, b]: number[]) => a * b);
  const focus = useProp(time, pose.focus, 0);
  const placeholderOpacity = useTransform(focus, (f) => 1 - f * 0.55);

  const status = useImageStatus(layer.asset.src);

  return (
    <motion.div className="absolute left-0 top-0 will-change-transform" style={{ x, y, rotate, scale, opacity }}>
      <div
        className="absolute"
        style={{
          width: `${width}vw`,
          height: `${height}vw`,
          left: `${-rig.tip.x * width}vw`,
          top: `${-rig.tip.y * height}vw`,
        }}
      >
        {status === 'ready' && (
          <>
            <Photo src={layer.asset.src} alt={layer.asset.alt} sizes={`${width}vw`} className="absolute inset-0 h-full w-full object-contain" />
            {/* Rack focus = crossfade to a pre-blurred copy, so only opacity animates */}
            <motion.div className="absolute inset-0" style={{ opacity: focus }} aria-hidden>
              <Photo src={layer.asset.src} alt="" sizes={`${width}vw`} className="h-full w-full object-contain blur-[7px]" />
            </motion.div>
          </>
        )}
        {status === 'missing' && (
          <motion.div className="absolute inset-0" style={{ opacity: placeholderOpacity }}>
            <Silhouette variant={layer.who} label={layer.asset.src} />
          </motion.div>
        )}
        {layer.glint && rig.bracelet && <BraceletGlint box={rig.bracelet} time={time} {...layer.glint} />}
      </div>
    </motion.div>
  );
}
