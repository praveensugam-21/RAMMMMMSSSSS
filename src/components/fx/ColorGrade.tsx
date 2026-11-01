import { motion, useTransform, type MotionValue } from 'framer-motion';

/** Base tone under everything, crossfades midnight blue → deep amber */
export function BaseTone({ cool, warm, warmth }: { cool: string; warm: string; warmth: MotionValue<number> }) {
  return (
    <>
      <div className="absolute inset-0" style={{ background: `radial-gradient(120% 90% at 50% 50%, ${cool}, #0A0A0C)` }} />
      <motion.div
        className="absolute inset-0"
        style={{ opacity: warmth, background: `radial-gradient(120% 90% at 50% 55%, ${warm}, #0A0A0C)` }}
      />
    </>
  );
}

/**
 * The grade, layered over the photographs
 * Cool: a soft-light wash of dusk blue
 * Warm: amber soft-light plus a low sun glow from upper left, matching the key light
 */
export function ColorGrade({ warmth }: { warmth: MotionValue<number> }) {
  const cool = useTransform(warmth, (w) => (1 - w) * 0.55);
  const warm = useTransform(warmth, (w) => w * 0.6);
  const glow = useTransform(warmth, (w) => w * 0.32);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <motion.div className="absolute inset-0 mix-blend-soft-light" style={{ opacity: cool, background: '#2A3F5F' }} />
      <motion.div className="absolute inset-0 mix-blend-soft-light" style={{ opacity: warm, background: '#E8A33D' }} />
      <motion.div
        className="absolute inset-0 mix-blend-screen"
        style={{ opacity: glow, background: 'radial-gradient(70% 60% at 28% 22%, #F4C77A, transparent 70%)' }}
      />
    </div>
  );
}
