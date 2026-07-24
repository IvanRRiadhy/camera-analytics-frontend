import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Generate a random boot token when the dev server starts
const serverBootToken = Math.random().toString(36).substring(2, 15);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'boot-token-api',
      configureServer(server) {
        server.middlewares.use('/api/boot-token', (_req, res) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ bootToken: serverBootToken }));
        });
      },
    },
  ]
});
