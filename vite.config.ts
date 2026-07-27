import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy de desarrollo: /api/* -> backend local (v1 incluido)
const LOCAL_BACKEND = 'http://localhost:3000/v1';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: LOCAL_BACKEND,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
