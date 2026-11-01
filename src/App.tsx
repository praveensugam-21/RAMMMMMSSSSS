import { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { Stage } from './components/stage/Stage';
import { AudioProvider } from './engine/audio/AudioProvider';
import { preloadScene } from './engine/assets/imageCache';
import { TimelineProvider } from './engine/timeline/TimelineProvider';
import { SCENES } from './film/scenes';

export default function App() {
  // Warm the first two scenes while the title card is showing
  useEffect(() => {
    preloadScene(SCENES[0]);
    preloadScene(SCENES[1]);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <AudioProvider>
        <TimelineProvider scenes={SCENES}>
          <Stage />
        </TimelineProvider>
      </AudioProvider>
    </MotionConfig>
  );
}
