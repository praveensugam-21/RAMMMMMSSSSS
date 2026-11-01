/**
 * ─────────────────────────────────────────────────────────────
 *  PERSONALIZATION — the only file you need to edit
 * ─────────────────────────────────────────────────────────────
 *  Names, words, music and photos for the film live here
 *  Paths are relative to /public (e.g. "assets/audio/music.mp3")
 */

export interface PhotoMemory {
  src: string;
  caption?: string;
  /** CSS object-position that keeps her face inside the polaroid crop, e.g. '75% 40%' */
  focus?: string;
  /** Show the whole photo at its own shape, never cropped */
  full?: boolean;
}

export interface FilmConfig {
  recipientName: string;
  senderName: string;
  /** The closing words after the last photo: English wishes, then the Tamil lines */
  finale: { wishes: string[]; tamil: string[] };
  /** The opening title card */
  intro: { dedication: string; title: string; cta: string; soundHint: string };
  /** The big birthday title on the last page */
  headline: { greeting: string; name: string };
  /** Initials pressed into the wax seal, and what appears in handwriting when it is tapped */
  seal: { initials: string; reveal: string };
  /** ISO date, shown softly under the birthday title */
  birthdayDate: string;
  /** Five story lines, one per scene (S1–S5). Use commas, never full stops */
  storyLines: [string, string, string, string, string];
  /** The letter. Each newline is one handwritten line, a blank line starts a new paragraph */
  letterText: string;
  letterSignoff: string;
  musicTrack: string;
  /** Plays when the photos start, crossfading from the film music. Leave empty to keep the film music */
  memoriesSong: string;
  heartbeatSfx: string;
  accentColor: string;
  optionalPhotos: PhotoMemory[];
  film: {
    /** In S4 the film waits for a long press, auto-continues after `holdAutoAfter` seconds */
    holdToTouch: boolean;
    holdAutoAfter: number;
    /** Film grain opacity, ~0.03 is subtle */
    grain: number;
    musicVolume: number;
    /** Show expected filenames on placeholder silhouettes when an asset is missing */
    showPlaceholderLabels: boolean;
  };
  media: {
    /** Set true once you have exported .avif twins next to every .webp */
    avif: boolean;
    /** Responsive widths, e.g. [1280, 2560] expects plate-1280.webp, plate-2560.webp. Empty = single file */
    widths: number[];
  };
}

export const config: FilmConfig = {
  recipientName: 'Rams',
  senderName: "Ramiyaa's Praveee",
  birthdayDate: '2026-11-02',
  finale: {
    wishes: [
      'May your smile never fade,',
      'may every tomorrow bring you new reasons to shine,',
      'and may happiness always find its way to you ❤️',
    ],
    tamil: [
      'எல்லாக் காத்திருப்புக்கும் ஒரு அர்த்தம் உண்டு,',
      'அந்தக் காத்திருப்பு அன்புக்குரியவர்களுக்கு மட்டுமே...',
      'திசை தவறினாலும் உன்னை நோக்கியே வந்து சேருவேன்...',
    ],
  },
  intro: {
    dedication: 'for my Ramiyaa',
    title: 'Where Our Hands Meet',
    cta: 'tap the heart',
    soundHint: 'best with sound 🎧',
  },
  headline: { greeting: 'Happyyyyyy Birthdayyyyy,', name: 'Ramsssssss' },
  seal: { initials: 'RP', reveal: "Ramiyaa's Praveee" },

  storyLines: [
    'Somewhere between two hearts, there is a distance...',
    'One hand has been waiting, not because it has nowhere else to go, but because it knows where it wants to be...',
    'The other hand wants to reach back, but sometimes fear makes even the smallest step feel impossible...',
    'And then, one day, fear becomes smaller than the feeling of wanting to hold on...',
    "Maybe happiness was never about finding the perfect moment, maybe it was always about finally finding each other's hands...",
  ],

  letterText: `My love,

Happy birthday, to the person who taught my hands where they belong,
I have tried many times to write what you mean to me, and every time the words feel too small,
so let me say it simply, you are my favourite place to be

Thank you for every quiet moment, every laugh that made my whole day lighter,
and for the courage it took to reach back, even when it felt impossible

Today I don't wish you a perfect year, I wish you a real one,
full of warm mornings, brave beginnings and hands that never let go,
and as long as you want them, mine will always be here`,
  letterSignoff: 'Always yours,',

  musicTrack: 'assets/audio/music.mp3',
  memoriesSong: 'assets/audio/memories.mp3',
  heartbeatSfx: 'assets/audio/heartbeat.mp3',
  accentColor: '#E8A33D',

  // Shown at the very end, dropping onto the table one by one. The last one lands in the middle
  // Every photo contains Ramiyaa (checked by face matching), `focus` centres the crop on her face
  // Add a caption to any of them, e.g. { src: 'assets/photos/05.webp', caption: 'that day' }
  optionalPhotos: [
    { src: 'assets/photos/01.webp', focus: '82% 50%' },
    { src: 'assets/photos/02.webp', focus: '50% 30%' },
    { src: 'assets/photos/03.webp', focus: '93% 50%' },
    { src: 'assets/photos/05.webp', focus: '50% 54%' },
    { src: 'assets/photos/06.webp', focus: '50% 0%' },
    { src: 'assets/photos/07.webp', focus: '50% 57%' },
    { src: 'assets/photos/08.webp', focus: '100% 50%' },
    { src: 'assets/photos/09.webp', focus: '50% 23%' },
    { src: 'assets/photos/10.webp', focus: '75% 50%' },
    { src: 'assets/photos/11.webp', focus: '50% 1%' },
    { src: 'assets/photos/12.webp', focus: '99% 50%' },
    { src: 'assets/photos/13.webp', focus: '50% 28%' },
    { src: 'assets/photos/14.webp', focus: '75% 50%' },
    { src: 'assets/photos/15.webp', focus: '50% 0%' },
    { src: 'assets/photos/16.webp', focus: '0% 50%' },
    { src: 'assets/photos/17.webp', focus: '50% 100%' },
    { src: 'assets/photos/18.webp', focus: '76% 50%' },
    { src: 'assets/photos/19.webp', focus: '19% 50%' },
    { src: 'assets/photos/21.webp', full: true },
    { src: 'assets/photos/22.webp', focus: '71% 50%' },
    { src: 'assets/photos/bestest.webp', focus: '50% 74%' },
    { src: 'assets/photos/ramscls.webp', focus: '41% 50%' },
    { src: 'assets/photos/25.webp', focus: '50% 73%' },
    { src: 'assets/photos/26.webp', focus: '0% 50%' },
    { src: 'assets/photos/27.webp', focus: '50% 0%' },
    { src: 'assets/photos/28.webp', focus: '50% 0%' },
    { src: 'assets/photos/29.webp', focus: '50% 0%' },
    { src: 'assets/photos/30.webp', focus: '50% 0%' },
    { src: 'assets/photos/herbest.webp', focus: '50% 10%', caption: 'happy birthday, Rams ❤️' },
  ],

  film: {
    holdToTouch: true,
    holdAutoAfter: 6,
    grain: 0.035,
    musicVolume: 0.8,
    showPlaceholderLabels: false,
  },

  media: {
    avif: false,
    widths: [],
  },
};
