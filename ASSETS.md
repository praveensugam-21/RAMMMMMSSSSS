# ASSETS — Shot List & Hands Continuity Bible

The film's realism comes from **photographs**, not code. Code only moves, grades and times them.
Every file below is optional, because a missing file is replaced by a glowing placeholder that shows its expected path. Add them one by one and the film upgrades itself.

All paths are relative to `public/`.

> **Currently in place (AI-generated with FLUX on Replicate, cut out locally with rembg):**
> `assets/hands/boy.webp` and `assets/hands/girl.webp` (one pair, shared by S1–S4 for perfect continuity),
> `assets/s4/touch/frame_0001…0036.webp` (the real fingertip contact dissolving into the interlaced hold),
> `assets/s5/held.webp`, and 30 photos in `assets/photos/`.
> Still procedural or synthesized: background plates (dark haze), music and heartbeat.
> To swap in an AI video for the touch later, render it between `frame_0001` and the last frame, export 36 frames, and keep `contactFrame: 0`.

---

## 1. Hands Continuity Bible

Shoot or generate **one locked reference** of each hand first, then derive every other shot from it. Use the same model, seed, LoRA or reference image, and the same person if you photograph real hands.

### Boy — always on the LEFT, reaching right
| Trait | Spec |
|---|---|
| Build | Natural masculine proportions, relaxed, **not** muscular |
| Skin | Visible pores, faint surface veins on the back of the hand, real knuckle creases, subtle tone variation (slightly warmer knuckles) |
| Nails | Natural, short, unpolished, faint ridges are fine |
| Posture | Relaxed, fingers gently extended, never stiff or clawed |
| Forbidden | Plastic smoothness, airbrushing, extra or missing fingers, rings, watches |

### Girl — always on the RIGHT, reaching left
| Trait | Spec |
|---|---|
| Build | Delicate natural fingers, slender but real |
| Skin | Tiny pores, **very fine vellus hair** on the back of the hand and wrist, visible only where the rim light grazes it |
| Nails | Natural, short to medium, unpolished or sheer nude |
| Bracelet | **Thin gold cable-chain bracelet**, links about 1.5 mm, with a **small round spring-ring clasp**. It sits **just below the wrist bone**, with the clasp on the outer side of the wrist (facing camera) and soft specular highlights |
| Forbidden | Hairless or poreless skin, heavy retouching, a different bracelet in any shot, the bracelet sliding up the forearm |

### Locked across every scene
- Skin tones (pick hex swatches from the reference and check every export against them)
- Hand proportions and finger lengths (overlay new shots on the reference at 50% opacity before approving)
- Bracelet design, link size, clasp and position
- Camera height, lens and key light direction

---

## 2. Photographic Look

| Setting | Value |
|---|---|
| Lens | 85–100 mm (macro 100 mm for S4) |
| Aperture | f/2–f/2.8, shallow depth of field |
| Light | Low key. **Key light from upper left**, soft. Cool rim light from behind for S1–S3, warm sunset backlight for S5 |
| Camera height | Identical in every shot, at hand level, lens parallel to the table |
| Background | Pure black (cutouts) or a dark midnight-blue haze (plates) |
| Grade | Shoot neutral, the film grades blue → amber in code |

**AI generation tip:** keep one reference image per hand and use image-to-image or IP-Adapter / reference-only control for every shot. Prompt base:
> *macro photograph of a [man's / woman's] hand reaching sideways, natural skin texture, visible pores, [faint veins / fine vellus hair lit by rim light], natural unpolished nails, [thin gold cable-chain bracelet with small round clasp just below the wrist bone], black background, low-key lighting, key light from upper left, 100mm lens, f/2.8, shallow depth of field, photorealistic, no retouching*

Reject any output with wrong finger counts, fused fingers or a changed bracelet.

---

## 3. The Rig, how cutouts must be framed

Hand cutouts are **transparent WebP, 2:1 canvas, 2560 × 1280 px**. The code positions every cutout by its fingertip, so the fingertip must sit on these exact pixels (numbers live in `src/film/handRig.ts`):

| | Fingertip (index finger) | Bracelet centre | Wrist / forearm |
|---|---|---|---|
| **Boy** `boy.webp` | x 96 %, y 50 % → **(2458, 640)** | — | exits the **left** edge |
| **Girl** `girl.webp` | x 4 %, y 50 % → **(102, 640)** | x 64 %, y 50 % → **(1638, 640)** | exits the **right** edge |

- The hand points horizontally, palm facing down or slightly toward camera.
- Leave the forearm running off the canvas edge, never crop at the wrist.
- Soft natural edges, no hard halo. Export with alpha (`cwebp -q 82 -alpha_q 90`).
- On phones the same cutouts are rotated -58° automatically (his enters bottom left, hers top right), so no extra hand files are needed.

---

## 4. Shot List

### S1 — The Distance (~10 s)
| File | Size | Notes |
|---|---|---|
| `assets/s1/plate.webp` | 2560 × 1072 (2.39:1) | Midnight blue `#0B1426` haze, empty, faint volumetric light |
| `assets/s1/plate-portrait.webp` | 1080 × 1920 | *Optional* vertical crop of the same plate |
| `assets/s1/boy.webp` | 2560 × 1280 cutout | Extended, patient, fingers gently open |
| `assets/s1/girl.webp` | 2560 × 1280 cutout | **Slightly withdrawn**, fingers softly curled toward the palm |

### S2 — The Waiting (~12 s)
| File | Size | Notes |
|---|---|---|
| `assets/s2/plate.webp` | 2560 × 1072 | As S1, a little more light on the left |
| `assets/s2/boy.webp` | cutout | Reaching forward, **cool rim light** along the top edge of the fingers |
| `assets/s2/girl.webp` | cutout | Same pose as S1 (it is defocused in code) |
| `assets/s2/rim.webp` | 2560 × 1072 | *Optional* light pass on black, blended with **screen** |

### S3 — The Hesitation (~14 s)
| File | Size | Notes |
|---|---|---|
| `assets/s3/plate.webp` | 2560 × 1072 | Focus falls on the right side |
| `assets/s3/boy.webp` | cutout | Waiting, still (defocused in code) |
| `assets/s3/girl.webp` | cutout | Reaching, fingers more open than S1. **Bracelet clearly visible**, the code sweeps one glint across it at the rig's bracelet position |

### S4 — The First Touch (~16 s)
| File | Size | Notes |
|---|---|---|
| `assets/s4/plate.webp` | 2560 × 1072 | Macro background, very dark |
| `assets/s4/boy.webp` | cutout | Index fingertip leading, macro detail (skin texture matters most here) |
| `assets/s4/girl.webp` | cutout | Index fingertip leading, bracelet in frame |
| `assets/s4/touch/frame_0001.webp` … `frame_0036.webp` | 1920 × 804 each | **The touch & intertwine sequence**, see below |

**Touch sequence, 36 frames (WebP, about 80–140 KB each):**
| Frames | Action |
|---|---|
| 0001–0014 | Final approach, fingertips drift together. Frame 0001 matches the cutouts' macro framing |
| **0015** | **Contact**, fingertips just touching (this frame is held for the 1.2 s silence) |
| 0016–0028 | Her fingers slide between his, both hands rotate gently, fingers interlace |
| 0029–0036 | Settle into a relaxed hand-hold, **bracelet visible**, small breathing motion |

Render from a real video clip (shoot at 50–60 fps, pick 36 frames) or an image-to-video model locked to the reference hands. **Never** fake finger bending in CSS. Check the anatomy on every interlaced frame: four fingers each, correct knuckle order, thumbs on the correct sides.

Export: `ffmpeg -i touch.mov -vf "fps=12,scale=1920:-2,crop=1920:804" -c:v libwebp -quality 80 public/assets/s4/touch/frame_%04d.webp`
Then adjust the frame count or contact frame in `src/film/scenes.ts` (`sequence.count`, `sequence.contactFrame`, 0-based).
On phones the sequence is centre-cropped, so keep the touch in the middle third of the frame.

### S5 — The Birth of Happiness (~14 s)
| File | Size | Notes |
|---|---|---|
| `assets/s5/held.webp` | 2560 × 1072 | **The hero shot**, a close-up of the held hands, warm **sunset backlight**, golden bokeh. His skin detail, her fine hair glowing in the backlight, the bracelet sharp |
| `assets/s5/held-portrait.webp` | 1080 × 1920 | *Optional* vertical crop |
| `assets/s5/bokeh.webp` | 2560 × 1072 | *Optional* bokeh on black, blended with screen. Procedural bokeh is always drawn too |

### S6 — Birthday Surprise
No photos needed, it is typographic. Optional memories go in `assets/photos/` and are listed in `config.optionalPhotos`.

### Audio
| File | Notes |
|---|---|
| `assets/audio/music.mp3` | Soft piano and strings, 90–120 s, loops. A gentle generative pad plays if it is missing |
| `assets/audio/heartbeat.mp3` | One "lub-dub", under 1 s, no tail. A synthesized heartbeat plays if it is missing |

The music level and warmth are automated per scene in code (it thins to near silence before the touch, the heartbeat lands on contact, then the music swells back warmer through an opening low-pass filter), so the track itself can stay steady.

---

## 5. Optimization Budget (~15 MB total)

| Group | Target |
|---|---|
| 5 plates × ~250 KB | ~1.3 MB |
| 8 hand cutouts × ~180 KB | ~1.5 MB |
| Touch sequence 36 × ~110 KB | ~4 MB |
| Portrait crops (optional) | ~1 MB |
| Music (128 kbps, 100 s) | ~1.6 MB |
| Fonts + app | ~0.6 MB |

- **AVIF:** export an `.avif` twin next to each `.webp` (`avifenc -q 60`), then set `media.avif: true` in `src/config.ts`.
- **srcset:** export width variants such as `plate-1280.webp` and `plate-2560.webp` (keep the plain `plate.webp` too), then set `media.widths: [1280, 2560]`.
- The next scene is always preloaded while the current one plays, and S1 and S2 preload during the title card.
