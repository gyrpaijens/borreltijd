import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // De app bevat three.js, audio en afbeeldingen in één bundel (±5,6 MB).
    chunkSizeWarningLimit: 8000,
  },
});
