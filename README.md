# Where Our Hands Meet ❤️

A 90-second interactive short film for one person's birthday.
Two hands, a distance, a hesitation, a touch, then a letter.

**distance → patience → fear → touch → happiness → birthday**

**Live:** https://praveensugam-21.github.io/RAMMMMMSSSSS/

Built with React, Vite, TypeScript, Tailwind CSS, Framer Motion and Web Audio. Frontend only, a static site with no backend.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs to dist/
npm run preview    # serve the production build
```

The film plays end to end straight away. Every missing photo is shown as a glowing silhouette labelled with the file it expects, and missing audio is replaced by a soft generated score and heartbeat.

---

## 1. Personalize: `src/config.ts`

This is the only file you need to edit.

| Field | What it does |
|---|---|
| `recipientName` | Title card, birthday heading, envelope |
| `senderName` | Wax seal initial and the letter signature |
| `birthdayDate` | ISO date shown under the heading |
| `storyLines` | Five lines, one per scene. **Use commas, never full stops** |
| `letterText` | One handwritten line per newline, a blank line starts a paragraph |
| `letterSignoff` | e.g. "Always yours," |
| `musicTrack`, `heartbeatSfx` | Audio paths under `public/` |
| `accentColor` | Progress dot highlight |
| `optionalPhotos` | Up to 4 small prints shown after the signature |
| `film.holdToTouch` | S4 waits for "hold to bring them together" (auto-continues after `holdAutoAfter` s) |
| `film.grain` | Film grain opacity (~0.03) |
| `film.showPlaceholderLabels` | Set `false` before sending if any placeholder remains |
| `media.avif`, `media.widths` | Enable AVIF and srcset once you have exported them |

## 2. Add the photographs

Follow **[ASSETS.md](ASSETS.md)**. It holds the hands continuity bible, the exact cutout framing (fingertip pixel positions), the shot list for every scene, the 36-frame touch sequence spec and the size budget.
Drop files into `public/assets/…` and refresh. Nothing else changes.

## 3. Direct it

Open a single frame with the director's preview:

```
/?scene=4&t=6.2&still   S4 frozen at the moment of contact (no pause veil)
/?scene=3&t=11          S3 from 11 s, playing
/?scene=6               jump to the birthday letter
```

All timing lives in **`src/film/scenes.ts`**, which reads like a shot list:
- `pose.reach` is 0 (resting at the edge) → 1 (fingertips touching), keyframed in seconds
- `camera` controls push-ins, dolly origin, handheld sway and breathing
- `fx.warmth` sets the colour grade from 0 (midnight blue) to 1 (amber)
- `cues` handle music level, warmth and the heartbeat, at exact scene times
- `hold` is the hold-to-touch gate

The touch beat is defined once (`CONTACT`, `FREEZE`) and everything in S4 hangs off it: music thins at 4.3 s, contact and heartbeat at 6.0 s, a 1.2 s frozen silence, then the grade, bloom, particles, intertwine and the warm swell.

---

## Controls

| Input | Action |
|---|---|
| Tap / click, scroll down, swipe up, `Space`, `→`, `Enter` | Next scene |
| `←` | Previous scene |
| Long-press or hold `Space` in S4 | Bring the hands together (scrubs the touch) |
| `P` / `K` | Pause / play |
| `M` | Mute |
| Progress dots | Jump to a scene |

## Architecture

```
src/
  config.ts                 personalization, the only file to edit
  film/                     the film as data, no React
    scenes.ts               the script: timing, poses, camera, cues, fx per scene
    handRig.ts              continuity rig: fingertip anchors, sizes, paths per orientation
    assets.ts               asset manifest + URL helpers
    keyframes.ts, easing.ts time-based keyframe sampling with named emotional eases
    types.ts                SceneSpec and friends
  engine/                   playback, no visuals
    timeline/               central rAF clock: one MotionValue per scene, cues, hold gate
    audio/                  Web Audio graph, crossfades, low-pass warmth, synth fallbacks
    assets/                 image probing, sequence loading, next-scene preloading
    filmBus.ts              timeline → audio / captions events
  components/
    stage/Stage.tsx         crossfades scenes, film look, player chrome
    scene/                  FilmScene (generic renderer), Camera, StoryLine, HoldToTouch
      layers/               Plate, Hand, Overlay, image Sequence, bracelet glint
      registry.ts           scene kind → component
    fx/                     colour grade, haze, bloom, particles, light leaks, bokeh, grain
    birthday/               S6: envelope, handwritten letter, memories
    media/                  <Photo> (AVIF/srcset), placeholder silhouettes
    ui/                     intro, progress dots, controls, captions
  hooks/                    orientation, scene-time props, controls, idle
```

**How a frame is drawn:** the timeline advances the active scene's `MotionValue<number>` (seconds). Every layer derives its transform and opacity from that value with `useTransform`, so playback, pause, skipping and hold-to-scrub never re-render React, and only `transform` and `opacity` animate. Rack focus crossfades to a pre-blurred copy rather than animating a blur filter.

**Adding a scene:** append a `SceneSpec` to `SCENES`. For a completely new kind of scene, add a component to `components/scene/registry.ts`. The progress dots adapt automatically.

## Responsive, accessibility, performance

- **Desktop:** 2.39:1 letterbox (bars computed in CSS from the viewport).
- **Phones (portrait):** vertical reframe with thin bars, his hand from the bottom left and hers from the top right (same cutouts, rotated by the rig), plus optional `-portrait` plate crops.
- **Reduced motion:** camera moves, sway, blur reveals and ambient drift are disabled, and scenes crossfade.
- Story lines are announced to screen readers, the heartbeat shows as a caption when muted, every control is keyboard reachable, and the letter keeps its full text for screen readers.
- Next-scene preloading, decoded images, canvas particles with a pre-rendered sprite, and a capped timeline step that keeps sync on slow devices.

## Deploy

Static output in `dist/`. The build uses a relative base, so it works at a root domain or a sub-path.

- **GitHub Pages (set up):** every push to `main` builds and publishes through `.github/workflows/deploy.yml`. One-time setting: repo → Settings → Pages → Source: **GitHub Actions**.
- **Vercel:** import the repo, framework "Vite". `vercel.json` is included.
- **Netlify:** drag `dist/` onto app.netlify.com/drop, or connect the repo (`netlify.toml` is included).
- **GitHub Pages / any host:** upload the contents of `dist/`.

Hashed app bundles go to `/static` (cached immutably). Your photos stay in `/assets`, so replacing one is picked up on the next visit.

## Before you send it

- [ ] Names, date, letter and story lines edited in `src/config.ts`
- [ ] All assets from ASSETS.md in place, no glowing placeholders left
- [ ] `film.showPlaceholderLabels: false`
- [ ] Hands checked against the continuity bible in every scene (bracelet, finger lengths, skin tone)
- [ ] Watched once on a phone and once on a laptop, with and without sound
