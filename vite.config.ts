import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build works on Vercel, Netlify or any static host / sub-path
export default defineConfig({
  base: './',
  plugins: [react()],
  // Hashed bundles go to /static, /assets is reserved for the film's photos and audio
  build: { target: 'es2020', assetsDir: 'static', chunkSizeWarningLimit: 800 },
});
