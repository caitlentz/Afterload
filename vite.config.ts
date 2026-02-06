import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [tailwindcss(), react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        target: 'es2020',
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules/react-dom/') ||
                  id.includes('node_modules/react/') ||
                  id.includes('node_modules/scheduler')) {
                return 'vendor-react';
              }
              if (id.includes('node_modules/@supabase/')) {
                return 'supabase';
              }
              if (id.includes('node_modules/framer-motion/')) {
                return 'framer-motion';
              }
            }
          }
        }
      }
    };
});
