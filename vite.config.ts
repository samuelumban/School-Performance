import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // Ini memastikan process.env.API_KEY diganti dengan value dari Vercel saat build
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});