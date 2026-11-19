import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // De app bevat three.js en React in één bundel (±1,5 MB); audio staat los.
    chunkSizeWarningLimit: 2000,
  },
});
