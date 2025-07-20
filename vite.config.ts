import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path-browserify'
import { fileURLToPath } from 'url';
import { dirname } from 'path-browserify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/pets': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
        '/auth': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
        '/messages': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        path: 'path-browserify',
      },
    },
  };
});
