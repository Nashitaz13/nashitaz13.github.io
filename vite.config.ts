import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  publicDir: false,
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    fs: {
      strict: true,
      allow: ['.'],
      // Source documents are not application assets, even during local development.
      deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/*.md', '**/*.pdf', '**/docs/**', '**/design/**'],
    },
  },
  preview: { host: '127.0.0.1', port: 4174, strictPort: true },
  build: { sourcemap: false },
});
