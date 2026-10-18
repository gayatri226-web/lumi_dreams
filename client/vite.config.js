import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, /api calls go to the Express server on :5000.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: { manualChunks: { react: ['react', 'react-dom', 'react-router-dom'], motion: ['framer-motion', 'gsap', '@gsap/react'] } },
    },
  },
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:5000' },
  },
});
