import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { config } from '../../config';
import { filmBus } from '../../engine/filmBus';
import { useTimeline } from '../../engine/timeline/TimelineProvider';
import type { SceneProps } from '../scene/types';
import { Envelope } from './Envelope';
import { Finale } from './Finale';
import { FloatingHearts } from './FloatingHearts';
import { Headline } from './Headline';
import { Letter } from './Letter';
import { Memories } from './Memories';

/** bloom → envelope → letter → (one more thing) → photos → end */
type Phase = 'bloom' | 'sealed' | 'reading' | 'signed' | 'memories' | 'finale' | 'end';

const formatDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
};

/** Buttons on the black end screen */
const pillDark =
  'rounded-full border border-honey/30 bg-white/5 px-5 py-2 font-serif text-base italic tracking-wide text-cream/80 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey/60';

const pill =
  'rounded-full border border-[#3A2310]/20 bg-[#FFF8EC]/95 px-5 py-2 shadow-[0_6px_18px_-8px_rgba(58,35,16,0.35)] font-serif text-base italic tracking-wide text-[#3A2310]/80 backdrop-blur-sm transition-colors hover:bg-[#3A2310]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/60';

/** S6, viewer paced. Light blooms into cream, the title, the envelope, the letter, her photos */
export function BirthdayScene(_props: SceneProps) {
  const reduced = !!useReducedMotion();
  const { replay } = useTimeline();
  // `?scene=6&finale` opens straight on the closing words, for previewing
  const [phase, setPhase] = useState<Phase>(() => (new URLSearchParams(window.location.search).has('finale') ? 'finale' : 'bloom'));
  const reading = phase === 'reading' || phase === 'signed';
  const photos = config.optionalPhotos;
  const inMemories = phase === 'memories' || phase === 'finale' || phase === 'end';
  const finale = phase === 'finale' || phase === 'end';

  useEffect(() => {
    const id = window.setTimeout(() => setPhase((p) => (p === 'bloom' ? 'sealed' : p)), reduced ? 900 : 3400);
    return () => clearTimeout(id);
  }, [reduced]);

  const onOpened = useCallback(() => setPhase('reading'), []);
  const onSigned = useCallback(() => setPhase('signed'), []);
  const onMemoriesDone = useCallback(() => setPhase('finale'), []);
  const onFinaleDone = useCallback(() => setPhase('end'), []);

  const button = (label: string, onClick: () => void, dark = false) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={dark ? pillDark : pill}
    >
      {label}
    </button>
  );

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#2B1A0C]">
      {/* The warm light from the held hands blooms open into cream */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[190vmax] w-[190vmax] rounded-full"
        initial={{ scale: reduced ? 1 : 0.04, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: reduced ? 1 : 3.4, ease: [0.33, 0, 0.15, 1] }}
        style={{ x: '-50%', y: '-50%', background: 'radial-gradient(closest-side, #FFF9EF, #FFF4E0 50%, #F7E2BC 80%, #EBC68C)' }}
      />

      {/* Hearts drift behind the letter and the photos, until the screen fades to black */}
      <AnimatePresence>{(reading || phase === 'memories' || phase === 'finale') && <FloatingHearts key="hearts" />}</AnimatePresence>

      <AnimatePresence>
        {!inMemories && (
          <motion.div
            key="letter-stage"
            className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-[clamp(0.75rem,2.5dvh,1.75rem)] px-4 pb-[9dvh] pt-[4dvh]"
            exit={{ opacity: 0, transition: { duration: 1 } }}
          >
            <motion.header layout className="relative z-10" transition={{ layout: { duration: 1.2 } }}>
              <Headline greeting={config.headline.greeting} name={config.headline.name} compact={reading} reduced={reduced} />
              {!reading && formatDate(config.birthdayDate) && (
                <motion.p
                  className="mt-3 text-center font-serif text-sm uppercase tracking-[0.35em] text-[#7A5A3A]/70 sm:text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3.4, duration: 1.4 }}
                >
                  {formatDate(config.birthdayDate)}
                </motion.p>
              )}
            </motion.header>

            <AnimatePresence mode="wait">
              {phase === 'sealed' && (
                <motion.div
                  key="envelope"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40, transition: { duration: 0.7 } }}
                  transition={{ duration: 1.2, ease: [0.22, 0.61, 0.25, 1] }}
                >
                  <Envelope
                    recipient={config.recipientName}
                    sealInitials={config.seal.initials}
                    sealReveal={config.seal.reveal}
                    reduced={reduced}
                    onOpened={onOpened}
                  />
                </motion.div>
              )}
              {reading && (
                <motion.div key="letter" className="flex flex-col items-center gap-6">
                  <Letter
                    text={config.letterText}
                    signoff={config.letterSignoff}
                    sender={config.senderName}
                    reduced={reduced}
                    onDone={onSigned}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {phase === 'signed' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4 }}>
                  {photos.length ? button('one more thing →', () => {
                        // Emitted inside the tap, so the browser lets the song start
                        filmBus.emit({ type: 'memories' });
                        setPhase('memories');
                      }) : button('watch again ↺', replay)}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {inMemories && (
        <motion.div className="absolute inset-0 z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }}>
          <Memories photos={photos} reduced={reduced} onDone={onMemoriesDone} />
        </motion.div>
      )}

      {finale && <Finale wishes={config.finale.wishes} tamil={config.finale.tamil} reduced={reduced} onDone={onFinaleDone} />}

      <AnimatePresence>
        {phase === 'end' && (
          <motion.div
            className="absolute inset-x-0 bottom-[max(92px,11dvh)] z-[200] flex justify-center gap-3 px-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 2 }}
          >
            {button('read the letter again', () => setPhase('reading'), true)}
            {button('watch again ↺', replay, true)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
