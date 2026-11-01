import { useEffect, useSyncExternalStore } from 'react';
import { frameUrl } from '../../film/assets';
import type { FrameSequence, ImageAsset, Layer, Orientation, SceneSpec } from '../../film/types';

export type AssetStatus = 'none' | 'loading' | 'ready' | 'missing';

const status = new Map<string, AssetStatus>();
const pending = new Map<string, Promise<boolean>>();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

/** Load and decode an image once, resolves false when the file is missing */
export function probe(src: string): Promise<boolean> {
  const existing = pending.get(src);
  if (existing) return existing;
  status.set(src, 'loading');
  const promise = new Promise<boolean>((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      const decoded = img.decode ? img.decode().catch(() => undefined) : Promise.resolve();
      decoded.then(() => {
        status.set(src, 'ready');
        notify();
        resolve(true);
      });
    };
    img.onerror = () => {
      status.set(src, 'missing');
      notify();
      resolve(false);
    };
    img.src = src;
  });
  pending.set(src, promise);
  return promise;
}

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

export function useImageStatus(src?: string): AssetStatus {
  const value = useSyncExternalStore(subscribe, () => (src ? status.get(src) ?? 'loading' : 'none'));
  useEffect(() => {
    if (src) void probe(src);
  }, [src]);
  return value;
}

/** Picks the portrait crop on phones when it exists, otherwise the landscape image */
export function useResolvedImage(asset: ImageAsset, orientation: Orientation): { src: string; status: AssetStatus } {
  const wantsPortrait = orientation === 'portrait' && !!asset.portrait;
  const portraitStatus = useImageStatus(wantsPortrait ? asset.portrait : undefined);
  const landscapeStatus = useImageStatus(asset.src);
  if (wantsPortrait && portraitStatus === 'ready') return { src: asset.portrait!, status: 'ready' };
  if (wantsPortrait && portraitStatus === 'loading') return { src: asset.portrait!, status: 'loading' };
  return { src: asset.src, status: landscapeStatus };
}

// ── Image sequences ───────────────────────────────────────────

const sequences = new Map<string, Promise<HTMLImageElement[] | null>>();

/** Loads every frame of a sequence, null when the first frame is missing */
export function loadSequence(seq: FrameSequence): Promise<HTMLImageElement[] | null> {
  const key = `${seq.base}.${seq.ext}`;
  const existing = sequences.get(key);
  if (existing) return existing;
  const promise = probe(frameUrl(seq, 0)).then((ok) => {
    if (!ok) return null;
    const frames = Array.from({ length: seq.count }, (_, i) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = frameUrl(seq, i);
      return img;
    });
    return Promise.all(frames.map((f) => (f.decode ? f.decode().catch(() => undefined) : undefined))).then(() => frames);
  });
  sequences.set(key, promise);
  return promise;
}

// ── Scene preloading ──────────────────────────────────────────

const layerSources = (layer: Layer) => [layer.asset.src, layer.asset.portrait].filter(Boolean) as string[];

/** Warm the cache for a scene, called for the next scene while the current one plays */
export function preloadScene(scene?: SceneSpec) {
  if (!scene) return;
  scene.layers.flatMap(layerSources).forEach((src) => void probe(src));
  if (scene.sequence) void loadSequence(scene.sequence);
}
