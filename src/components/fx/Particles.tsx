import { useEffect, useRef } from 'react';

interface Props {
  active: boolean;
  /** 1 = the full touch moment, lower for ambience */
  density?: number;
  reduced?: boolean;
}

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  age: number;
  size: number;
  phase: number;
}

/** Pre-rendered glow sprite, far cheaper than shadowBlur per particle */
function makeSprite() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,246,220,1)');
  grad.addColorStop(0.25, 'rgba(244,199,122,0.85)');
  grad.addColorStop(0.6, 'rgba(232,163,61,0.18)');
  grad.addColorStop(1, 'rgba(232,163,61,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
}

/** Tiny golden motes rising from where the hands meet */
export function Particles({ active, density = 1, reduced = false }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;
    const sprite = makeSprite();
    const motes: Mote[] = [];
    let dpr = 1;
    let raf = 0;
    let last = performance.now();
    let carry = 0;
    let burst = false;
    const rate = (reduced ? 6 : 34) * density;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.round(el.clientWidth * dpr);
      el.height = Math.round(el.clientHeight * dpr);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    const spawn = () => {
      const w = el.width;
      const h = el.height;
      const spread = (Math.random() + Math.random() + Math.random() - 1.5) * 0.42;
      motes.push({
        x: w * (0.5 + spread * 0.55),
        y: h * (0.52 + (Math.random() - 0.5) * 0.18),
        vx: (Math.random() - 0.5) * 10 * dpr,
        vy: -(10 + Math.random() * 30) * dpr,
        life: 3.5 + Math.random() * 3.5,
        age: 0,
        size: (2 + Math.random() * 5) * dpr,
        phase: Math.random() * Math.PI * 2,
      });
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (activeRef.current) {
        if (!burst) {
          burst = true;
          for (let i = 0; i < 50 * density; i++) spawn();
        }
        carry += rate * dt;
        while (carry >= 1) {
          spawn();
          carry -= 1;
        }
      }
      ctx.clearRect(0, 0, el.width, el.height);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = motes.length - 1; i >= 0; i--) {
        const m = motes[i];
        m.age += dt;
        if (m.age >= m.life) {
          motes.splice(i, 1);
          continue;
        }
        m.x += (m.vx + Math.sin(m.phase + m.age * 1.3) * 6 * dpr) * dt;
        m.y += m.vy * dt;
        const k = m.age / m.life;
        const fade = Math.min(1, k * 5) * (1 - k);
        ctx.globalAlpha = fade * (0.6 + 0.4 * Math.sin(m.phase + m.age * 4));
        ctx.drawImage(sprite, m.x - m.size, m.y - m.size, m.size * 2, m.size * 2);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [density, reduced]);

  return <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}
