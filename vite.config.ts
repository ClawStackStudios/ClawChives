/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path";
import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 4545,
      // Dev mode binds strictly to loopback (localhost), Prod mode allows all interface binds (LAN/Docker)
      host: isDev ? false : true,
      strictPort: true,
      // Dev mode defaults to safe loopback validation (undefined), Prod mode allows wide binds (true)
      allowedHosts: isDev ? undefined : true,
      proxy: {
        '/api': 'http://localhost:4646'
      }
    },
    preview: {
      port: 4545,
      host: true,
      strictPort: true,
      allowedHosts: true,
      proxy: {
        '/api': 'http://localhost:4646'
      }
    },
    test: {
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        '**/.cache/**',
        '**/.crustagent/**',
        'tests/entropy.test.js.bak'
      ]
    }
  };
});
