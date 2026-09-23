import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // In production (Vercel), VITE_API_BASE_URL points to the ALB.
  // In development, fall back to localhost proxy.
  const apiBase = env.VITE_API_BASE_URL || 'http://localhost:8000';
  const wsBase  = env.VITE_WS_BASE_URL  || 'ws://localhost:8000';

  return {
    plugins: [react()],

    // Expose env vars to the app bundle
    define: {
      __API_BASE_URL__: JSON.stringify(apiBase),
      __WS_BASE_URL__:  JSON.stringify(wsBase),
    },

    server: {
      port: 3000,
      open: false,
      // Dev-only proxy — not used in production (Vercel serves static files)
      proxy: {
        '/api': {
          target: apiBase,
          changeOrigin: true,
        },
        '/ws': {
          target: wsBase,
          ws: true,
        },
      },
    },
  };
});
