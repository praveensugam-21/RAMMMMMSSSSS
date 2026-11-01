import type { CSSProperties } from 'react';
import { config } from '../../config';

const withExt = (src: string, ext: string, width?: number) =>
  src.replace(/\.(webp|avif|jpe?g|png)$/i, `${width ? `-${width}` : ''}.${ext}`);

const srcSet = (src: string, ext: string) =>
  config.media.widths.length
    ? config.media.widths.map((w) => `${withExt(src, ext, w)} ${w}w`).join(', ')
    : withExt(src, ext);

interface PhotoProps {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  sizes?: string;
}

/** <picture> with optional AVIF and responsive widths, controlled by config.media */
export function Photo({ src, alt, className, style, sizes = '100vw' }: PhotoProps) {
  return (
    <picture className="contents">
      {config.media.avif && <source type="image/avif" srcSet={srcSet(src, 'avif')} sizes={sizes} />}
      <source type="image/webp" srcSet={srcSet(src, 'webp')} sizes={sizes} />
      <img src={src} alt={alt} className={className} style={style} decoding="async" draggable={false} />
    </picture>
  );
}
