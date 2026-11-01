/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: {
        // Matches useOrientation(), phones held upright
        tall: { raw: '(max-aspect-ratio: 4/5)' },
      },
      colors: {
        ink: '#0A0A0C',
        midnight: '#0B1426',
        dusk: '#2A3F5F',
        amber: '#E8A33D',
        honey: '#F4C77A',
        cream: '#FFF4E0',
        paper: '#FBF3E4',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        hand: ['Caveat', '"Homemade Apple"', 'cursive'],
        tamil: ['"Noto Serif Tamil"', '"Nirmala UI"', '"Latha"', 'serif'],
      },
    },
  },
  plugins: [],
};
