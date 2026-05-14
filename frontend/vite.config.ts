import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/ws': {
        target: 'ws://backend:8000',
        ws: true,
      },
      // Proxy backend endpoints directly
      '/controls': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/upload': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/upload-url': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/ingest': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/pdfs': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/dashboard': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/compliance-score': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/violations': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});

// Made with Bob
