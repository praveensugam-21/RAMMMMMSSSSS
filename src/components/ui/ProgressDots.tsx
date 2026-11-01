import { motion } from 'framer-motion';
import { config } from '../../config';
import { useTimeline } from '../../engine/timeline/TimelineProvider';

/** Six dots, one per scene, each one jumps to its scene */
export function ProgressDots({ light, hidden }: { light: boolean; hidden: boolean }) {
  const { scenes, index, goTo } = useTimeline();
  return (
    <motion.nav
      aria-label="Scenes"
      className="fixed inset-x-0 bottom-[max(14px,calc(var(--bar)/2-8px))] z-50 flex justify-center"
      animate={{ opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.8 }}
    >
      <ol className="flex items-center gap-1">
        {scenes.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo(i);
              }}
              aria-label={`Scene ${i + 1}, ${s.title}`}
              aria-current={i === index ? 'step' : undefined}
              className="grid h-6 w-6 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-honey/60"
            >
              <motion.span
                className="block h-1.5 w-1.5 rounded-full"
                animate={{
                  scale: i === index ? 1.35 : 1,
                  backgroundColor:
                    i === index ? config.accentColor : light ? 'rgba(58,35,16,0.25)' : i < index ? 'rgba(255,244,224,0.5)' : 'rgba(255,244,224,0.2)',
                }}
                transition={{ duration: 0.6 }}
              />
            </button>
          </li>
        ))}
      </ol>
    </motion.nav>
  );
}
