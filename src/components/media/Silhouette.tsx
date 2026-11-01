import { useId } from 'react';
import { config } from '../../config';

/**
 * Glowing hand silhouettes shown while real photographs are missing
 * Drawn in the same 2:1 frame and fingertip position as the rig, so a
 * real cutout drops in exactly where its placeholder was
 */

/** Boy's hand pointing right, fingertip at (960, 250) = rig tip (0.96, 0.5) */
function HandShape() {
  return (
    <>
      <path d="M-40 214 C120 206 250 200 330 190 L330 330 C250 322 120 318 -40 312 Z" />
      <rect x="300" y="176" width="320" height="160" rx="78" />
      <rect x="560" y="226" width="400" height="48" rx="24" />
      <rect x="560" y="268" width="370" height="48" rx="24" transform="rotate(2 560 292)" />
      <rect x="556" y="306" width="318" height="44" rx="22" transform="rotate(4 556 328)" />
      <rect x="544" y="338" width="246" height="38" rx="19" transform="rotate(7 544 357)" />
      <rect x="470" y="182" width="214" height="42" rx="21" transform="rotate(-6 470 203)" />
    </>
  );
}

interface SilhouetteProps {
  variant: 'boy' | 'girl' | 'held';
  label?: string;
}

/** Mirror + slightly finer proportions for her hand, applied around the boy's shape */
const GIRL = 'translate(1000 0) scale(-1 1) translate(0 250) scale(1 0.86) translate(0 -250)';

export function Silhouette({ variant, label }: SilhouetteProps) {
  const id = useId().replace(/:/g, '');
  const tone = variant === 'girl' ? '#F3D6C2' : variant === 'boy' ? '#B4C6E4' : '#F6CF8E';

  // Gradients and masks live in the shape's own (pre-mirror) space, so one
  // definition fades every hand toward its wrist
  const hand = (
    <g mask={`url(#wrist-${id})`}>
      <g fill={tone} fillOpacity="0.05">
        <HandShape />
      </g>
      <g fill="#fff" filter={`url(#contour-${id})`}>
        <HandShape />
      </g>
    </g>
  );
  const bracelet = <ellipse cx="352" cy="262" rx="8" ry="70" fill="none" stroke="#E8A33D" strokeOpacity="0.9" strokeWidth="2.5" />;

  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 1000 500" preserveAspectRatio="none" className="h-full w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id={`fade-${id}`} x1="-40" x2="960" y1="0" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.38" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="0.7" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id={`wrist-${id}`} maskUnits="userSpaceOnUse" x="-100" y="0" width="1200" height="500">
            <rect x="-100" y="0" width="1200" height="500" fill={`url(#fade-${id})`} />
          </mask>
          <linearGradient id={`ends-fade-${id}`} x1="-100" x2="1100" y1="0" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.3" stopColor="#fff" stopOpacity="1" />
            <stop offset="0.7" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id={`ends-${id}`} maskUnits="userSpaceOnUse" x="-100" y="0" width="1200" height="500">
            <rect x="-100" y="0" width="1200" height="500" fill={`url(#ends-fade-${id})`} />
          </mask>
          {/* A thin luminous contour around the union of all shapes */}
          <filter id={`contour-${id}`} x="-10%" y="-30%" width="120%" height="160%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="grown" />
            <feComposite in="grown" in2="SourceAlpha" operator="out" result="ring" />
            <feFlood floodColor={tone} />
            <feComposite in2="ring" operator="in" result="line" />
            <feGaussianBlur in="line" stdDeviation="7" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="glow" />
              <feMergeNode in="line" />
            </feMerge>
          </filter>
        </defs>

        {variant === 'boy' && hand}

        {variant === 'girl' && (
          <g transform={GIRL}>
            {hand}
            {bracelet}
          </g>
        )}

        {variant === 'held' && (
          // Both hands share one contour filter, so the outline is their union, not two overlapping drawings
          <g mask={`url(#ends-${id})`}>
            <g fill={tone} fillOpacity="0.05">
              <g transform="translate(-170 8)">
                <HandShape />
              </g>
              <g transform={`translate(170 -8) ${GIRL}`}>
                <HandShape />
              </g>
            </g>
            <g fill="#fff" filter={`url(#contour-${id})`}>
              <g transform="translate(-170 8)">
                <HandShape />
              </g>
              <g transform={`translate(170 -8) ${GIRL}`}>
                <HandShape />
              </g>
            </g>
            <g transform={`translate(170 -8) ${GIRL}`}>{bracelet}</g>
          </g>
        )}
      </svg>
      {label && <PlaceholderLabel text={label} />}
    </div>
  );
}

/** Strip the deploy base so labels read like the paths in ASSETS.md */
const shortPath = (src: string) => src.replace(import.meta.env.BASE_URL, '').replace(/^\.?\//, '');

export function PlaceholderLabel({ text, corner = false }: { text: string; corner?: boolean }) {
  if (!config.film.showPlaceholderLabels) return null;
  const position = corner ? 'relative' : 'absolute bottom-[22%] left-1/2 -translate-x-1/2';
  return (
    <span
      className={`pointer-events-none z-10 whitespace-nowrap rounded-full border border-white/10 bg-black/30 px-3 py-1 font-mono text-[10px] tracking-wide text-white/45 ${position}`}
    >
      ◌ {shortPath(text)}
    </span>
  );
}
