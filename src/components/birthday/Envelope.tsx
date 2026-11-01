import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

interface Props {
  recipient: string;
  /** Pressed into the wax, e.g. "RP" */
  sealInitials: string;
  /** Written in handwriting when the seal is tapped */
  sealReveal: string;
  reduced: boolean;
  onOpened: () => void;
}

type State = 'closed' | 'reveal' | 'flap' | 'slide';

const EASE = [0.65, 0, 0.35, 1] as const;

/**
 * A wax-sealed envelope
 * Tap the seal → the name writes itself → the seal lifts away → the flap swings open in 3D → the letter slides up
 */
export function Envelope({ recipient, sealInitials, sealReveal, reduced, onOpened }: Props) {
  const [state, setState] = useState<State>('closed');
  const flapUp = state === 'slide';
  const revealed = state !== 'closed';

  const tapSeal = () => {
    // Opens on the first tap; the name writes itself while the seal glows
    if (state !== 'closed') return;
    setState('reveal');
    // Let the handwriting finish before the envelope opens
    window.setTimeout(() => setState('flap'), reduced ? 400 : 2300);
  };

  return (
    <div className="flex flex-col items-center gap-3 pt-[min(11dvh,96px)]" data-no-advance>
      <div className="relative aspect-[1.6/1] w-[min(84vw,440px)]" style={{ perspective: 1400 }}>
        {/* Back of the envelope */}
        <div className="absolute inset-0 rounded-[4px] bg-[#E6D2AE] shadow-[0_30px_60px_-20px_rgba(58,35,16,0.45),0_8px_20px_-8px_rgba(58,35,16,0.3)]" />

        {/* The letter inside */}
        <motion.div
          className="absolute inset-x-[6%] bottom-[6%] top-[8%] z-10 rounded-[2px] bg-paper px-[8%] pt-[7%] shadow-[0_-2px_10px_rgba(58,35,16,0.12)]"
          animate={{ y: state === 'slide' ? '-50%' : '0%' }}
          transition={{ duration: reduced ? 0.3 : 1.4, ease: EASE }}
          onAnimationComplete={() => state === 'slide' && window.setTimeout(onOpened, reduced ? 100 : 500)}
        >
          <p className="font-hand text-[clamp(1.2rem,3.6vw,1.6rem)] text-[#5A3A22]/80">for {recipient}</p>
          <div className="mt-3 space-y-2.5">
            {[88, 72, 80].map((w, i) => (
              <div key={i} className="h-px bg-[#5A3A22]/15" style={{ width: `${w}%` }} />
            ))}
          </div>
        </motion.div>

        {/* Front pocket with its V-shaped mouth */}
        <div
          className="absolute inset-0 z-20 rounded-[4px]"
          style={{
            clipPath: 'polygon(0 0, 50% 54%, 100% 0, 100% 100%, 0 100%)',
            background: 'linear-gradient(170deg, #F3E3C6 0%, #EFDDBC 60%, #E7D2AD 100%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            clipPath: 'polygon(0 0, 50% 54%, 100% 0, 100% 100%, 0 100%)',
            background:
              'linear-gradient(to top right, transparent 49.6%, rgba(58,35,16,0.08) 50%, transparent 50.6%), linear-gradient(to top left, transparent 49.6%, rgba(58,35,16,0.08) 50%, transparent 50.6%)',
          }}
        />

        {/* The flap, hinged at the top edge */}
        <motion.div
          className="absolute inset-x-0 top-0 h-[56%] origin-top"
          style={{
            zIndex: flapUp ? 5 : 30,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            background: 'linear-gradient(180deg, #EAD6B2, #E2CBA2)',
            transformStyle: 'preserve-3d',
          }}
          animate={{ rotateX: state === 'closed' || state === 'reveal' ? 0 : 180 }}
          transition={{ duration: reduced ? 0.3 : 1.15, ease: EASE, delay: state === 'flap' && !reduced ? 0.35 : 0 }}
          onAnimationComplete={() => state === 'flap' && setState('slide')}
        />

        {/* Wax seal */}
        <AnimatePresence>
          {(state === 'closed' || state === 'reveal') && (
            <motion.button
              type="button"
              aria-label={`Open the letter for ${recipient}`}
              onClick={(e) => {
                e.stopPropagation();
                tapSeal();
              }}
              className="absolute left-1/2 top-[56%] z-40 grid h-[clamp(52px,14vw,68px)] w-[clamp(52px,14vw,68px)] place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-amber/70"
              style={{
                x: '-50%',
                y: '-50%',
                background: 'radial-gradient(circle at 35% 30%, #B83A35, #8A1F1C 55%, #5E1210)',
                boxShadow: '0 4px 10px rgba(60,10,8,0.45), inset 0 -3px 6px rgba(0,0,0,0.35), inset 0 2px 4px rgba(255,190,170,0.35)',
              }}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={
                revealed
                  ? { scale: [1, 1.12, 1], opacity: 1, boxShadow: '0 0 34px 10px rgba(232,163,61,0.55)' }
                  : { scale: 1, opacity: 1 }
              }
              exit={{ scale: 1.25, opacity: 0, transition: { duration: 0.45 } }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
            >
              <span className="font-serif text-[clamp(1.05rem,3.4vw,1.4rem)] font-semibold italic tracking-[-0.04em] text-[#F6C9B9]/90 [text-shadow:0_1px_1px_rgba(0,0,0,0.4)]">
                {sealInitials}
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="relative grid h-[clamp(2.6rem,7vw,3.6rem)] place-items-center">
        <AnimatePresence mode="wait">
          {state === 'closed' ? (
            <motion.p
              key="hint"
              className="font-serif text-sm italic tracking-wide text-[#5A3A22]/70 sm:text-base"
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
            >
              tap the seal
            </motion.p>
          ) : (
            <motion.p
              key="reveal"
              className="whitespace-nowrap font-hand text-[clamp(1.9rem,5.5vw,2.8rem)] font-semibold text-[#8A1F1C]"
              initial={{ opacity: 0, clipPath: 'inset(-30% 100% -30% 0)' }}
              animate={{ opacity: 1, clipPath: 'inset(-30% 0% -30% 0)' }}
              transition={{ duration: reduced ? 0.3 : 1.5, ease: 'easeInOut' }}
            >
              {sealReveal} <span className="font-sans text-[0.7em]">❤️</span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
